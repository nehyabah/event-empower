import { query, queryOne } from '../config/database.js';
import { NotificationModel, UserNotification } from '../models/Notification.js';

/** The vendor's login and business name, from their profile id. */
const vendorAccount = async (vendorProfileId: string) =>
  queryOne<{ user_id: string; business_name: string }>(
    `SELECT user_id, business_name FROM vendor_profiles WHERE id = $1`,
    [vendorProfileId]
  );

/** Display name for a wedding, for use in notification copy. */
const coupleNameForEvent = async (eventId: string) => {
  const row = await queryOne<{ names: string | null }>(
    `SELECT NULLIF(CONCAT_WS(' & ', partner1_name, partner2_name), '') AS names
     FROM user_events WHERE id = $1`,
    [eventId]
  );
  return row?.names || 'A couple';
};

export const notificationService = {
  async list(userId: string): Promise<{ notifications: UserNotification[]; unread: number }> {
    const [notifications, unread] = await Promise.all([
      NotificationModel.listForUser(userId),
      NotificationModel.unreadCount(userId),
    ]);
    return { notifications, unread };
  },

  /**
   * Tell everyone else on a wedding that a message was posted.
   *
   * Recipients are resolved the same way chat access is - the couple, their
   * planner, and any non-cancelled vendor on the roster - so someone who can
   * read the thread is exactly someone who gets told about it.
   *
   * Best-effort: a failed notification must never fail the message itself.
   */
  async workspaceMessagePosted(opts: {
    eventId: string;
    senderId: string;
    senderName: string | null;
    preview: string;
  }): Promise<void> {
    try {
      const coupleNames = await coupleNameForEvent(opts.eventId);
      const recipients = await query<{ user_id: string }>(
        `SELECT DISTINCT u.id AS user_id
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
          WHERE ue.id = $1 AND u.id <> $2`,
        [opts.eventId, opts.senderId]
      );

      await Promise.all(
        recipients.map((r) =>
          NotificationModel.upsertForEntity({
            user_id: r.user_id,
            type: 'workspace_message',
            title: `New message in ${coupleNames}'s workspace`,
            body: `${opts.senderName || 'Someone'}: ${opts.preview}`,
            link: '/workspace',
            actor_id: opts.senderId,
            entity_id: opts.eventId,
          })
        )
      );
    } catch (err) {
      console.error('[notifications] workspace message notice failed:', err);
    }
  },

  /** Tell the other side of a vendor enquiry that they have a reply. */
  async inquiryMessagePosted(opts: {
    inquiryId: string;
    recipientUserId: string;
    senderId: string;
    senderLabel: string;
    preview: string;
    link: string;
  }): Promise<void> {
    try {
      await NotificationModel.upsertForEntity({
        user_id: opts.recipientUserId,
        type: 'inquiry_message',
        title: `New message from ${opts.senderLabel}`,
        body: opts.preview,
        link: opts.link,
        actor_id: opts.senderId,
        entity_id: opts.inquiryId,
      });
    } catch (err) {
      console.error('[notifications] inquiry message notice failed:', err);
    }
  },

  markRead: (userId: string, id: string) => NotificationModel.markRead(userId, id),
  markAllRead: (userId: string) => NotificationModel.markAllRead(userId),

  /**
   * Tell a vendor they are now on a couple's roster.
   *
   * Best-effort: a notification failing must never fail the action that
   * triggered it, so callers are not expected to handle errors from here.
   */
  async vendorAddedToRoster(opts: {
    vendorProfileId: string;
    eventId: string;
    addedBy: string;
  }): Promise<void> {
    try {
      const [vendor, couple] = await Promise.all([
        vendorAccount(opts.vendorProfileId),
        coupleNameForEvent(opts.eventId),
      ]);
      if (!vendor?.user_id) return;

      await NotificationModel.create({
        user_id: vendor.user_id,
        type: 'vendor_added_to_roster',
        title: `${couple} added you to their wedding`,
        body: 'You can now schedule against this wedding and be tagged on shared events.',
        link: '/vendor-calendar',
        actor_id: opts.addedBy,
        entity_id: opts.eventId,
      });
    } catch (error) {
      console.error('[notifications] vendorAddedToRoster failed:', error);
    }
  },

  /** Withdraw the roster notification when a vendor is taken off again. */
  async vendorRemovedFromRoster(vendorProfileId: string, eventId: string): Promise<void> {
    try {
      const vendor = await vendorAccount(vendorProfileId);
      if (!vendor?.user_id) return;
      await NotificationModel.removeByEntity(vendor.user_id, 'vendor_added_to_roster', eventId);
    } catch (error) {
      console.error('[notifications] vendorRemovedFromRoster failed:', error);
    }
  },

  /** Tell each tagged person about a shared calendar event. */
  async taggedOnEvent(opts: {
    userIds: string[];
    workspaceEventId: string;
    eventTitle: string;
    date: string;
    actorId: string;
  }): Promise<void> {
    try {
      await Promise.all(
        opts.userIds
          .filter((id) => id !== opts.actorId) // no need to tell the author
          .map((id) =>
            NotificationModel.create({
              user_id: id,
              type: 'tagged_on_event',
              title: `You were added to "${opts.eventTitle}"`,
              body: `Scheduled for ${opts.date}.`,
              link: '/workspace',
              actor_id: opts.actorId,
              entity_id: opts.workspaceEventId,
            })
          )
      );
    } catch (error) {
      console.error('[notifications] taggedOnEvent failed:', error);
    }
  },
};
