import { apiClient } from './client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ========== TYPES ==========

export type ClientStatus = 'active' | 'completed' | 'upcoming' | 'archived';
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
  /** When true the linked client sees this entry on their own calendar. */
  visible_to_client: boolean;
  created_at: string;
  updated_at: string;
  client_name?: string;
}

export interface CalendarWeddingDate {
  client_id: string;
  client_name: string;
  event_date: string;
}

export interface CalendarTodoDueDate {
  client_id: string;
  client_name: string;
  list_title: string;
  item_text: string;
  due_date: string;
}

export interface CalendarData {
  events: PlannerEvent[];
  weddingDates: CalendarWeddingDate[];
  todoDueDates: CalendarTodoDueDate[];
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
  visibleToClient?: boolean;
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
  visibleToClient?: boolean;
}

export interface ClientTodoItem {
  id: string;
  list_id: string;
  text: string;
  completed: boolean;
  status: 'todo' | 'in_progress' | 'done';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ClientTodoList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  items: ClientTodoItem[];
}

// ========== WORKSPACE TYPES ==========

export interface WorkspaceVendor {
  id: string;
  vendor_profile_id: string;
  business_name?: string;
  vendor_category?: string;
  category: string | null;
  status: 'inquired' | 'quoted' | 'booked' | 'confirmed' | 'cancelled';
  amount: number | null;
  notes: string | null;
}

export interface WorkspaceTodoItem {
  id: string;
  text: string;
  completed: boolean;
  status: 'todo' | 'in_progress' | 'done';
}

export interface WorkspaceTodoList {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  items: WorkspaceTodoItem[];
}

export interface WorkspaceData {
  client?: PlannerClient;
  event: {
    id: string;
    partner1_name: string | null;
    partner2_name: string | null;
    event_date: string | null;
    venue: string | null;
    total_budget: number;
    guest_count_estimate: number;
  };
  vendors: WorkspaceVendor[];
  sharedTodos: WorkspaceTodoList[];
  guestStats: { total: number; confirmed: number; pending: number; declined: number; maybe: number };
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

// ========== PLANNER PROFILE TYPES ==========

export interface PlannerProfileData {
  id: string;
  user_id: string;
  bio: string | null;
  tagline: string | null;
  location: string | null;
  website: string | null;
  years_of_experience: number | null;
  specializations: string[];
  profile_image_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlannerProfileResponse {
  profile: PlannerProfileData | null;
  user: { id: string; name: string | null; email: string | null };
}

export interface UpdatePlannerProfileInput {
  name?: string;
  bio?: string | null;
  tagline?: string | null;
  location?: string | null;
  website?: string | null;
  years_of_experience?: number | null;
  specializations?: string[];
  profile_image_url?: string | null;
  cover_image_url?: string | null;
  phone?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
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
    if (response.error) throw new Error(response.error);
  },

  async archiveClient(id: string): Promise<PlannerClient> {
    const response = await apiClient.post<PlannerClient>(`/planner/clients/${id}/archive`);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to archive client');
    return response.data;
  },

  async unarchiveClient(id: string): Promise<PlannerClient> {
    const response = await apiClient.post<PlannerClient>(`/planner/clients/${id}/unarchive`);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to unarchive client');
    return response.data;
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

  // ========== CALENDAR ==========

  async getCalendarData(): Promise<CalendarData> {
    const response = await apiClient.get<CalendarData>('/planner/calendar');
    if (response.error) throw new Error(response.error);
    return response.data || { events: [], weddingDates: [], todoDueDates: [] };
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

  // ========== CLIENT SHARED TODOS ==========

  async getClientTodos(clientId: string): Promise<ClientTodoList[]> {
    const response = await apiClient.get<ClientTodoList[]>(`/planner/clients/${clientId}/todos`);
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },

  async addClientTodoItem(clientId: string, listId: string, text: string, status?: ClientTodoItem['status']): Promise<ClientTodoItem> {
    const response = await apiClient.post<ClientTodoItem>(
      `/planner/clients/${clientId}/todos/${listId}/items`,
      { text, status }
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to add item');
    return response.data;
  },

  async toggleClientTodoItem(clientId: string, listId: string, itemId: string): Promise<ClientTodoItem> {
    const response = await apiClient.post<ClientTodoItem>(
      `/planner/clients/${clientId}/todos/${listId}/items/${itemId}/toggle`,
      {}
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to toggle item');
    return response.data;
  },

  async deleteClientTodoItem(clientId: string, listId: string, itemId: string): Promise<void> {
    const response = await apiClient.delete(
      `/planner/clients/${clientId}/todos/${listId}/items/${itemId}`
    );
    if (response.error) throw new Error(response.error);
  },

  // ========== CLIENT VISION BOARD (shared) ==========

  /**
   * A client's budget — the same expenses and summary the couple sees on their
   * own budget screen, so the planner reads identical figures.
   */
  async getClientExpenses(clientId: string): Promise<{
    expenses: import('./userService').Expense[];
    summary: import('./userService').ExpenseSummary;
  }> {
    const r = await apiClient.get<{
      expenses: import('./userService').Expense[];
      summary: import('./userService').ExpenseSummary;
    }>(`/planner/clients/${clientId}/expenses`);
    if (r.error || !r.data) throw new Error(r.error || 'Failed to load client budget');
    return r.data;
  },

  async getClientVisionBoard(clientId: string): Promise<import('./visionBoardService').VisionBoardItem[]> {
    const r = await apiClient.get<import('./visionBoardService').VisionBoardItem[]>(`/planner/clients/${clientId}/vision-board`);
    if (r.error) throw new Error(r.error);
    return r.data ?? [];
  },

  async addClientVisionBoardItem(clientId: string, input: import('./visionBoardService').CreateItemInput): Promise<import('./visionBoardService').VisionBoardItem> {
    const r = await apiClient.post<import('./visionBoardService').VisionBoardItem>(`/planner/clients/${clientId}/vision-board`, input);
    if (r.error) throw new Error(r.error);
    return r.data!;
  },

  async updateClientVisionBoardItem(clientId: string, itemId: string, input: import('./visionBoardService').UpdateItemInput): Promise<import('./visionBoardService').VisionBoardItem> {
    const r = await apiClient.patch<import('./visionBoardService').VisionBoardItem>(`/planner/clients/${clientId}/vision-board/${itemId}`, input);
    if (r.error) throw new Error(r.error);
    return r.data!;
  },

  async removeClientVisionBoardItem(clientId: string, itemId: string): Promise<void> {
    await apiClient.delete(`/planner/clients/${clientId}/vision-board/${itemId}`);
  },

  /** Upload an image onto a client's mood board and return its stored URL. */
  async uploadClientVisionBoardImage(clientId: string, file: File): Promise<string> {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const token = apiClient.getAccessToken();
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${API_URL}/planner/clients/${clientId}/vision-board/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
      body: form,
    });

    if (!res.ok) throw new Error('Upload failed');
    const { url } = await res.json();
    return url as string;
  },

  // ========== CLIENT WORKSPACE ==========

  async getClientWorkspace(clientId: string): Promise<WorkspaceData | null> {
    const response = await apiClient.get<WorkspaceData>(`/planner/clients/${clientId}/workspace`);
    if (response.error) throw new Error(response.error);
    return response.data || null;
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

  // ========== PROFILE ==========

  async getMyProfile(): Promise<PlannerProfileResponse> {
    const response = await apiClient.get<PlannerProfileResponse>('/planner/profile');
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to fetch profile');
    return response.data;
  },

  async updateMyProfile(input: UpdatePlannerProfileInput): Promise<PlannerProfileData> {
    const response = await apiClient.patch<PlannerProfileData>('/planner/profile', input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('Failed to update profile');
    return response.data;
  },

  async uploadProfileImage(file: File): Promise<{ key: string; url: string }> {
    const token = apiClient.getAccessToken();
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/planner/profile/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to upload image');
    return { key: data.key as string, url: data.url as string };
  },
};

export default plannerService;
