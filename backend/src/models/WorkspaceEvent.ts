import { query, queryOne } from '../config/database.js';

export type WorkspaceEventType =
  | 'meeting' | 'visit' | 'fitting' | 'tasting' | 'rehearsal' | 'delivery' | 'other';

export interface WorkspaceEventParticipant {
  user_id: string;
  name: string | null;
  email: string | null;
  user_type: string;
}

export interface WorkspaceEvent {
  id: string;
  event_id: string;
  created_by: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_type: WorkspaceEventType;
  created_at: Date;
  updated_at: Date;
  // Joined
  created_by_name?: string | null;
  couple_names?: string | null;
  participants?: WorkspaceEventParticipant[];
}

export interface CreateWorkspaceEventInput {
  event_id: string;
  created_by: string;
  title: string;
  description?: string | null;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  event_type?: WorkspaceEventType;
}

export interface UpdateWorkspaceEventInput {
  title?: string;
  description?: string | null;
  event_date?: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  event_type?: WorkspaceEventType;
}

const BASE_SELECT = `
  SELECT we.*,
         u.name AS created_by_name,
         CONCAT_WS(' & ', ue.partner1_name, ue.partner2_name) AS couple_names
  FROM workspace_events we
  LEFT JOIN users u ON u.id = we.created_by
  JOIN user_events ue ON ue.id = we.event_id
`;

/**
 * Weddings a user may add events to, and therefore see events on.
 *
 * Three routes in: they own the wedding, they are its planner (directly or via
 * an accepted planner_clients link), or they are a vendor on its roster.
 */
export const ACCESSIBLE_EVENT_IDS = `
  SELECT ue.id
  FROM user_events ue
  WHERE ue.user_id = $1
     OR ue.planner_id = $1
     OR EXISTS (
       SELECT 1 FROM planner_clients pc
       WHERE pc.user_id = ue.user_id
         AND pc.planner_id = $1
         AND pc.invite_status = 'accepted'
     )
     OR EXISTS (
       SELECT 1 FROM project_vendors pv
       JOIN vendor_profiles vp ON vp.id = pv.vendor_profile_id
       WHERE pv.event_id = ue.id
         AND vp.user_id = $1
         AND pv.status <> 'cancelled'
     )
`;

export const WorkspaceEventModel = {
  async findById(id: string): Promise<WorkspaceEvent | null> {
    const row = await queryOne<WorkspaceEvent>(`${BASE_SELECT} WHERE we.id = $1`, [id]);
    if (!row) return null;
    row.participants = await this.listParticipants(id);
    return row;
  },

  /**
   * Events visible to a user.
   *
   * The couple and the planner see every event on their wedding; a vendor sees
   * only the ones they created or were tagged in, so one couple's vendors do
   * not see each other's appointments.
   */
  async findVisibleTo(userId: string): Promise<WorkspaceEvent[]> {
    // Participants are aggregated in the same statement rather than a follow-up
    // query: against a remote database each extra round trip costs far more
    // than the join does.
    return query<WorkspaceEvent>(
      `SELECT we.*,
              u.name AS created_by_name,
              CONCAT_WS(' & ', ue.partner1_name, ue.partner2_name) AS couple_names,
              COALESCE(
                (
                  SELECT json_agg(json_build_object(
                           'user_id', pu.id, 'name', pu.name,
                           'email', pu.email, 'user_type', pu.user_type
                         ) ORDER BY pu.user_type, pu.name)
                  FROM workspace_event_participants p
                  JOIN users pu ON pu.id = p.user_id
                  WHERE p.workspace_event_id = we.id
                ),
                '[]'::json
              ) AS participants
       FROM workspace_events we
       LEFT JOIN users u ON u.id = we.created_by
       JOIN user_events ue ON ue.id = we.event_id
       WHERE (
         -- Owns the wedding, or is its planner: sees everything on it.
         ue.user_id = $1
         OR ue.planner_id = $1
         OR EXISTS (
           SELECT 1 FROM planner_clients pc
           WHERE pc.user_id = ue.user_id AND pc.planner_id = $1
             AND pc.invite_status = 'accepted'
         )
         -- Otherwise only what they created or were tagged in.
         OR we.created_by = $1
         OR EXISTS (
           SELECT 1 FROM workspace_event_participants p
           WHERE p.workspace_event_id = we.id AND p.user_id = $1
         )
       )
       ORDER BY we.event_date ASC, we.start_time ASC NULLS LAST`,
      [userId]
    );
  },

  async canAccessEvent(userId: string, eventId: string): Promise<boolean> {
    const row = await queryOne<{ id: string }>(
      `SELECT id FROM (${ACCESSIBLE_EVENT_IDS}) accessible WHERE id = $2`,
      [userId, eventId]
    );
    return Boolean(row);
  },

  /** Everyone connected to a wedding, as tagging candidates. */
  async listTaggableUsers(eventId: string): Promise<WorkspaceEventParticipant[]> {
    return query<WorkspaceEventParticipant>(
      `SELECT DISTINCT u.id AS user_id, u.name, u.email, u.user_type
       FROM user_events ue
       JOIN users u ON (
            u.id = ue.user_id
         OR u.id = ue.planner_id
         OR u.id IN (
              SELECT pc.planner_id FROM planner_clients pc
              WHERE pc.user_id = ue.user_id AND pc.invite_status = 'accepted'
            )
         OR u.id IN (
              SELECT vp.user_id FROM project_vendors pv
              JOIN vendor_profiles vp ON vp.id = pv.vendor_profile_id
              WHERE pv.event_id = ue.id AND pv.status <> 'cancelled'
            )
       )
       WHERE ue.id = $1
       ORDER BY u.user_type, u.name`,
      [eventId]
    );
  },

  async create(input: CreateWorkspaceEventInput): Promise<WorkspaceEvent> {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO workspace_events
         (event_id, created_by, title, description, event_date, start_time, end_time, location, event_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        input.event_id,
        input.created_by,
        input.title,
        input.description || null,
        input.event_date,
        input.start_time || null,
        input.end_time || null,
        input.location || null,
        input.event_type || 'meeting',
      ]
    );
    if (!row) throw new Error('Failed to create workspace event');
    return (await this.findById(row.id))!;
  },

  async update(id: string, input: UpdateWorkspaceEventInput): Promise<WorkspaceEvent | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (input.title !== undefined)       { fields.push(`title = $${i++}`);       values.push(input.title); }
    if (input.description !== undefined) { fields.push(`description = $${i++}`); values.push(input.description || null); }
    if (input.event_date !== undefined)  { fields.push(`event_date = $${i++}`);  values.push(input.event_date); }
    if (input.start_time !== undefined)  { fields.push(`start_time = $${i++}`);  values.push(input.start_time || null); }
    if (input.end_time !== undefined)    { fields.push(`end_time = $${i++}`);    values.push(input.end_time || null); }
    if (input.location !== undefined)    { fields.push(`location = $${i++}`);    values.push(input.location || null); }
    if (input.event_type !== undefined)  { fields.push(`event_type = $${i++}`);  values.push(input.event_type); }

    if (fields.length > 0) {
      fields.push('updated_at = NOW()');
      values.push(id);
      await query(`UPDATE workspace_events SET ${fields.join(', ')} WHERE id = $${i}`, values);
    }

    return this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    const rows = await query('DELETE FROM workspace_events WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  },

  async listParticipants(workspaceEventId: string): Promise<WorkspaceEventParticipant[]> {
    return query<WorkspaceEventParticipant>(
      `SELECT p.user_id, u.name, u.email, u.user_type
       FROM workspace_event_participants p
       JOIN users u ON u.id = p.user_id
       WHERE p.workspace_event_id = $1
       ORDER BY u.user_type, u.name`,
      [workspaceEventId]
    );
  },

  /** Replace the tag list, keeping only people actually on the wedding. */
  async setParticipants(workspaceEventId: string, eventId: string, userIds: string[]): Promise<void> {
    await query('DELETE FROM workspace_event_participants WHERE workspace_event_id = $1', [workspaceEventId]);
    if (userIds.length === 0) return;

    const allowed = new Set((await this.listTaggableUsers(eventId)).map((u) => u.user_id));
    const valid = [...new Set(userIds)].filter((id) => allowed.has(id));
    if (valid.length === 0) return;

    await query(
      `INSERT INTO workspace_event_participants (workspace_event_id, user_id)
       SELECT $1, UNNEST($2::uuid[])
       ON CONFLICT DO NOTHING`,
      [workspaceEventId, valid]
    );
  },
};
