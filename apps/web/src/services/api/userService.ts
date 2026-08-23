import { apiClient } from './client';

// ========== TYPES ==========

export type GuestStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

export type ExpenseCategory =
  | 'venue'
  | 'catering'
  | 'attire'
  | 'decoration'
  | 'photography'
  | 'music'
  | 'transportation'
  | 'accommodation'
  | 'invitations'
  | 'rings'
  | 'gifts'
  | 'beauty'
  | 'other';

export interface UserEvent {
  id: string;
  user_id: string;
  partner1_name: string | null;
  partner2_name: string | null;
  event_date: string | null;
  venue: string | null;
  total_budget: number;
  guest_count_estimate: number;
  notes: string | null;
  rsvp_code: string;
  rsvp_deadline: string | null;
  rsvp_message: string | null;
  rsvp_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserEventInput {
  partner1Name?: string;
  partner2Name?: string;
  eventDate?: string | null;
  venue?: string | null;
  totalBudget?: number;
  guestCountEstimate?: number;
  notes?: string | null;
  rsvpDeadline?: string | null;
  rsvpMessage?: string | null;
  rsvpClosed?: boolean;
}

export interface Guest {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: GuestStatus;
  guest_group: string | null;
  plus_one: boolean;
  dietary_restrictions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGuestInput {
  name: string;
  email?: string;
  phone?: string;
  status?: GuestStatus;
  group?: string;
  plusOne?: boolean;
  dietaryRestrictions?: string;
  notes?: string;
}

export interface UpdateGuestInput {
  name?: string;
  email?: string | null;
  phone?: string | null;
  status?: GuestStatus;
  group?: string | null;
  plusOne?: boolean;
  dietaryRestrictions?: string | null;
  notes?: string | null;
}

export interface GuestStats {
  total: number;
  pending: number;
  confirmed: number;
  declined: number;
  maybe: number;
}

export interface Expense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  amount_paid: number;
  category: ExpenseCategory;
  expense_date: string | null;
  due_date: string | null;
  paid: boolean;
  notes: string | null;
  vendor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseInput {
  name: string;
  amount: number;
  amountPaid?: number;
  category: ExpenseCategory;
  date?: string;
  dueDate?: string | null;
  paid?: boolean;
  notes?: string;
  vendorId?: string;
}

export interface UpdateExpenseInput {
  name?: string;
  amount?: number;
  amountPaid?: number;
  category?: ExpenseCategory;
  date?: string | null;
  dueDate?: string | null;
  paid?: boolean;
  notes?: string | null;
  vendorId?: string | null;
}

export interface ExpenseSummary {
  total_spent: number;
  total_paid: number;
  /** Outstanding balance across all expenses (amount - amount_paid). */
  total_unpaid: number;
  total_committed: number;
  overdue_total: number;
  overdue_count: number;
  due_soon_total: number;
  next_due: { id: string; name: string; due_date: string; balance: number } | null;
  total_budget: number;
  remaining_budget: number;
  by_category: Record<string, number>;
}

/** Zeroed summary used as the initial value and as an empty-response fallback. */
export const EMPTY_EXPENSE_SUMMARY: ExpenseSummary = {
  total_spent: 0,
  total_paid: 0,
  total_unpaid: 0,
  total_committed: 0,
  overdue_total: 0,
  overdue_count: 0,
  due_soon_total: 0,
  next_due: null,
  total_budget: 0,
  remaining_budget: 0,
  by_category: {},
};

// ── Guest RSVP reminders ─────────────────────────────────────────────────────

export type ReminderFrequency = 'daily' | 'every_3_days' | 'weekly' | 'biweekly' | 'monthly';
export type ReminderChannel = 'email' | 'sms' | 'both';
/** Repeat on a cadence, or send only on days the couple picked. */
export type ReminderScheduleMode = 'recurring' | 'custom_dates';

export interface ReminderDate {
  id: string;
  /** YYYY-MM-DD */
  send_on: string;
  /** Set once this day's reminders have gone out. */
  sent_at: string | null;
}

export interface GuestReminderSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  frequency: ReminderFrequency;
  channel: ReminderChannel;
  target_statuses: GuestStatus[];
  custom_message: string | null;
  stop_days_before: number;
  schedule_mode: ReminderScheduleMode;
  start_date: string | null;
  last_sent_at: string | null;
  next_send_at: string | null;
}

export interface GuestReminderLogEntry {
  id: string;
  guest_id: string | null;
  channel: string;
  destination: string | null;
  status: 'sent' | 'failed' | 'skipped';
  error: string | null;
  trigger: 'scheduled' | 'manual';
  sent_at: string;
}

export interface UpdateReminderSettingsInput {
  enabled?: boolean;
  frequency?: ReminderFrequency;
  channel?: ReminderChannel;
  targetStatuses?: GuestStatus[];
  customMessage?: string | null;
  stopDaysBefore?: number;
  scheduleMode?: ReminderScheduleMode;
  startDate?: string | null;
  /** Replaces the chosen days wholesale. */
  dates?: string[];
}

export interface ReminderRunResult {
  sent: number;
  skipped: number;
  failed: number;
  reason?: string;
}

export interface TodoItem {
  id: string;
  list_id: string;
  text: string;
  completed: boolean;
  status: 'todo' | 'in_progress' | 'done';
  sort_order: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  items: TodoItem[];
}

export interface CreateTodoListInput {
  title: string;
  description?: string;
  isShared?: boolean;
}

export interface UpdateTodoListInput {
  title?: string;
  description?: string | null;
  isCompleted?: boolean;
  isShared?: boolean;
}

export interface CreateTodoItemInput {
  text: string;
  completed?: boolean;
  status?: 'todo' | 'in_progress' | 'done';
}

export interface UpdateTodoItemInput {
  text?: string;
  completed?: boolean;
  status?: 'todo' | 'in_progress' | 'done';
  sortOrder?: number;
  dueDate?: string | null;
}

export interface DashboardData {
  event: UserEvent | null;
  guests: GuestStats;
  expenses: ExpenseSummary;
  todos: {
    total_lists: number;
    total_items: number;
    completed_items: number;
    progress: number;
  };
}

export interface PlannerLink {
  planner_id: string;
  planner_name: string | null;
  planner_email: string | null;
}

// ========== SERVICE ==========

export interface VendorReview {
  id: string;
  vendor_profile_id: string;
  reviewer_user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
  reviewer_name?: string | null;
}

export interface ReviewableVendor {
  vendor_profile_id: string;
  business_name: string;
  category: string | null;
  status: string;
  review: VendorReview | null;
}

export const userService = {
  // ========== USER EVENT ==========

  async getUserEvent(): Promise<UserEvent | null> {
    const response = await apiClient.get<UserEvent>('/users/event');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || null;
  },

  async updateUserEvent(input: UpdateUserEventInput): Promise<UserEvent> {
    const response = await apiClient.patch<UserEvent>('/users/event', input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to update event');
    }
    return response.data;
  },

  // ========== GUESTS ==========

  async getGuests(): Promise<Guest[]> {
    const response = await apiClient.get<Guest[]>('/users/guests');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async getGuestStats(): Promise<GuestStats> {
    const response = await apiClient.get<GuestStats>('/users/guests/stats');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || { total: 0, pending: 0, confirmed: 0, declined: 0, maybe: 0 };
  },

  async getGuest(id: string): Promise<Guest> {
    const response = await apiClient.get<Guest>(`/users/guests/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Guest not found');
    }
    return response.data;
  },

  async createGuest(input: CreateGuestInput): Promise<Guest> {
    const response = await apiClient.post<Guest>('/users/guests', input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to create guest');
    }
    return response.data;
  },

  async updateGuest(id: string, input: UpdateGuestInput): Promise<Guest> {
    const response = await apiClient.patch<Guest>(`/users/guests/${id}`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to update guest');
    }
    return response.data;
  },

  async deleteGuest(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/guests/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  // ========== EXPENSES ==========

  async getExpenses(): Promise<Expense[]> {
    const response = await apiClient.get<Expense[]>('/users/expenses');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async getExpenseSummary(): Promise<ExpenseSummary> {
    const response = await apiClient.get<ExpenseSummary>('/users/expenses/summary');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || EMPTY_EXPENSE_SUMMARY;
  },

  async getExpense(id: string): Promise<Expense> {
    const response = await apiClient.get<Expense>(`/users/expenses/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Expense not found');
    }
    return response.data;
  },

  async createExpense(input: CreateExpenseInput): Promise<Expense> {
    const response = await apiClient.post<Expense>('/users/expenses', input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to create expense');
    }
    return response.data;
  },

  async updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense> {
    const response = await apiClient.patch<Expense>(`/users/expenses/${id}`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to update expense');
    }
    return response.data;
  },

  async deleteExpense(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/expenses/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  // ========== TODO LISTS ==========

  async getTodoLists(): Promise<TodoList[]> {
    const response = await apiClient.get<TodoList[]>('/users/todos');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async getTodoList(id: string): Promise<TodoList> {
    const response = await apiClient.get<TodoList>(`/users/todos/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Todo list not found');
    }
    return response.data;
  },

  async createTodoList(input: CreateTodoListInput): Promise<TodoList> {
    const response = await apiClient.post<TodoList>('/users/todos', input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to create todo list');
    }
    return response.data;
  },

  async updateTodoList(id: string, input: UpdateTodoListInput): Promise<TodoList> {
    const response = await apiClient.patch<TodoList>(`/users/todos/${id}`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to update todo list');
    }
    return response.data;
  },

  async deleteTodoList(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/todos/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  // ========== TODO ITEMS ==========

  async addTodoItem(listId: string, input: CreateTodoItemInput): Promise<TodoItem> {
    const response = await apiClient.post<TodoItem>(`/users/todos/${listId}/items`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to add todo item');
    }
    return response.data;
  },

  async updateTodoItem(listId: string, itemId: string, input: UpdateTodoItemInput): Promise<TodoItem> {
    const response = await apiClient.patch<TodoItem>(`/users/todos/${listId}/items/${itemId}`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to update todo item');
    }
    return response.data;
  },

  async toggleTodoItem(listId: string, itemId: string): Promise<TodoItem> {
    const response = await apiClient.post<TodoItem>(`/users/todos/${listId}/items/${itemId}/toggle`, {});
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to toggle todo item');
    }
    return response.data;
  },

  async deleteTodoItem(listId: string, itemId: string): Promise<void> {
    const response = await apiClient.delete(`/users/todos/${listId}/items/${itemId}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  // ========== DASHBOARD ==========

  async getDashboard(): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>('/users/dashboard');
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to fetch dashboard');
    }
    return response.data;
  },

  async getPlannerLink(): Promise<PlannerLink | null> {
    const response = await apiClient.get<PlannerLink>('/users/planner');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || null;
  },

  // ========== VENDOR REVIEWS ==========

  async getReviewableVendors(): Promise<ReviewableVendor[]> {
    const response = await apiClient.get<ReviewableVendor[]>('/users/reviewable-vendors');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async submitVendorReview(
    vendorProfileId: string,
    input: { rating: number; title?: string | null; comment?: string | null }
  ): Promise<VendorReview> {
    const response = await apiClient.put<VendorReview>(
      `/users/vendors/${vendorProfileId}/review`,
      input
    );
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to submit review');
    }
    return response.data;
  },

  async deleteVendorReview(vendorProfileId: string): Promise<void> {
    const response = await apiClient.delete(`/users/vendors/${vendorProfileId}/review`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  // ========== GUEST REMINDERS ==========

  async getReminderSettings(): Promise<{
    settings: GuestReminderSettings;
    recentLog: GuestReminderLogEntry[];
    dates: ReminderDate[];
  }> {
    const response = await apiClient.get<{
      settings: GuestReminderSettings;
      recentLog: GuestReminderLogEntry[];
      dates: ReminderDate[];
    }>('/users/guest-reminders');
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to load reminder settings');
    }
    return response.data;
  },

  async updateReminderSettings(
    input: UpdateReminderSettingsInput
  ): Promise<GuestReminderSettings & { dates: ReminderDate[] }> {
    const response = await apiClient.patch<GuestReminderSettings & { dates: ReminderDate[] }>('/users/guest-reminders', input);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update reminder settings');
    }
    return response.data;
  },

  async sendRemindersNow(): Promise<ReminderRunResult> {
    const response = await apiClient.post<ReminderRunResult>('/users/guest-reminders/send', {});
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to send reminders');
    }
    return response.data;
  },
};

export default userService;
