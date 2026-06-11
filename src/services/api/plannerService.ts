import { apiClient } from './client';

// ========== TYPES ==========

export type ClientStatus = 'active' | 'completed' | 'upcoming';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type EventType = 'meeting' | 'visit' | 'rehearsal' | 'wedding' | 'consultation' | 'other';

export interface PlannerClient {
  id: string;
  planner_id: string;
  user_id?: string | null;
  partner1_name: string;
  partner2_name: string;
  email: string;
  phone: string | null;
  event_type: string;
  event_date: string | null;
  status: ClientStatus;
  budget: number | null;
  venue: string | null;
  guest_count: number | null;
  notes: string | null;
  invite_code?: string | null;
  invite_status?: 'pending' | 'accepted' | 'revoked' | 'expired' | null;
  invite_sent_at?: string | null;
  invite_accepted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  partner1Name: string;
  partner2Name: string;
  email: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  status?: ClientStatus;
  budget?: number;
  venue?: string;
  guestCount?: number;
  notes?: string;
}

export interface UpdateClientInput {
  partner1Name?: string;
  partner2Name?: string;
  email?: string;
  phone?: string | null;
  eventType?: string;
  eventDate?: string | null;
  status?: ClientStatus;
  budget?: number | null;
  venue?: string | null;
  guestCount?: number | null;
  notes?: string | null;
}

export interface PlannerTask {
  id: string;
  planner_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
  client_name?: string;
}

export interface CreateTaskInput {
  clientId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface UpdateTaskInput {
  clientId?: string | null;
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface PlannerEvent {
  id: string;
  planner_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: EventType;
  location: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string;
}

export interface CreateEventInput {
  clientId?: string;
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  eventType?: EventType;
  location?: string;
}

export interface UpdateEventInput {
  clientId?: string | null;
  title?: string;
  description?: string | null;
  eventDate?: string;
  startTime?: string | null;
  endTime?: string | null;
  eventType?: EventType;
  location?: string | null;
}

export interface DashboardStats {
  clients: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
  };
  tasks: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    highPriority: number;
  };
  events: {
    total: number;
    upcoming: number;
    thisWeek: number;
    thisMonth: number;
  };
  upcomingEvents: PlannerEvent[];
  activeClients: PlannerClient[];
  upcomingClients: PlannerClient[];
  overdueTasks: PlannerTask[];
  dueSoonTasks: PlannerTask[];
  recentTasks: PlannerTask[];
  taskCountsByClient: {
    client_id: string | null;
    total: number;
  }[];
}

// ========== SERVICE ==========

export const plannerService = {
  // ========== CLIENTS ==========

  async getClients(): Promise<PlannerClient[]> {
    const response = await apiClient.get<PlannerClient[]>('/planner/clients');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async getClient(id: string): Promise<PlannerClient> {
    const response = await apiClient.get<PlannerClient>(`/planner/clients/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Client not found');
    }
    return response.data;
  },

  async createClient(input: CreateClientInput): Promise<PlannerClient> {
    const response = await apiClient.post<PlannerClient>('/planner/clients', input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to create client');
    }
    return response.data;
  },

  async updateClient(id: string, input: UpdateClientInput): Promise<PlannerClient> {
    const response = await apiClient.patch<PlannerClient>(`/planner/clients/${id}`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to update client');
    }
    return response.data;
  },

  async deleteClient(id: string): Promise<void> {
    const response = await apiClient.delete(`/planner/clients/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  async createClientInvite(id: string): Promise<{ inviteCode: string; inviteStatus: string; inviteSentAt: string }> {
    const response = await apiClient.post<{ inviteCode: string; inviteStatus: string; inviteSentAt: string }>(`/planner/clients/${id}/invite`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to generate invite code');
    }
    return response.data;
  },

  // ========== TASKS ==========

  async getTasks(clientId?: string): Promise<PlannerTask[]> {
    const endpoint = clientId ? `/planner/tasks?clientId=${clientId}` : '/planner/tasks';
    const response = await apiClient.get<PlannerTask[]>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async getTask(id: string): Promise<PlannerTask> {
    const response = await apiClient.get<PlannerTask>(`/planner/tasks/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Task not found');
    }
    return response.data;
  },

  async createTask(input: CreateTaskInput): Promise<PlannerTask> {
    const response = await apiClient.post<PlannerTask>('/planner/tasks', input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to create task');
    }
    return response.data;
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<PlannerTask> {
    const response = await apiClient.patch<PlannerTask>(`/planner/tasks/${id}`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to update task');
    }
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    const response = await apiClient.delete(`/planner/tasks/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  // ========== EVENTS ==========

  async getEvents(startDate?: string, endDate?: string): Promise<PlannerEvent[]> {
    let endpoint = '/planner/events';
    if (startDate && endDate) {
      endpoint += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await apiClient.get<PlannerEvent[]>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async getEvent(id: string): Promise<PlannerEvent> {
    const response = await apiClient.get<PlannerEvent>(`/planner/events/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Event not found');
    }
    return response.data;
  },

  async createEvent(input: CreateEventInput): Promise<PlannerEvent> {
    const response = await apiClient.post<PlannerEvent>('/planner/events', input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to create event');
    }
    return response.data;
  },

  async updateEvent(id: string, input: UpdateEventInput): Promise<PlannerEvent> {
    const response = await apiClient.patch<PlannerEvent>(`/planner/events/${id}`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to update event');
    }
    return response.data;
  },

  async deleteEvent(id: string): Promise<void> {
    const response = await apiClient.delete(`/planner/events/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  // ========== DASHBOARD ==========

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/planner/dashboard');
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return response.data;
  },
};

export default plannerService;
