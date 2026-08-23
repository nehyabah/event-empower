import { query } from '../config/database.js';
import { notificationService } from './notificationService.js';
import {
  WorkspaceEventModel,
  WorkspaceEvent,
  WorkspaceEventParticipant,
  WorkspaceEventType,
  ACCESSIBLE_EVENT_IDS,
} from '../models/WorkspaceEvent.js';

export interface WorkspaceContext {
  event_id: string;
  couple_names: string;
  event_date: string | null;
  /** Everyone on this wedding who can be tagged. */
  people: WorkspaceEventParticipant[];
}

export interface WorkspaceEventInput {
  title: string;
  description?: string | null;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  eventType?: WorkspaceEventType;
  participantIds?: string[];
}

export const workspaceEventService = {
  /**
   * The weddings this user can add events to, each with its taggable people.
   *
   * A couple has exactly one; a planner or vendor has one per client.
   */
  async getContexts(userId: string): Promise<WorkspaceContext[]> {
    // Single statement: the taggable people are aggregated per wedding rather
    // than fetched with a follow-up query each, which for a planner with a
    // dozen clients was a dozen extra remote round trips.
    const rows = await query<{
      event_id: string;
      couple_names: string | null;
      event_date: string | null;
      people: WorkspaceEventParticipant[];
    }>(
      `SELECT ue.id AS event_id,
              CONCAT_WS(' & ', ue.partner1_name, ue.partner2_name) AS couple_names,
              ue.event_date,
              COALESCE(
                (
                  SELECT json_agg(DISTINCT jsonb_build_object(
                           'user_id', u.id, 'name', u.name,
                           'email', u.email, 'user_type', u.user_type
                         ))
                  FROM users u
                  WHERE u.id = ue.user_id
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
                ),
                '[]'::json
              ) AS people
       FROM user_events ue
       WHERE ue.id IN (${ACCESSIBLE_EVENT_IDS})
       ORDER BY ue.event_date ASC NULLS LAST`,
      [userId]
    );

    return rows.map((r) => ({
      event_id: r.event_id,
      couple_names: r.couple_names || 'Wedding',
      event_date: r.event_date ? String(r.event_date).split('T')[0] : null,
      people: r.people || [],
    }));
  },

  async list(userId: string): Promise<WorkspaceEvent[]> {
    return WorkspaceEventModel.findVisibleTo(userId);
  },

  async create(userId: string, eventId: string, input: WorkspaceEventInput): Promise<WorkspaceEvent> {
    if (!(await WorkspaceEventModel.canAccessEvent(userId, eventId))) {
      throw Object.assign(new Error('You do not have access to this workspace'), { statusCode: 403 });
    }

    const created = await WorkspaceEventModel.create({
      event_id: eventId,
      created_by: userId,
      title: input.title,
      description: input.description,
      event_date: input.eventDate,
      start_time: input.startTime,
      end_time: input.endTime,
      location: input.location,
      event_type: input.eventType,
    });

    await WorkspaceEventModel.setParticipants(created.id, eventId, input.participantIds || []);

    const saved = (await WorkspaceEventModel.findById(created.id))!;
    await notificationService.taggedOnEvent({
      userIds: (saved.participants || []).map((p) => p.user_id),
      workspaceEventId: saved.id,
      eventTitle: saved.title,
      date: saved.event_date,
      actorId: userId,
    });
    return saved;
  },

  /**
   * Only the creator may edit or delete. Everyone else — including the couple
   * and planner who can see it — gets it read-only, so a vendor's appointment
   * cannot be rewritten out from under them.
   */
  async update(userId: string, id: string, input: Partial<WorkspaceEventInput>): Promise<WorkspaceEvent | null> {
    const existing = await WorkspaceEventModel.findById(id);
    if (!existing) return null;
    if (existing.created_by !== userId) {
      throw Object.assign(new Error('Only the person who created this event can change it'), { statusCode: 403 });
    }

    await WorkspaceEventModel.update(id, {
      title: input.title,
      description: input.description,
      event_date: input.eventDate,
      start_time: input.startTime,
      end_time: input.endTime,
      location: input.location,
      event_type: input.eventType,
    });

    if (input.participantIds !== undefined) {
      await WorkspaceEventModel.setParticipants(id, existing.event_id, input.participantIds);
    }

    return WorkspaceEventModel.findById(id);
  },

  async remove(userId: string, id: string): Promise<boolean> {
    const existing = await WorkspaceEventModel.findById(id);
    if (!existing) return false;
    if (existing.created_by !== userId) {
      throw Object.assign(new Error('Only the person who created this event can delete it'), { statusCode: 403 });
    }
    return WorkspaceEventModel.delete(id);
  },
};
