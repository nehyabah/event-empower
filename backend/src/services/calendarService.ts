import { query, queryOne } from '../config/database.js';
import { PlannerEventModel } from '../models/PlannerEvent.js';
import { VendorBookingModel, VendorProfileModel } from '../models/VendorProfile.js';
import { UserEventModel } from '../models/UserEvent.js';
import { plannerService } from './plannerService.js';
import { WorkspaceEventModel } from '../models/WorkspaceEvent.js';

/** Where a calendar entry came from. Drives colour and filtering in the UI. */
export type CalendarSource =
  | 'planner_event'
  | 'wedding'
  | 'todo_due'
  | 'vendor_booking'
  | 'expense_due'
  | 'rsvp_deadline'
  | 'workspace_event';

export interface CalendarEntry {
  /** Stable across requests — used as the ICS UID. */
  id: string;
  source: CalendarSource;
  title: string;
  description: string | null;
  /** YYYY-MM-DD. */
  date: string;
  /** HH:MM[:SS] or null for an all-day entry. */
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  /** event_type / booking_kind / expense category, depending on source. */
  category: string | null;
  /** Who the entry concerns — client, planner or vendor counterparty. */
  counterparty: string | null;
  /** Set when the entry is editable by the requesting user. */
  editable: boolean;
}

/** Postgres DATE columns arrive as Date or string depending on the driver path. */
export const toDateString = (value: Date | string | null | undefined): string | null => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return String(value).split('T')[0];
};

const byDateThenTime = (a: CalendarEntry, b: CalendarEntry) => {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  const at = a.start_time || '99:99';
  const bt = b.start_time || '99:99';
  return at < bt ? -1 : at > bt ? 1 : 0;
};

const todayString = () => new Date().toISOString().split('T')[0];

// ── Per-role collectors ──────────────────────────────────────────────────────

async function clientEntries(userId: string): Promise<CalendarEntry[]> {
  // Every source is independent, so they are fetched concurrently. The database
  // is remote (~340ms per round trip), which makes the number of sequential
  // queries — not the amount of data — the thing that decides how fast the
  // calendar loads.
  const [event, plannerEvents, bookings, todos, expenses] = await Promise.all([
    UserEventModel.findByUserId(userId),
    PlannerEventModel.findVisibleForClientUser(userId),
    query<{
      id: string; title: string | null; client_name: string; event_date: Date;
      start_time: string | null; end_time: string | null; location: string | null;
      event_type: string | null; booking_kind: string; status: string; business_name: string | null;
    }>(
      `SELECT vb.id, vb.title, vb.client_name, vb.event_date, vb.start_time, vb.end_time,
              vb.location, vb.event_type, vb.booking_kind, vb.status, vp.business_name
       FROM vendor_bookings vb
       LEFT JOIN vendor_profiles vp ON vp.id = vb.vendor_id
       WHERE vb.client_id = $1 AND vb.status <> 'cancelled'`,
      [userId]
    ),
    query<{ id: string; text: string; due_date: Date; list_title: string }>(
      `SELECT ti.id, ti.text, ti.due_date, tl.title AS list_title
       FROM todo_items ti
       JOIN todo_lists tl ON tl.id = ti.list_id
       WHERE tl.user_id = $1 AND ti.due_date IS NOT NULL AND ti.completed = FALSE`,
      [userId]
    ),
    query<{
      id: string; name: string; due_date: Date; amount: string; amount_paid: string; category: string;
    }>(
      `SELECT id, name, due_date, amount, amount_paid, category
       FROM expenses
       WHERE user_id = $1 AND due_date IS NOT NULL AND amount_paid < amount`,
      [userId]
    ),
  ]);

  const entries: CalendarEntry[] = [];
  const coupleNames =
    [event?.partner1_name, event?.partner2_name].filter(Boolean).join(' & ') || 'Our wedding';

  if (event?.event_date) {
    const date = toDateString(event.event_date);
    if (date) {
      entries.push({
        id: `wedding-${event.id}`,
        source: 'wedding',
        title: `${coupleNames} — Wedding day`,
        description: null,
        date,
        start_time: null,
        end_time: null,
        location: event.venue,
        category: 'wedding',
        counterparty: null,
        editable: false,
      });
    }
  }

  if (event?.rsvp_deadline) {
    const date = toDateString(event.rsvp_deadline);
    if (date) {
      entries.push({
        id: `rsvp-deadline-${event.id}`,
        source: 'rsvp_deadline',
        title: 'RSVP deadline',
        description: 'Last day for guests to respond to your invitation.',
        date,
        start_time: null,
        end_time: null,
        location: null,
        category: 'rsvp',
        counterparty: null,
        editable: false,
      });
    }
  }

  // Meetings the planner scheduled and chose to share.
  for (const pe of plannerEvents) {
    const date = toDateString(pe.event_date);
    if (!date) continue;
    entries.push({
      id: `planner-event-${pe.id}`,
      source: 'planner_event',
      title: pe.title,
      description: pe.description,
      date,
      start_time: pe.start_time,
      end_time: pe.end_time,
      location: pe.location,
      category: pe.event_type,
      counterparty: pe.planner_name || 'Your planner',
      // The planner owns these; the client sees them read-only.
      editable: false,
    });
  }

  // Bookings a vendor made against this couple.
  for (const b of bookings) {
    const date = toDateString(b.event_date);
    if (!date) continue;
    entries.push({
      id: `vendor-booking-${b.id}`,
      source: 'vendor_booking',
      title: b.title || `${b.business_name || 'Vendor'} — ${b.event_type || 'Booking'}`,
      description: null,
      date,
      start_time: b.start_time,
      end_time: b.end_time,
      location: b.location,
      category: b.booking_kind,
      counterparty: b.business_name,
      editable: false,
    });
  }

  // Task deadlines from the couple's own checklists.
  for (const t of todos) {
    const date = toDateString(t.due_date);
    if (!date) continue;
    entries.push({
      id: `todo-${t.id}`,
      source: 'todo_due',
      title: t.text,
      description: `Checklist: ${t.list_title}`,
      date,
      start_time: null,
      end_time: null,
      location: null,
      category: 'todo',
      counterparty: null,
      editable: false,
    });
  }

  // Payments falling due, so money shows up alongside the schedule.
  for (const e of expenses) {
    const date = toDateString(e.due_date);
    if (!date) continue;
    const balance = Number(e.amount) - Number(e.amount_paid);
    entries.push({
      id: `expense-${e.id}`,
      source: 'expense_due',
      title: `Payment due: ${e.name}`,
      description: `Outstanding balance ₦${balance.toLocaleString('en-NG')}`,
      date,
      start_time: null,
      end_time: null,
      location: null,
      category: e.category,
      counterparty: null,
      editable: false,
    });
  }

  return entries;
}

async function plannerEntries(plannerId: string): Promise<CalendarEntry[]> {
  const entries: CalendarEntry[] = [];

  // Two independent reads, overlapped: the planner's own calendar data, and
  // the vendor bookings against their clients.
  const [calendarData, vendorRows] = await Promise.all([
    plannerService.getCalendarData(plannerId),
    query<{
      id: string; title: string | null; client_name: string; event_date: Date;
      start_time: string | null; end_time: string | null; location: string | null;
      event_type: string | null; booking_kind: string; business_name: string | null;
      couple_names: string | null;
    }>(
      `SELECT vb.id, vb.title, vb.client_name, vb.event_date, vb.start_time, vb.end_time,
              vb.location, vb.event_type, vb.booking_kind, vp.business_name,
              CONCAT_WS(' & ', pc.partner1_name, pc.partner2_name) AS couple_names
       FROM vendor_bookings vb
       JOIN planner_clients pc ON pc.user_id = vb.client_id
       LEFT JOIN vendor_profiles vp ON vp.id = vb.vendor_id
       WHERE pc.planner_id = $1
         AND pc.invite_status = 'accepted'
         AND vb.status <> 'cancelled'`,
      [plannerId]
    ),
  ]);
  const { events, weddingDates, todoDueDates } = calendarData;

  for (const pe of events) {
    const date = toDateString(pe.event_date);
    if (!date) continue;
    entries.push({
      id: `planner-event-${pe.id}`,
      source: 'planner_event',
      title: pe.title,
      description: pe.description,
      date,
      start_time: pe.start_time,
      end_time: pe.end_time,
      location: pe.location,
      category: pe.event_type,
      counterparty: pe.client_name || null,
      editable: true,
    });
  }

  for (const w of weddingDates) {
    entries.push({
      id: `wedding-${w.client_id}`,
      source: 'wedding',
      title: `${w.client_name} — Wedding day`,
      description: null,
      date: w.event_date,
      start_time: null,
      end_time: null,
      location: null,
      category: 'wedding',
      counterparty: w.client_name,
      editable: false,
    });
  }

  for (const [i, t] of todoDueDates.entries()) {
    entries.push({
      id: `todo-${t.client_id}-${i}`,
      source: 'todo_due',
      title: t.item_text,
      description: `${t.client_name} · ${t.list_title}`,
      date: t.due_date,
      start_time: null,
      end_time: null,
      location: null,
      category: 'todo',
      counterparty: t.client_name,
      editable: false,
    });
  }

  // Vendor bookings against this planner's linked clients (fetched above).
  for (const b of vendorRows) {
    const date = toDateString(b.event_date);
    if (!date) continue;
    entries.push({
      id: `vendor-booking-${b.id}`,
      source: 'vendor_booking',
      title: b.title || `${b.business_name || 'Vendor'} — ${b.event_type || 'Booking'}`,
      description: b.business_name ? `${b.business_name} · ${b.couple_names || b.client_name}` : null,
      date,
      start_time: b.start_time,
      end_time: b.end_time,
      location: b.location,
      category: b.booking_kind,
      counterparty: b.couple_names || b.client_name,
      // The vendor owns these; the planner sees them read-only.
      editable: false,
    });
  }

  return entries;
}

async function vendorEntries(userId: string): Promise<CalendarEntry[]> {
  const profile = await VendorProfileModel.findByUserId(userId);
  if (!profile) return [];

  // Independent of each other, so overlapped.
  const [bookings, weddings] = await Promise.all([
    VendorBookingModel.findByVendorId(profile.id),
    query<{
      event_id: string; user_id: string; event_date: Date; venue: string | null;
      partner1_name: string | null; partner2_name: string | null;
    }>(
      `SELECT DISTINCT ue.id AS event_id, ue.user_id, ue.event_date, ue.venue,
              ue.partner1_name, ue.partner2_name
       FROM project_vendors pv
       JOIN user_events ue ON ue.id = pv.event_id
       WHERE pv.vendor_profile_id = $1
         AND pv.status <> 'cancelled'
         AND ue.event_date IS NOT NULL`,
      [profile.id]
    ),
  ]);

  const entries: CalendarEntry[] = bookings
    .filter((b) => b.status !== 'cancelled')
    .flatMap((b) => {
      const date = toDateString(b.event_date);
      if (!date) return [];
      return [{
        id: `vendor-booking-${b.id}`,
        source: 'vendor_booking' as const,
        title: b.title || `${b.client_name} — ${b.event_type || 'Booking'}`,
        description: b.notes,
        date,
        start_time: b.start_time,
        end_time: b.end_time,
        location: b.location,
        category: b.booking_kind,
        counterparty: b.client_name,
        editable: true,
      }];
    });

  // Wedding days of the couples this vendor is booked for (fetched above).
  for (const w of weddings) {
    const date = toDateString(w.event_date);
    if (!date) continue;
    const names = [w.partner1_name, w.partner2_name].filter(Boolean).join(' & ') || 'Client';
    entries.push({
      id: `wedding-${w.event_id}`,
      source: 'wedding',
      title: `${names} — Wedding day`,
      description: 'You are booked for this event.',
      date,
      start_time: null,
      end_time: null,
      location: w.venue,
      category: 'wedding',
      counterparty: names,
      editable: false,
    });
  }

  return entries;
}


/**
 * Shared workspace events, for whichever role is asking.
 *
 * The model decides visibility: couples and planners see everything on their
 * wedding, vendors only what they created or were tagged in.
 */
async function workspaceEventEntries(userId: string): Promise<CalendarEntry[]> {
  const events = await WorkspaceEventModel.findVisibleTo(userId);

  return events.flatMap((e) => {
    const date = toDateString(e.event_date);
    if (!date) return [];

    const tagged = (e.participants || []).map((p) => p.name).filter(Boolean);

    return [{
      id: `workspace-event-${e.id}`,
      source: 'workspace_event' as const,
      title: e.title,
      description: [e.description, tagged.length ? `With: ${tagged.join(', ')}` : null]
        .filter(Boolean)
        .join('\n') || null,
      date,
      start_time: e.start_time,
      end_time: e.end_time,
      location: e.location,
      category: e.event_type,
      counterparty: e.couple_names || e.created_by_name || null,
      // Only the creator may change it; everyone else sees it read-only.
      editable: e.created_by === userId,
    }];
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

export const calendarService = {
  /** Every calendar entry visible to a user, whatever their role. */
  async getEntries(userId: string, userType: string): Promise<CalendarEntry[]> {
    // The role's own sources and the shared workspace events are independent,
    // so both run at once.
    const roleEntries =
      userType === 'planner' ? plannerEntries(userId)
      : userType === 'vendor' ? vendorEntries(userId)
      : clientEntries(userId);

    const [own, shared] = await Promise.all([roleEntries, workspaceEventEntries(userId)]);

    return own.concat(shared).sort(byDateThenTime);
  },

  /** Entries from today onward. */
  upcoming(entries: CalendarEntry[]): CalendarEntry[] {
    const today = todayString();
    return entries.filter((e) => e.date >= today);
  },

  /** The single next thing on the schedule, or null when nothing is booked. */
  nextEvent(entries: CalendarEntry[]): CalendarEntry | null {
    return this.upcoming(entries)[0] || null;
  },

  /** Resolve an ICS feed token to its owner. */
  async findUserByCalendarToken(token: string): Promise<{ id: string; name: string | null; user_type: string } | null> {
    return queryOne<{ id: string; name: string | null; user_type: string }>(
      'SELECT id, name, user_type FROM users WHERE calendar_token = $1',
      [token]
    );
  },

  async getCalendarToken(userId: string): Promise<string | null> {
    const row = await queryOne<{ calendar_token: string }>(
      'SELECT calendar_token FROM users WHERE id = $1',
      [userId]
    );
    return row?.calendar_token || null;
  },

  /** Issue a new token, invalidating any feed URL already handed out. */
  async rotateCalendarToken(userId: string): Promise<string | null> {
    const row = await queryOne<{ calendar_token: string }>(
      'UPDATE users SET calendar_token = gen_random_uuid(), updated_at = NOW() WHERE id = $1 RETURNING calendar_token',
      [userId]
    );
    return row?.calendar_token || null;
  },
};
