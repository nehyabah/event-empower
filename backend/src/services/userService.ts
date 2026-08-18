import { UserEventModel, UserEvent, CreateUserEventInput, UpdateUserEventInput } from '../models/UserEvent.js';
import { query } from '../config/database.js';
import { GuestModel, Guest, CreateGuestInput, UpdateGuestInput, GuestStatus } from '../models/Guest.js';
import { ExpenseModel, Expense, CreateExpenseInput, UpdateExpenseInput, ExpenseCategory } from '../models/Expense.js';
import { TodoListModel, TodoItemModel, TodoList, TodoItem, CreateTodoListInput, UpdateTodoListInput, CreateTodoItemInput, UpdateTodoItemInput } from '../models/TodoList.js';
import { PlannerClientModel, PlannerLink } from '../models/PlannerClient.js';
import { ProjectVendorModel, ProjectVendor, CreateProjectVendorInput, UpdateProjectVendorInput } from '../models/ProjectVendor.js';
import { CoupleStoryModel } from '../models/CoupleStory.js';
import { VendorReviewModel, VendorReview } from '../models/VendorReview.js';

/**
 * Why RSVPs are no longer being accepted, or null while the link is open.
 *
 * The deadline is a whole day: a deadline of the 10th still accepts responses
 * throughout the 10th and closes at the start of the 11th.
 */
function rsvpClosure(event: UserEvent): string | null {
  if (event.rsvp_closed) {
    return 'RSVPs for this event have been closed by the couple.';
  }

  if (event.rsvp_deadline) {
    const deadline = new Date(event.rsvp_deadline);
    deadline.setHours(23, 59, 59, 999);
    if (Number.isFinite(deadline.getTime()) && new Date() > deadline) {
      const formatted = deadline.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      return `RSVPs closed on ${formatted}. Please contact the couple directly.`;
    }
  }

  return null;
}

export const userService = {
  // ========== USER EVENT ==========

  async getUserEvent(userId: string): Promise<UserEvent | null> {
    return UserEventModel.findByUserId(userId);
  },

  async createUserEvent(userId: string, input: Omit<CreateUserEventInput, 'user_id'>): Promise<UserEvent> {
    return UserEventModel.create({
      ...input,
      user_id: userId,
    });
  },

  async updateUserEvent(userId: string, input: UpdateUserEventInput): Promise<UserEvent | null> {
    return UserEventModel.update(userId, input);
  },

  async upsertUserEvent(userId: string, input: Omit<CreateUserEventInput, 'user_id'>): Promise<UserEvent> {
    return UserEventModel.upsert({
      ...input,
      user_id: userId,
    });
  },

  // ========== PROJECT (event + planner + vendor roster) ==========

  async getProject(userId: string): Promise<{ event: UserEvent; vendors: ProjectVendor[] } | null> {
    const event = await UserEventModel.findByUserId(userId);
    if (!event) return null;
    const vendors = await ProjectVendorModel.findByEventId(event.id);
    return { event, vendors };
  },

  async getWorkspace(userId: string) {
    const event = await UserEventModel.findByUserId(userId);
    if (!event) return null;
    const [planner, vendors, sharedTodos, guestStats] = await Promise.all([
      PlannerClientModel.findPlannerLinkByUserId(userId),
      // The couple's vendor roster lives in project_vendors — the same source
      // getProject uses. This previously read vendor_bookings.client_id, which
      // is only set for bookings a vendor explicitly linked, so the roster card
      // was almost always empty.
      query<{
        id: string; vendor_id: string; business_name: string | null;
        vendor_category: string | null; status: string;
        amount: number | null; notes: string | null;
      }>(
        `SELECT pv.id, pv.vendor_profile_id AS vendor_id, vp.business_name,
                COALESCE(pv.category, vp.category) AS vendor_category,
                pv.status, pv.amount, pv.notes
         FROM project_vendors pv
         JOIN user_events ue ON ue.id = pv.event_id
         LEFT JOIN vendor_profiles vp ON vp.id = pv.vendor_profile_id
         WHERE ue.user_id = $1
         ORDER BY pv.created_at ASC`,
        [userId]
      ),
      // The owner's own workspace: every list of theirs, shared or not.
      // Only the planner-facing reads go through findSharedByUserId.
      TodoListModel.findByUserIdWithItems(userId),
      GuestModel.countByUserId(userId),
    ]);
    return { event, planner: planner || null, vendors, sharedTodos, guestStats };
  },

  async addProjectVendor(userId: string, input: Omit<CreateProjectVendorInput, 'event_id' | 'added_by'>): Promise<ProjectVendor> {
    const event = await UserEventModel.findByUserId(userId);
    if (!event) throw new Error('No event found for user');

    const existing = await ProjectVendorModel.findByEventAndVendor(event.id, input.vendor_profile_id);
    if (existing) throw new Error('Vendor already on project');

    return ProjectVendorModel.create({ ...input, event_id: event.id, added_by: userId });
  },

  async updateProjectVendor(userId: string, projectVendorId: string, input: UpdateProjectVendorInput): Promise<ProjectVendor | null> {
    const event = await UserEventModel.findByUserId(userId);
    if (!event) return null;

    const pv = await ProjectVendorModel.findById(projectVendorId);
    if (!pv || pv.event_id !== event.id) return null;

    return ProjectVendorModel.update(projectVendorId, input);
  },

  async removeProjectVendor(userId: string, projectVendorId: string): Promise<boolean> {
    const event = await UserEventModel.findByUserId(userId);
    if (!event) return false;

    const pv = await ProjectVendorModel.findById(projectVendorId);
    if (!pv || pv.event_id !== event.id) return false;

    return ProjectVendorModel.delete(projectVendorId);
  },

  // ========== VENDOR REVIEWS ==========
  // A couple may only review a vendor they have actually used: one that is on
  // their project roster with status 'booked' or 'confirmed'.

  async getReviewableVendors(userId: string): Promise<Array<{
    vendor_profile_id: string;
    business_name: string;
    category: string | null;
    status: string;
    review: VendorReview | null;
  }>> {
    const event = await UserEventModel.findByUserId(userId);
    if (!event) return [];

    const vendors = await ProjectVendorModel.findByEventId(event.id);
    const used = vendors.filter((v) => v.status === 'booked' || v.status === 'confirmed');

    return Promise.all(
      used.map(async (v) => ({
        vendor_profile_id: v.vendor_profile_id,
        business_name: v.business_name || 'Vendor',
        category: v.vendor_category || v.category,
        status: v.status,
        review: await VendorReviewModel.findByReviewerAndVendor(userId, v.vendor_profile_id),
      }))
    );
  },

  // Returns true only if this couple has booked/confirmed this vendor
  async hasUsedVendor(userId: string, vendorProfileId: string): Promise<{ ok: boolean; eventId: string | null }> {
    const event = await UserEventModel.findByUserId(userId);
    if (!event) return { ok: false, eventId: null };
    const pv = await ProjectVendorModel.findByEventAndVendor(event.id, vendorProfileId);
    const ok = !!pv && (pv.status === 'booked' || pv.status === 'confirmed');
    return { ok, eventId: event.id };
  },

  async submitVendorReview(
    userId: string,
    vendorProfileId: string,
    input: { rating: number; title?: string | null; comment?: string | null }
  ): Promise<VendorReview> {
    const { ok, eventId } = await this.hasUsedVendor(userId, vendorProfileId);
    if (!ok) {
      throw new Error('You can only review vendors you have booked or confirmed');
    }
    return VendorReviewModel.upsert({
      vendor_profile_id: vendorProfileId,
      reviewer_user_id: userId,
      event_id: eventId,
      rating: input.rating,
      title: input.title ?? null,
      comment: input.comment ?? null,
    });
  },

  async deleteVendorReview(userId: string, vendorProfileId: string): Promise<boolean> {
    return VendorReviewModel.deleteByReviewerAndVendor(userId, vendorProfileId);
  },

  // ========== GUESTS ==========

  async getGuests(userId: string): Promise<Guest[]> {
    return GuestModel.findByUserId(userId);
  },

  async getGuestsByStatus(userId: string, status: GuestStatus): Promise<Guest[]> {
    return GuestModel.findByUserIdAndStatus(userId, status);
  },

  async getGuest(id: string, userId: string): Promise<Guest | null> {
    const guest = await GuestModel.findById(id);
    if (!guest || guest.user_id !== userId) {
      return null;
    }
    return guest;
  },

  async createGuest(userId: string, input: Omit<CreateGuestInput, 'user_id'>): Promise<Guest> {
    return GuestModel.create({
      ...input,
      user_id: userId,
    });
  },

  async updateGuest(id: string, userId: string, input: UpdateGuestInput): Promise<Guest | null> {
    const guest = await this.getGuest(id, userId);
    if (!guest) {
      return null;
    }
    return GuestModel.update(id, input);
  },

  async deleteGuest(id: string, userId: string): Promise<boolean> {
    const guest = await this.getGuest(id, userId);
    if (!guest) {
      return false;
    }
    return GuestModel.delete(id);
  },

  async getGuestStats(userId: string) {
    return GuestModel.countByUserId(userId);
  },

  // ========== EXPENSES ==========

  async getExpenses(userId: string): Promise<Expense[]> {
    return ExpenseModel.findByUserId(userId);
  },

  async getExpensesByCategory(userId: string, category: ExpenseCategory): Promise<Expense[]> {
    return ExpenseModel.findByUserIdAndCategory(userId, category);
  },

  async getExpense(id: string, userId: string): Promise<Expense | null> {
    const expense = await ExpenseModel.findById(id);
    if (!expense || expense.user_id !== userId) {
      return null;
    }
    return expense;
  },

  async createExpense(userId: string, input: Omit<CreateExpenseInput, 'user_id'>): Promise<Expense> {
    const amountPaid = input.amount_paid ?? (input.paid ? input.amount : 0);
    const normalizedAmountPaid = Math.min(Math.max(amountPaid, 0), input.amount);
    const paid = normalizedAmountPaid >= input.amount;
    return ExpenseModel.create({
      ...input,
      user_id: userId,
      amount_paid: normalizedAmountPaid,
      paid,
    });
  },

  async updateExpense(id: string, userId: string, input: UpdateExpenseInput): Promise<Expense | null> {
    const expense = await this.getExpense(id, userId);
    if (!expense) {
      return null;
    }

    const nextAmount = input.amount ?? expense.amount;
    let nextAmountPaid = input.amount_paid ?? expense.amount_paid;
    if (input.paid === true && input.amount_paid === undefined) {
      nextAmountPaid = nextAmount;
    }

    nextAmountPaid = Math.min(Math.max(nextAmountPaid, 0), nextAmount);
    const nextPaid = nextAmountPaid >= nextAmount;

    return ExpenseModel.update(id, {
      name: input.name ?? expense.name,
      amount: nextAmount,
      amount_paid: nextAmountPaid,
      category: input.category ?? expense.category,
      expense_date: input.expense_date ?? expense.expense_date,
      paid: nextPaid,
      notes: input.notes ?? expense.notes,
      vendor_id: input.vendor_id ?? expense.vendor_id,
    });
  },

  async deleteExpense(id: string, userId: string): Promise<boolean> {
    const expense = await this.getExpense(id, userId);
    if (!expense) {
      return false;
    }
    return ExpenseModel.delete(id);
  },

  async getExpenseSummary(userId: string) {
    const [summary, userEvent] = await Promise.all([
      ExpenseModel.getSummaryByUserId(userId),
      this.getUserEvent(userId),
    ]);

    return {
      ...summary,
      total_budget: userEvent?.total_budget || 0,
      remaining_budget: (userEvent?.total_budget || 0) - summary.total_spent,
    };
  },

  // ========== TODO LISTS ==========

  async getTodoLists(userId: string): Promise<TodoList[]> {
    return TodoListModel.findByUserIdWithItems(userId);
  },

  async getTodoList(id: string, userId: string): Promise<TodoList | null> {
    const list = await TodoListModel.findByIdWithItems(id);
    if (!list || list.user_id !== userId) {
      return null;
    }
    return list;
  },

  async createTodoList(userId: string, input: Omit<CreateTodoListInput, 'user_id'>): Promise<TodoList> {
    return TodoListModel.create({
      ...input,
      user_id: userId,
    });
  },

  async updateTodoList(id: string, userId: string, input: UpdateTodoListInput): Promise<TodoList | null> {
    const list = await this.getTodoList(id, userId);
    if (!list) {
      return null;
    }
    return TodoListModel.update(id, input);
  },

  async deleteTodoList(id: string, userId: string): Promise<boolean> {
    const list = await this.getTodoList(id, userId);
    if (!list) {
      return false;
    }
    return TodoListModel.delete(id);
  },

  // ========== TODO ITEMS ==========

  async addTodoItem(listId: string, userId: string, input: Omit<CreateTodoItemInput, 'list_id'>): Promise<TodoItem> {
    // Verify list belongs to user
    const list = await this.getTodoList(listId, userId);
    if (!list) {
      throw new Error('Todo list not found');
    }

    return TodoItemModel.create({
      ...input,
      list_id: listId,
    });
  },

  async updateTodoItem(itemId: string, userId: string, input: UpdateTodoItemInput): Promise<TodoItem | null> {
    const item = await TodoItemModel.findById(itemId);
    if (!item) {
      return null;
    }

    // Verify list belongs to user
    const list = await this.getTodoList(item.list_id, userId);
    if (!list) {
      return null;
    }

    return TodoItemModel.update(itemId, input);
  },

  async toggleTodoItem(itemId: string, userId: string): Promise<TodoItem | null> {
    const item = await TodoItemModel.findById(itemId);
    if (!item) {
      return null;
    }

    // Verify list belongs to user
    const list = await this.getTodoList(item.list_id, userId);
    if (!list) {
      return null;
    }

    return TodoItemModel.toggleCompleted(itemId);
  },

  async deleteTodoItem(itemId: string, userId: string): Promise<boolean> {
    const item = await TodoItemModel.findById(itemId);
    if (!item) {
      return false;
    }

    // Verify list belongs to user
    const list = await this.getTodoList(item.list_id, userId);
    if (!list) {
      return false;
    }

    return TodoItemModel.delete(itemId);
  },

  // ========== DASHBOARD ==========

  async getDashboardData(userId: string) {
    const [userEvent, guestStats, expenseSummary, todoLists] = await Promise.all([
      this.getUserEvent(userId),
      this.getGuestStats(userId),
      this.getExpenseSummary(userId),
      this.getTodoLists(userId),
    ]);

    // Calculate todo progress
    const totalTodoItems = todoLists.reduce((sum, list) => sum + (list.items?.length || 0), 0);
    const completedTodoItems = todoLists.reduce(
      (sum, list) => sum + (list.items?.filter(item => item.completed).length || 0),
      0
    );

    return {
      event: userEvent,
      guests: guestStats,
      expenses: expenseSummary,
      todos: {
        total_lists: todoLists.length,
        total_items: totalTodoItems,
        completed_items: completedTodoItems,
        progress: totalTodoItems > 0 ? Math.round((completedTodoItems / totalTodoItems) * 100) : 0,
      },
    };
  },

  async getPlannerLink(userId: string): Promise<PlannerLink | null> {
    return PlannerClientModel.findPlannerLinkByUserId(userId);
  },

  // ========== PUBLIC RSVP ==========

  async getEventByRsvpCode(rsvpCode: string): Promise<{
    userId: string;
    partner1Name: string | null;
    partner2Name: string | null;
    eventDate: Date | null;
    venue: string | null;
    storySlug: string | null;
    rsvpDeadline: Date | null;
    rsvpMessage: string | null;
    rsvpClosed: boolean;
    closedReason: string | null;
  } | null> {
    const event = await UserEventModel.findByRsvpCode(rsvpCode);
    if (!event) {
      return null;
    }
    const story = await CoupleStoryModel.findByUserId(event.user_id);
    const storySlug = (story?.site_published && story?.slug) ? story.slug : null;
    const closure = rsvpClosure(event);

    return {
      userId: event.user_id,
      partner1Name: event.partner1_name,
      partner2Name: event.partner2_name,
      eventDate: event.event_date,
      venue: event.venue,
      storySlug,
      rsvpDeadline: event.rsvp_deadline,
      rsvpMessage: event.rsvp_message,
      // The page still resolves after the deadline — it just stops accepting
      // responses, so a late guest gets an explanation rather than a 404.
      rsvpClosed: closure !== null,
      closedReason: closure,
    };
  },

  async submitPublicRsvp(rsvpCode: string, input: {
    name: string;
    email?: string;
    status: 'confirmed' | 'declined';
    guestCount?: number;
    dietaryNotes?: string;
  }): Promise<Guest> {
    const event = await UserEventModel.findByRsvpCode(rsvpCode);
    if (!event) {
      throw new Error('Invalid RSVP code');
    }

    // The link keeps resolving past the deadline so guests see why it closed,
    // but it stops accepting responses.
    const closure = rsvpClosure(event);
    if (closure) {
      const err = new Error(closure);
      (err as Error & { statusCode?: number }).statusCode = 410;
      throw err;
    }

    // Check if guest already exists by name (case-insensitive)
    const existingGuests = await GuestModel.findByUserId(event.user_id);
    const existingGuest = existingGuests.find(
      g => g.name.toLowerCase() === input.name.toLowerCase()
    );

    if (existingGuest) {
      // A guest may only flip their response (accept → decline or vice versa)
      if (existingGuest.status === input.status) {
        const err = new Error(
          input.status === 'confirmed'
            ? 'You have already accepted this invitation'
            : 'You have already declined this invitation'
        );
        (err as Error & { statusCode?: number }).statusCode = 409;
        throw err;
      }
      // Only overwrite the party size when this submission actually states one.
      // A guest flipping their answer without re-entering a count must not have
      // their existing party size silently reset to 1.
      const partySize = input.guestCount ?? existingGuest.guest_count ?? 1;

      const updated = await GuestModel.update(existingGuest.id, {
        status: input.status,
        email: input.email || existingGuest.email,
        dietary_restrictions: input.dietaryNotes || existingGuest.dietary_restrictions,
        plus_one: partySize > 1,
        guest_count: partySize,
        rsvp_responded_at: new Date(),
      });
      return updated!;
    }

    // Create new guest
    return GuestModel.create({
      user_id: event.user_id,
      name: input.name,
      email: input.email,
      status: input.status,
      plus_one: (input.guestCount || 1) > 1,
      guest_count: input.guestCount || 1,
      rsvp_responded_at: new Date(),
      dietary_restrictions: input.dietaryNotes,
      guest_group: 'RSVP',
    });
  },

  async getRsvpCode(userId: string): Promise<string | null> {
    const event = await UserEventModel.findByUserId(userId);
    return event?.rsvp_code || null;
  },
};
