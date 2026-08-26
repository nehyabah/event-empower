import { randomBytes } from 'crypto';
import { notificationService } from './notificationService.js';
import { userService } from './userService.js';
import { PlannerClientModel, PlannerClient, ClientStatus, CreatePlannerClientInput, UpdatePlannerClientInput } from '../models/PlannerClient.js';
import { PlannerTaskModel, PlannerTask, CreatePlannerTaskInput, UpdatePlannerTaskInput } from '../models/PlannerTask.js';
import { PlannerEventModel, PlannerEvent, CreatePlannerEventInput, UpdatePlannerEventInput } from '../models/PlannerEvent.js';
import { UserEventModel, UserEvent } from '../models/UserEvent.js';
import { TodoListModel, TodoItemModel, TodoList, TodoItem } from '../models/TodoList.js';
import { ProjectVendorModel, ProjectVendor, CreateProjectVendorInput, UpdateProjectVendorInput } from '../models/ProjectVendor.js';
import { GuestModel } from '../models/Guest.js';
import { VisionBoardItemModel, VisionBoardItem, CreateVisionBoardItemInput, UpdateVisionBoardItemInput } from '../models/VisionBoardItem.js';
import { query, queryOne } from '../config/database.js';
import { emailService } from './emailService.js';

/**
 * Point a planner's CRM record at the couple's canonical event, in both
 * directions.
 *
 * planner_clients.event_id is what the client-project endpoints key off — the
 * vendor roster in particular — and user_events.planner_id is what the
 * calendar and workspace access checks read. Neither was ever written, so a
 * planner could not manage a linked couple's vendors at all.
 */
async function linkClientToEvent(
  client: PlannerClient,
  eventId: string,
  userId: string
): Promise<PlannerClient | null> {
  const [linked] = await Promise.all([
    client.event_id === eventId
      ? Promise.resolve(client)
      : PlannerClientModel.update(client.id, { event_id: eventId }),
    UserEventModel.setPlanner(userId, client.planner_id),
  ]);
  return linked;
}

export const plannerService = {
  // ========== CLIENTS ==========

  async getClients(plannerId: string): Promise<PlannerClient[]> {
    return PlannerClientModel.findByPlannerId(plannerId);
  },

  async getClient(id: string, plannerId: string): Promise<PlannerClient | null> {
    const client = await PlannerClientModel.findById(id);
    if (!client || client.planner_id !== plannerId) {
      return null;
    }
    return client;
  },

  async createClient(plannerId: string, input: Omit<CreatePlannerClientInput, 'planner_id'>): Promise<PlannerClient> {
    return PlannerClientModel.create({
      ...input,
      planner_id: plannerId,
    });
  },

  async updateClient(id: string, plannerId: string, input: UpdatePlannerClientInput): Promise<PlannerClient | null> {
    const client = await this.getClient(id, plannerId);
    if (!client) {
      return null;
    }
    return PlannerClientModel.update(id, input);
  },

  async deleteClient(id: string, plannerId: string): Promise<boolean> {
    const client = await this.getClient(id, plannerId);
    if (!client) return false;
    return PlannerClientModel.delete(id);
  },

  async archiveClient(id: string, plannerId: string): Promise<PlannerClient | null> {
    const client = await this.getClient(id, plannerId);
    if (!client) return null;
    return PlannerClientModel.update(id, { status: 'archived' });
  },

  async unarchiveClient(id: string, plannerId: string, status: ClientStatus = 'active'): Promise<PlannerClient | null> {
    const client = await this.getClient(id, plannerId);
    if (!client) return null;
    return PlannerClientModel.update(id, { status });
  },

  async getClientStats(plannerId: string) {
    return PlannerClientModel.countByPlannerId(plannerId);
  },

  // ========== TASKS ==========

  async getTasks(plannerId: string, clientId?: string): Promise<PlannerTask[]> {
    if (clientId) {
      // Verify client belongs to planner
      const client = await this.getClient(clientId, plannerId);
      if (!client) {
        return [];
      }
      return PlannerTaskModel.findByClientId(clientId);
    }
    return PlannerTaskModel.findByPlannerId(plannerId);
  },

  async getTask(id: string, plannerId: string): Promise<PlannerTask | null> {
    const task = await PlannerTaskModel.findById(id);
    if (!task || task.planner_id !== plannerId) {
      return null;
    }
    return task;
  },

  async createTask(plannerId: string, input: Omit<CreatePlannerTaskInput, 'planner_id'>): Promise<PlannerTask> {
    // If client_id provided, verify it belongs to this planner
    if (input.client_id) {
      const client = await this.getClient(input.client_id, plannerId);
      if (!client) {
        throw new Error('Client not found');
      }
    }

    return PlannerTaskModel.create({
      ...input,
      planner_id: plannerId,
    });
  },

  async updateTask(id: string, plannerId: string, input: UpdatePlannerTaskInput): Promise<PlannerTask | null> {
    const task = await this.getTask(id, plannerId);
    if (!task) {
      return null;
    }

    // If updating client_id, verify it belongs to this planner
    if (input.client_id) {
      const client = await this.getClient(input.client_id, plannerId);
      if (!client) {
        throw new Error('Client not found');
      }
    }

    return PlannerTaskModel.update(id, input);
  },

  async deleteTask(id: string, plannerId: string): Promise<boolean> {
    const task = await this.getTask(id, plannerId);
    if (!task) {
      return false;
    }
    return PlannerTaskModel.delete(id);
  },

  async getTaskStats(plannerId: string) {
    return PlannerTaskModel.countByPlannerId(plannerId);
  },

  // ========== EVENTS ==========

  async getEvents(plannerId: string, startDate?: string, endDate?: string): Promise<PlannerEvent[]> {
    if (startDate && endDate) {
      return PlannerEventModel.findByPlannerIdAndDateRange(plannerId, startDate, endDate);
    }
    return PlannerEventModel.findByPlannerId(plannerId);
  },

  async getEvent(id: string, plannerId: string): Promise<PlannerEvent | null> {
    const event = await PlannerEventModel.findById(id);
    if (!event || event.planner_id !== plannerId) {
      return null;
    }
    return event;
  },

  async getUpcomingEvents(plannerId: string, limit: number = 10): Promise<PlannerEvent[]> {
    return PlannerEventModel.findUpcoming(plannerId, limit);
  },

  async createEvent(plannerId: string, input: Omit<CreatePlannerEventInput, 'planner_id'>): Promise<PlannerEvent> {
    // If client_id provided, verify it belongs to this planner
    if (input.client_id) {
      const client = await this.getClient(input.client_id, plannerId);
      if (!client) {
        throw new Error('Client not found');
      }
    }

    return PlannerEventModel.create({
      ...input,
      planner_id: plannerId,
    });
  },

  async updateEvent(id: string, plannerId: string, input: UpdatePlannerEventInput): Promise<PlannerEvent | null> {
    const event = await this.getEvent(id, plannerId);
    if (!event) {
      return null;
    }

    // If updating client_id, verify it belongs to this planner
    if (input.client_id) {
      const client = await this.getClient(input.client_id, plannerId);
      if (!client) {
        throw new Error('Client not found');
      }
    }

    return PlannerEventModel.update(id, input);
  },

  async deleteEvent(id: string, plannerId: string): Promise<boolean> {
    const event = await this.getEvent(id, plannerId);
    if (!event) {
      return false;
    }
    return PlannerEventModel.delete(id);
  },

  async getEventStats(plannerId: string) {
    return PlannerEventModel.countByPlannerId(plannerId);
  },

  // ========== DASHBOARD ==========

  async getDashboardStats(plannerId: string) {
    const [
      clientStats,
      taskStats,
      eventStats,
      upcomingEvents,
      activeClients,
      upcomingClients,
      overdueTasks,
      dueSoonTasks,
      recentTasks,
      taskCountsByClient,
    ] = await Promise.all([
      this.getClientStats(plannerId),
      this.getTaskStats(plannerId),
      this.getEventStats(plannerId),
      this.getUpcomingEvents(plannerId, 5),
      PlannerClientModel.findActive(plannerId, 5),
      PlannerClientModel.findUpcoming(plannerId, 5),
      PlannerTaskModel.findOverdue(plannerId, 5),
      PlannerTaskModel.findDueSoon(plannerId, 7, 5),
      PlannerTaskModel.findRecent(plannerId, 5),
      PlannerTaskModel.countByClientForPlanner(plannerId),
    ]);

    return {
      clients: clientStats,
      tasks: taskStats,
      events: eventStats,
      upcomingEvents,
      activeClients,
      upcomingClients,
      overdueTasks,
      dueSoonTasks,
      recentTasks,
      taskCountsByClient,
    };
  },

  async createInvite(plannerId: string, clientId: string): Promise<{ inviteCode: string; inviteStatus: string; inviteSentAt: string; emailSent: boolean; emailError?: string }> {
    const client = await this.getClient(clientId, plannerId);
    if (!client) {
      throw new Error('Client not found');
    }
    if (client.user_id) {
      throw new Error('Client already linked');
    }

    let inviteCode = '';
    for (let i = 0; i < 5; i += 1) {
      inviteCode = randomBytes(4).toString('hex').toUpperCase();
      const existing = await PlannerClientModel.findByInviteCode(inviteCode);
      if (!existing) break;
      inviteCode = '';
    }

    if (!inviteCode) {
      throw new Error('Unable to generate invite code');
    }

    const updated = await PlannerClientModel.update(clientId, {
      invite_code: inviteCode,
      invite_status: 'pending',
      invite_sent_at: new Date().toISOString(),
      invite_accepted_at: null,
    });

    if (!updated) {
      throw new Error('Failed to create invite');
    }

    // A failed send must not lose the invite — the code is valid either way and
    // the planner can share the link by hand. But the caller has to be told, or
    // the UI reports success for mail that never left.
    let emailSent = false;
    let emailError: string | undefined;

    // Send email if client has an email address on file
    if (client.email) {
      const planner = await queryOne<{ name: string; email: string | null }>(
        'SELECT name, email FROM users WHERE id = $1',
        [plannerId]
      );
      const plannerName = planner?.name || 'Your planner';
      const toName = [client.partner1_name, client.partner2_name].filter(Boolean).join(' & ') || '';
      await emailService.sendPlannerInvite({
        toEmail: client.email,
        toName,
        plannerName,
        inviteCode,
        // Replies land with the planner rather than an unmonitored mailbox,
        // which also reads as more legitimate to spam filters.
        ...(planner?.email ? { replyTo: planner.email } : {}),
      })
        .then(() => {
          emailSent = true;
        })
        .catch((err) => {
          emailError = err instanceof Error ? err.message : 'Unknown error';
          console.error('[createInvite] email send failed:', err);
        });
    } else {
      emailError = 'No email address on file for this client';
    }

    return {
      inviteCode: updated.invite_code || inviteCode,
      inviteStatus: updated.invite_status || 'pending',
      inviteSentAt: updated.invite_sent_at ? new Date(updated.invite_sent_at).toISOString() : new Date().toISOString(),
      emailSent,
      ...(emailError ? { emailError } : {}),
    };
  },

  async previewInvite(inviteCode: string): Promise<{ plannerName: string; coupleName: string }> {
    const client = await PlannerClientModel.findByInviteCode(inviteCode);
    if (!client) throw new Error('Invalid invite code');
    if (client.invite_status === 'accepted') throw new Error('Invite already accepted');
    if (client.invite_status === 'revoked' || client.invite_status === 'expired') throw new Error('Invite is no longer valid');

    const planner = await queryOne<{ name: string }>('SELECT name FROM users WHERE id = $1', [client.planner_id]);
    const coupleName = [client.partner1_name, client.partner2_name].filter(Boolean).join(' & ') || 'New couple';
    return {
      plannerName: planner?.name || 'Your planner',
      coupleName,
    };
  },

  // ========== CLIENT WORKSPACE ==========

  async getClientWorkspace(plannerId: string, clientId: string) {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) return null;
    const event = await UserEventModel.findByUserId(client.user_id);
    if (!event) return null;
    const [vendors, sharedTodos, guestStats] = await Promise.all([
      query<{
        id: string; vendor_id: string; business_name: string | null;
        vendor_category: string | null; status: string;
        amount: number | null; notes: string | null;
      }>(
        `SELECT vb.id, vb.vendor_id, vp.business_name, vp.category AS vendor_category,
                vb.status, vb.total_amount AS amount, vb.notes
         FROM vendor_bookings vb
         LEFT JOIN vendor_profiles vp ON vp.id = vb.vendor_id
         WHERE vb.client_id = $1`,
        [client.user_id]
      ),
      TodoListModel.findSharedByUserId(client.user_id),
      GuestModel.countByUserId(client.user_id),
    ]);
    return { client, event, vendors, sharedTodos, guestStats };
  },

  // ========== CLIENT PROJECT ==========

  async getClientProject(plannerId: string, clientId: string): Promise<{ event: UserEvent; vendors: unknown[] } | null> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) return null;

    const event = await UserEventModel.findByUserId(client.user_id);
    if (!event) return null;

    // The roster lives in project_vendors. This previously read
    // vendor_bookings, which only holds appointments a vendor happened to link,
    // so a roster managed by the planner never appeared here.
    const vendors = await query<{
      id: string; vendor_profile_id: string; business_name: string | null;
      vendor_category: string | null; status: string;
      amount: number | null; notes: string | null;
    }>(
      `SELECT pv.id, pv.vendor_profile_id, vp.business_name,
              COALESCE(pv.category, vp.category) AS vendor_category,
              pv.status, pv.amount, pv.notes
       FROM project_vendors pv
       LEFT JOIN vendor_profiles vp ON vp.id = pv.vendor_profile_id
       WHERE pv.event_id = $1
       ORDER BY pv.created_at ASC`,
      [event.id]
    );
    return { event, vendors };
  },

  async addClientProjectVendor(plannerId: string, clientId: string, input: Omit<CreateProjectVendorInput, 'event_id' | 'added_by'>): Promise<ProjectVendor> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.event_id) throw new Error('Client project not found');

    const created = await ProjectVendorModel.create({
      ...input,
      event_id: client.event_id,
      added_by: plannerId,
    });
    await notificationService.vendorAddedToRoster({
      vendorProfileId: input.vendor_profile_id,
      eventId: client.event_id,
      addedBy: plannerId,
    });
    return created;
  },

  async updateClientProjectVendor(plannerId: string, clientId: string, projectVendorId: string, input: UpdateProjectVendorInput): Promise<ProjectVendor | null> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.event_id) return null;

    const pv = await ProjectVendorModel.findById(projectVendorId);
    if (!pv || pv.event_id !== client.event_id) return null;

    return ProjectVendorModel.update(projectVendorId, input);
  },

  async removeClientProjectVendor(plannerId: string, clientId: string, projectVendorId: string): Promise<boolean> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.event_id) return false;

    const pv = await ProjectVendorModel.findById(projectVendorId);
    if (!pv || pv.event_id !== client.event_id) return false;

    await notificationService.vendorRemovedFromRoster(pv.vendor_profile_id, pv.event_id);
    return ProjectVendorModel.delete(projectVendorId);
  },

  // ========== CLIENT TODO LISTS (shared) ==========

  async getClientSharedTodos(plannerId: string, clientId: string): Promise<TodoList[]> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) return [];
    return TodoListModel.findSharedByUserId(client.user_id);
  },

  async addClientTodoItem(plannerId: string, clientId: string, listId: string, input: { text: string; status?: 'todo' | 'in_progress' | 'done' }): Promise<TodoItem> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) throw new Error('Client not found or not linked');

    const list = await TodoListModel.findById(listId);
    if (!list || list.user_id !== client.user_id || !list.is_shared) {
      throw new Error('Todo list not found');
    }

    return TodoItemModel.create({ list_id: listId, text: input.text, status: input.status });
  },

  async toggleClientTodoItem(plannerId: string, clientId: string, itemId: string): Promise<TodoItem | null> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) return null;

    const item = await TodoItemModel.findById(itemId);
    if (!item) return null;

    const list = await TodoListModel.findById(item.list_id);
    if (!list || list.user_id !== client.user_id || !list.is_shared) return null;

    return TodoItemModel.toggleCompleted(itemId);
  },

  async updateClientTodoItem(plannerId: string, clientId: string, itemId: string, input: { text?: string; status?: 'todo' | 'in_progress' | 'done'; completed?: boolean }): Promise<TodoItem | null> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) return null;

    const item = await TodoItemModel.findById(itemId);
    if (!item) return null;

    const list = await TodoListModel.findById(item.list_id);
    if (!list || list.user_id !== client.user_id || !list.is_shared) return null;

    return TodoItemModel.update(itemId, input);
  },

  async deleteClientTodoItem(plannerId: string, clientId: string, itemId: string): Promise<boolean> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) return false;

    const item = await TodoItemModel.findById(itemId);
    if (!item) return false;

    const list = await TodoListModel.findById(item.list_id);
    if (!list || list.user_id !== client.user_id || !list.is_shared) return false;

    return TodoItemModel.delete(itemId);
  },

  // ========== CLIENT BUDGET ==========

  /**
   * A client's expenses and budget summary, in exactly the shape the couple's
   * own budget screen consumes — same figures, same maths, one implementation.
   */
  async getClientExpenses(plannerId: string, clientId: string) {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) return null;

    return {
      expenses: await userService.getExpenses(client.user_id),
      summary: await userService.getExpenseSummary(client.user_id),
    };
  },

  // ========== CLIENT VISION BOARD (shared) ==========

  async getClientVisionBoard(plannerId: string, clientId: string): Promise<VisionBoardItem[]> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) return [];
    return VisionBoardItemModel.findByUserId(client.user_id);
  },

  async addClientVisionBoardItem(plannerId: string, clientId: string, input: Omit<CreateVisionBoardItemInput, 'user_id' | 'added_by'>): Promise<VisionBoardItem> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) throw new Error('Client not found or not linked');
    return VisionBoardItemModel.create({ ...input, user_id: client.user_id, added_by: plannerId });
  },

  async updateClientVisionBoardItem(plannerId: string, clientId: string, itemId: string, input: UpdateVisionBoardItemInput): Promise<VisionBoardItem | null> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) return null;
    const item = await VisionBoardItemModel.findById(itemId);
    if (!item || item.user_id !== client.user_id) return null;
    return VisionBoardItemModel.update(itemId, client.user_id, input);
  },

  async deleteClientVisionBoardItem(plannerId: string, clientId: string, itemId: string): Promise<boolean> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.user_id) return false;
    const item = await VisionBoardItemModel.findById(itemId);
    if (!item || item.user_id !== client.user_id) return false;
    await VisionBoardItemModel.delete(itemId, client.user_id);
    return true;
  },

  // ========== CALENDAR DATA (combined) ==========

  async getCalendarData(plannerId: string) {
    const [events, clients] = await Promise.all([
      PlannerEventModel.findByPlannerId(plannerId),
      PlannerClientModel.findByPlannerId(plannerId),
    ]);

    const linkedClients = clients.filter(c => c.user_id);

    // Wedding dates from user_events for linked clients
    const weddingDates: Array<{
      client_id: string;
      client_name: string;
      event_date: string;
    }> = [];

    // Todo due dates from shared todo items
    const todoDueDates: Array<{
      client_id: string;
      client_name: string;
      list_title: string;
      item_text: string;
      due_date: string;
    }> = [];

    await Promise.all(linkedClients.map(async (client) => {
      const clientName = [client.partner1_name, client.partner2_name].filter(Boolean).join(' & ') || client.email;

      const [event, sharedTodos] = await Promise.all([
        UserEventModel.findByUserId(client.user_id!),
        TodoListModel.findByUserIdWithItems(client.user_id!),
      ]);

      if (event?.event_date) {
        weddingDates.push({
          client_id: client.id,
          client_name: clientName,
          event_date: typeof event.event_date === 'string'
            ? event.event_date
            : (event.event_date as Date).toISOString().split('T')[0],
        });
      }

      for (const list of sharedTodos) {
        if (!list.is_shared || !list.items) continue;
        for (const item of list.items) {
          if (item.due_date) {
            todoDueDates.push({
              client_id: client.id,
              client_name: clientName,
              list_title: list.title,
              item_text: item.text,
              due_date: item.due_date instanceof Date
                ? item.due_date.toISOString().split('T')[0]
                : String(item.due_date),
            });
          }
        }
      }
    }));

    return { events, weddingDates, todoDueDates };
  },

  async acceptInvite(userId: string, inviteCode: string): Promise<PlannerClient> {
    const client = await PlannerClientModel.findByInviteCode(inviteCode);
    if (!client) {
      throw new Error('Invalid invite code');
    }
    if (client.invite_status === 'revoked' || client.invite_status === 'expired') {
      throw new Error('Invite is no longer valid');
    }

    // Idempotent: if this user is already linked to this client record, return it
    if (client.user_id === userId && client.invite_status === 'accepted') {
      const event = await UserEventModel.upsert({
        user_id: userId,
        partner1_name: client.partner1_name,
        partner2_name: client.partner2_name,
        event_date: client.event_date || undefined,
        venue: client.venue || undefined,
        total_budget: client.budget ?? undefined,
        guest_count_estimate: client.guest_count ?? undefined,
        notes: client.notes || undefined,
      });
      // Re-link on every accept: records created before this link existed
      // still have a null event_id, which left the planner unable to manage
      // the couple's vendor roster.
      return (await linkClientToEvent(client, event.id, userId)) ?? client;
    }

    // If the invite was accepted by a different user, block it
    if (client.invite_status === 'accepted') {
      throw new Error('Invite already accepted');
    }

    // If this user is already linked to a different planner, block it
    const existingLink = await PlannerClientModel.findByUserId(userId);
    if (existingLink && existingLink.id !== client.id) {
      throw new Error('You are already linked to a planner');
    }

    const updated = await PlannerClientModel.update(client.id, {
      user_id: userId,
      invite_status: 'accepted',
      invite_accepted_at: new Date().toISOString(),
    });

    if (!updated) {
      throw new Error('Failed to accept invite');
    }

    // Create or update the couple's event record from the planner's client data
    const event = await UserEventModel.upsert({
      user_id: userId,
      partner1_name: updated.partner1_name,
      partner2_name: updated.partner2_name,
      event_date: updated.event_date || undefined,
      venue: updated.venue || undefined,
      total_budget: updated.budget ?? undefined,
      guest_count_estimate: updated.guest_count ?? undefined,
      notes: updated.notes || undefined,
    });

    return (await linkClientToEvent(updated, event.id, userId)) ?? updated;
  },
};
