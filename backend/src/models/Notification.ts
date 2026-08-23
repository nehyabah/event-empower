import { query, queryOne } from '../config/database.js';

export type NotificationType =
  | 'vendor_added_to_roster'
  | 'vendor_removed_from_roster'
  | 'tagged_on_event';

export interface UserNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  actor_id: string | null;
  entity_id: string | null;
  read_at: Date | null;
  created_at: Date;
}

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  actor_id?: string | null;
  /** Identifies the thing this is about, so it cannot be raised twice. */
  entity_id?: string | null;
}

export const NotificationModel = {
  /**
   * Raise a notification.
   *
   * Ignores a repeat for the same user, type and entity — re-adding a vendor to
   * the same wedding should not stack duplicates. Returns null when skipped.
   */
  async create(input: CreateNotificationInput): Promise<UserNotification | null> {
    return queryOne<UserNotification>(
      `INSERT INTO user_notifications (user_id, type, title, body, link, actor_id, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [
        input.user_id,
        input.type,
        input.title,
        input.body ?? null,
        input.link ?? null,
        input.actor_id ?? null,
        input.entity_id ?? null,
      ]
    );
  },

  async listForUser(userId: string, limit = 30): Promise<UserNotification[]> {
    return query<UserNotification>(
      `SELECT * FROM user_notifications
       WHERE user_id = $1
       ORDER BY read_at IS NULL DESC, created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
  },

  async unreadCount(userId: string): Promise<number> {
    const row = await queryOne<{ count: string }>(
      `SELECT COUNT(*) FROM user_notifications WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    );
    return parseInt(row?.count || '0', 10);
  },

  async markRead(userId: string, id: string): Promise<UserNotification | null> {
    return queryOne<UserNotification>(
      `UPDATE user_notifications SET read_at = NOW()
       WHERE id = $1 AND user_id = $2 AND read_at IS NULL
       RETURNING *`,
      [id, userId]
    );
  },

  async markAllRead(userId: string): Promise<number> {
    const rows = await query<{ id: string }>(
      `UPDATE user_notifications SET read_at = NOW()
       WHERE user_id = $1 AND read_at IS NULL
       RETURNING id`,
      [userId]
    );
    return rows.length;
  },

  /** Withdraw a notification when the thing it announced is undone. */
  async removeByEntity(userId: string, type: NotificationType, entityId: string): Promise<void> {
    await query(
      `DELETE FROM user_notifications WHERE user_id = $1 AND type = $2 AND entity_id = $3`,
      [userId, type, entityId]
    );
  },
};
