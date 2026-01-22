import { UserEventModel, UserEvent, CreateUserEventInput, UpdateUserEventInput } from '../models/UserEvent.js';
import { GuestModel, Guest, CreateGuestInput, UpdateGuestInput, GuestStatus } from '../models/Guest.js';
import { ExpenseModel, Expense, CreateExpenseInput, UpdateExpenseInput, ExpenseCategory } from '../models/Expense.js';
import { TodoListModel, TodoItemModel, TodoList, TodoItem, CreateTodoListInput, UpdateTodoListInput, CreateTodoItemInput, UpdateTodoItemInput } from '../models/TodoList.js';
import { PlannerClientModel, PlannerLink } from '../models/PlannerClient.js';

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
};
