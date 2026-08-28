import { query, queryOne } from '../config/database.js';

export interface WorkspaceMessage {
  id: string;
  event_id: string;
  sender_id: string | null;
  sender_name: string | null;
  sender_user_type: string | null;
  message: string;
  created_at: string;
}

/** Most recent messages first come off the wire; the UI reverses them for display. */
const RECENT_LIMIT = 200;

export const WorkspaceMessageModel = {
  async listByEvent(eventId: string): Promise<WorkspaceMessage[]> {
    const rows = await query<WorkspaceMessage>(
      `SELECT wm.id, wm.event_id, wm.sender_id, u.name AS sender_name,
              u.user_type AS sender_user_type, wm.message, wm.created_at
         FROM workspace_messages wm
         LEFT JOIN users u ON u.id = wm.sender_id
        WHERE wm.event_id = $1
        ORDER BY wm.created_at DESC
        LIMIT ${RECENT_LIMIT}`,
      [eventId]
    );
    return rows.reverse();
  },

  async create(eventId: string, senderId: string, message: string): Promise<WorkspaceMessage> {
    const row = await queryOne<{ id: string; created_at: string }>(
      `INSERT INTO workspace_messages (event_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [eventId, senderId, message]
    );
    if (!row) throw new Error('Failed to save message');

    const sender = await queryOne<{ name: string | null; user_type: string | null }>(
      'SELECT name, user_type FROM users WHERE id = $1',
      [senderId]
    );

    return {
      id: row.id,
      event_id: eventId,
      sender_id: senderId,
      sender_name: sender?.name || null,
      sender_user_type: sender?.user_type || null,
      message,
      created_at: row.created_at,
    };
  },
};
