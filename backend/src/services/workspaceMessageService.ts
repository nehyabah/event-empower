import { WorkspaceEventModel } from '../models/WorkspaceEvent.js';
import { WorkspaceMessage, WorkspaceMessageModel } from '../models/WorkspaceMessage.js';

/**
 * Group chat for a wedding workspace.
 *
 * Reuses the wedding's existing access rule rather than a separate one: the
 * couple, their planner, and any vendor still on the roster (not cancelled)
 * are exactly the set already surfaced as "everyone on this wedding" for
 * tagging. Chat access follows the same line - anyone who can be tagged on
 * this wedding can also read and post in its thread.
 */
export const workspaceMessageService = {
  async list(userId: string, eventId: string): Promise<WorkspaceMessage[]> {
    if (!(await WorkspaceEventModel.canAccessEvent(userId, eventId))) {
      throw Object.assign(new Error('You do not have access to this workspace'), { statusCode: 403 });
    }
    return WorkspaceMessageModel.listByEvent(eventId);
  },

  async send(userId: string, eventId: string, message: string): Promise<WorkspaceMessage> {
    if (!(await WorkspaceEventModel.canAccessEvent(userId, eventId))) {
      throw Object.assign(new Error('You do not have access to this workspace'), { statusCode: 403 });
    }
    return WorkspaceMessageModel.create(eventId, userId, message);
  },
};
