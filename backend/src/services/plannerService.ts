import { randomBytes } from 'crypto';
import { PlannerClientModel, PlannerClient, CreatePlannerClientInput, UpdatePlannerClientInput } from '../models/PlannerClient.js';
import { PlannerTaskModel, PlannerTask, CreatePlannerTaskInput, UpdatePlannerTaskInput } from '../models/PlannerTask.js';
import { PlannerEventModel, PlannerEvent, CreatePlannerEventInput, UpdatePlannerEventInput } from '../models/PlannerEvent.js';
import { UserEventModel, UserEvent } from '../models/UserEvent.js';
import { TodoListModel, TodoItemModel, TodoList, TodoItem } from '../models/TodoList.js';
import { ProjectVendorModel, ProjectVendor, CreateProjectVendorInput, UpdateProjectVendorInput } from '../models/ProjectVendor.js';

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
    if (!client) {
      return false;
    }
    return PlannerClientModel.delete(id);
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

  async createInvite(plannerId: string, clientId: string): Promise<{ inviteCode: string; inviteStatus: string; inviteSentAt: string }> {
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

    return {
      inviteCode: updated.invite_code || inviteCode,
      inviteStatus: updated.invite_status || 'pending',
      inviteSentAt: updated.invite_sent_at ? new Date(updated.invite_sent_at).toISOString() : new Date().toISOString(),
    };
  },

  // ========== CLIENT PROJECT ==========

  async getClientProject(plannerId: string, clientId: string): Promise<{ event: UserEvent; vendors: ProjectVendor[] } | null> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.event_id) return null;

    const event = await UserEventModel.findById(client.event_id);
    if (!event) return null;

    const vendors = await ProjectVendorModel.findByEventId(event.id);
    return { event, vendors };
  },

  async addClientProjectVendor(plannerId: string, clientId: string, input: Omit<CreateProjectVendorInput, 'event_id' | 'added_by'>): Promise<ProjectVendor> {
    const client = await this.getClient(clientId, plannerId);
    if (!client || !client.event_id) throw new Error('Client project not found');

    return ProjectVendorModel.create({
      ...input,
      event_id: client.event_id,
      added_by: plannerId,
    });
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

  async acceptInvite(userId: string, inviteCode: string): Promise<PlannerClient> {
    const existingLink = await PlannerClientModel.findByUserId(userId);
    if (existingLink) {
      throw new Error('User already linked');
    }

    const client = await PlannerClientModel.findByInviteCode(inviteCode);
    if (!client) {
      throw new Error('Invalid invite code');
    }
    if (client.invite_status === 'accepted') {
      throw new Error('Invite already accepted');
    }
    if (client.invite_status === 'revoked' || client.invite_status === 'expired') {
      throw new Error('Invite is no longer valid');
    }

    const updated = await PlannerClientModel.update(client.id, {
      user_id: userId,
      invite_status: 'accepted',
      invite_accepted_at: new Date().toISOString(),
    });

    if (!updated) {
      throw new Error('Failed to accept invite');
    }

    // Upsert the couple's canonical event record
    const userEvent = await UserEventModel.upsert({
      user_id: userId,
      partner1_name: updated.partner1_name,
      partner2_name: updated.partner2_name,
      event_date: updated.event_date || undefined,
      venue: updated.venue || undefined,
      total_budget: updated.budget || 0,
      guest_count_estimate: updated.guest_count || 0,
      notes: updated.notes || undefined,
    });

    // Wire: event.planner_id → this planner; planner_client.event_id → this event
    await Promise.all([
      UserEventModel.setPlanner(userId, client.planner_id),
      PlannerClientModel.update(client.id, { event_id: userEvent.id }),
    ]);

    return updated;
  },
};
