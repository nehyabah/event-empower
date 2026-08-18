import { query, queryOne } from '../config/database.js';
import { GuestStatus } from './Guest.js';

export type ReminderFrequency = 'daily' | 'every_3_days' | 'weekly' | 'biweekly' | 'monthly';
export type ReminderChannel = 'email' | 'sms' | 'both';

/** How many days each cadence waits before the next send. */
export const FREQUENCY_DAYS: Record<ReminderFrequency, number> = {
  daily: 1,
  every_3_days: 3,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

export interface GuestReminderSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  frequency: ReminderFrequency;
  channel: ReminderChannel;
  target_statuses: GuestStatus[];
  custom_message: string | null;
  stop_days_before: number;
  last_sent_at: Date | null;
  next_send_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateGuestReminderInput {
  enabled?: boolean;
  frequency?: ReminderFrequency;
  channel?: ReminderChannel;
  target_statuses?: GuestStatus[];
  custom_message?: string | null;
  stop_days_before?: number;
}

export interface GuestReminderLogEntry {
  id: string;
  user_id: string;
  guest_id: string | null;
  channel: string;
  destination: string | null;
  status: 'sent' | 'failed' | 'skipped';
  error: string | null;
  trigger: 'scheduled' | 'manual';
  sent_at: Date;
}

/** Next fire time for a cadence, measured from `from`. */
export const nextSendAt = (frequency: ReminderFrequency, from: Date = new Date()): Date => {
  const next = new Date(from);
  next.setDate(next.getDate() + FREQUENCY_DAYS[frequency]);
  return next;
};

export const GuestReminderModel = {
  async findByUserId(userId: string): Promise<GuestReminderSettings | null> {
    return queryOne<GuestReminderSettings>(
      'SELECT * FROM guest_reminder_settings WHERE user_id = $1',
      [userId]
    );
  },

  /** Read the row, creating the default (disabled) one on first access. */
  async getOrCreate(userId: string): Promise<GuestReminderSettings> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    const created = await queryOne<GuestReminderSettings>(
      `INSERT INTO guest_reminder_settings (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [userId]
    );

    if (!created) throw new Error('Failed to create reminder settings');
    return created;
  },

  async update(userId: string, input: UpdateGuestReminderInput): Promise<GuestReminderSettings> {
    await this.getOrCreate(userId);

    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (input.enabled !== undefined)          { fields.push(`enabled = $${i++}`);          values.push(input.enabled); }
    if (input.frequency !== undefined)        { fields.push(`frequency = $${i++}`);        values.push(input.frequency); }
    if (input.channel !== undefined)          { fields.push(`channel = $${i++}`);          values.push(input.channel); }
    if (input.target_statuses !== undefined)  { fields.push(`target_statuses = $${i++}`);  values.push(input.target_statuses); }
    if (input.custom_message !== undefined)   { fields.push(`custom_message = $${i++}`);   values.push(input.custom_message); }
    if (input.stop_days_before !== undefined) { fields.push(`stop_days_before = $${i++}`); values.push(input.stop_days_before); }

    // Turning reminders on schedules the first send; turning them off clears it.
    if (input.enabled === true) {
      fields.push(`next_send_at = COALESCE(next_send_at, NOW())`);
    } else if (input.enabled === false) {
      fields.push(`next_send_at = NULL`);
    }

    if (fields.length === 0) return this.getOrCreate(userId);

    fields.push('updated_at = NOW()');
    values.push(userId);

    const updated = await queryOne<GuestReminderSettings>(
      `UPDATE guest_reminder_settings SET ${fields.join(', ')} WHERE user_id = $${i} RETURNING *`,
      values
    );

    if (!updated) throw new Error('Failed to update reminder settings');
    return updated;
  },

  /** Enabled schedules whose next_send_at has come due. */
  async findDue(limit = 50): Promise<GuestReminderSettings[]> {
    return query<GuestReminderSettings>(
      `SELECT * FROM guest_reminder_settings
       WHERE enabled = TRUE AND next_send_at IS NOT NULL AND next_send_at <= NOW()
       ORDER BY next_send_at ASC
       LIMIT $1`,
      [limit]
    );
  },

  async markSent(userId: string, next: Date): Promise<void> {
    await query(
      `UPDATE guest_reminder_settings
       SET last_sent_at = NOW(), next_send_at = $2, updated_at = NOW()
       WHERE user_id = $1`,
      [userId, next]
    );
  },

  /** Stop the schedule without losing the user's other preferences. */
  async disable(userId: string): Promise<void> {
    await query(
      `UPDATE guest_reminder_settings
       SET enabled = FALSE, next_send_at = NULL, updated_at = NOW()
       WHERE user_id = $1`,
      [userId]
    );
  },

  async log(entry: {
    user_id: string;
    guest_id?: string | null;
    channel: string;
    destination?: string | null;
    status?: 'sent' | 'failed' | 'skipped';
    error?: string | null;
    trigger?: 'scheduled' | 'manual';
  }): Promise<void> {
    await query(
      `INSERT INTO guest_reminder_log (user_id, guest_id, channel, destination, status, error, trigger)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.user_id,
        entry.guest_id || null,
        entry.channel,
        entry.destination || null,
        entry.status || 'sent',
        entry.error || null,
        entry.trigger || 'scheduled',
      ]
    );
  },

  async recentLog(userId: string, limit = 25): Promise<GuestReminderLogEntry[]> {
    return query<GuestReminderLogEntry>(
      `SELECT * FROM guest_reminder_log WHERE user_id = $1 ORDER BY sent_at DESC LIMIT $2`,
      [userId, limit]
    );
  },

  /**
   * True when this guest was already contacted inside the window — guards
   * against a manual send and a scheduled tick double-mailing someone.
   */
  async wasRecentlyNotified(guestId: string, withinHours: number): Promise<boolean> {
    const row = await queryOne<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM guest_reminder_log
         WHERE guest_id = $1 AND status = 'sent' AND sent_at > NOW() - ($2 || ' hours')::interval
       ) AS exists`,
      [guestId, String(withinHours)]
    );
    return Boolean(row?.exists);
  },
};

/**
 * Cooperative lock so only one backend instance runs a scheduler tick when the
 * service is scaled to several replicas.
 */
export const SchedulerLockModel = {
  async acquire(name: string, ttlSeconds: number, owner: string): Promise<boolean> {
    const row = await queryOne<{ name: string }>(
      `INSERT INTO scheduler_locks (name, locked_until, locked_by, updated_at)
       VALUES ($1, NOW() + ($2 || ' seconds')::interval, $3, NOW())
       ON CONFLICT (name) DO UPDATE
         SET locked_until = NOW() + ($2 || ' seconds')::interval,
             locked_by = $3,
             updated_at = NOW()
         WHERE scheduler_locks.locked_until < NOW()
       RETURNING name`,
      [name, String(ttlSeconds), owner]
    );
    return Boolean(row);
  },

  async release(name: string, owner: string): Promise<void> {
    await query(
      `UPDATE scheduler_locks SET locked_until = NOW() - interval '1 second', updated_at = NOW()
       WHERE name = $1 AND locked_by = $2`,
      [name, owner]
    );
  },
};
