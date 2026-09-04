import { query, queryOne } from '../config/database.js';

export type GuestStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

export interface Guest {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: GuestStatus;
  guest_group: string | null;
  plus_one: boolean;
  dietary_restrictions: string | null;
  notes: string | null;
  /** Size of the party, including the named guest. */
  guest_count: number;
  /** When this guest answered, or null if they never have. */
  rsvp_responded_at: Date | null;
  /** When the invitation was emailed, or null if it never was. */
  invitation_sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGuestInput {
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: GuestStatus;
  guest_group?: string;
  plus_one?: boolean;
  dietary_restrictions?: string;
  notes?: string;
  guest_count?: number;
  rsvp_responded_at?: Date | null;
}

export interface UpdateGuestInput {
  name?: string;
  email?: string | null;
  phone?: string | null;
  status?: GuestStatus;
  guest_group?: string | null;
  plus_one?: boolean;
  dietary_restrictions?: string | null;
  notes?: string | null;
  guest_count?: number;
  rsvp_responded_at?: Date | null;
}

export const GuestModel = {
  /** Records that the invitation reached this guest, so a resend skips them. */
  async markInvited(id: string): Promise<void> {
    await query('UPDATE guests SET invitation_sent_at = NOW() WHERE id = $1', [id]);
  },

  async findById(id: string): Promise<Guest | null> {
    return queryOne<Guest>(
      'SELECT * FROM guests WHERE id = $1',
      [id]
    );
  },

  async findByUserId(userId: string): Promise<Guest[]> {
    return query<Guest>(
      'SELECT * FROM guests WHERE user_id = $1 ORDER BY name ASC',
      [userId]
    );
  },

  async findByUserIdAndStatus(userId: string, status: GuestStatus): Promise<Guest[]> {
    return query<Guest>(
      'SELECT * FROM guests WHERE user_id = $1 AND status = $2 ORDER BY name ASC',
      [userId, status]
    );
  },

  async create(input: CreateGuestInput): Promise<Guest> {
    const result = await queryOne<Guest>(
      `INSERT INTO guests (user_id, name, email, phone, status, guest_group, plus_one, dietary_restrictions, notes, guest_count, rsvp_responded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        input.user_id,
        input.name,
        input.email || null,
        input.phone || null,
        input.status || 'pending',
        input.guest_group || null,
        input.plus_one || false,
        input.dietary_restrictions || null,
        input.notes || null,
        input.guest_count ?? 1,
        input.rsvp_responded_at ?? null,
      ]
    );

    if (!result) {
      throw new Error('Failed to create guest');
    }

    return result;
  },

  async update(id: string, input: UpdateGuestInput): Promise<Guest | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(input.email || null);
    }
    if (input.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(input.phone || null);
    }
    if (input.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.guest_group !== undefined) {
      fields.push(`guest_group = $${paramIndex++}`);
      values.push(input.guest_group || null);
    }
    if (input.plus_one !== undefined) {
      fields.push(`plus_one = $${paramIndex++}`);
      values.push(input.plus_one);
    }
    if (input.dietary_restrictions !== undefined) {
      fields.push(`dietary_restrictions = $${paramIndex++}`);
      values.push(input.dietary_restrictions || null);
    }
    if (input.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(input.notes || null);
    }
    if (input.guest_count !== undefined) {
      fields.push(`guest_count = $${paramIndex++}`);
      values.push(input.guest_count);
    }
    if (input.rsvp_responded_at !== undefined) {
      fields.push(`rsvp_responded_at = $${paramIndex++}`);
      values.push(input.rsvp_responded_at);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<Guest>(
      `UPDATE guests SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM guests WHERE id = $1 RETURNING id',
      [id]
    );
    return result.length > 0;
  },

  async countByUserId(userId: string): Promise<{ total: number; pending: number; confirmed: number; declined: number; maybe: number }> {
    const result = await queryOne<{ total: string; pending: string; confirmed: string; declined: string; maybe: string }>(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'declined') as declined,
        COUNT(*) FILTER (WHERE status = 'maybe') as maybe
       FROM guests WHERE user_id = $1`,
      [userId]
    );

    return {
      total: parseInt(result?.total || '0'),
      pending: parseInt(result?.pending || '0'),
      confirmed: parseInt(result?.confirmed || '0'),
      declined: parseInt(result?.declined || '0'),
      maybe: parseInt(result?.maybe || '0'),
    };
  },
};
