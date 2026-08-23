import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { userService } from '../services/userService.js';
import { vendorService } from '../services/vendorService.js';
import { storageService } from '../services/storageService.js';
import { reminderService } from '../services/reminderService.js';

type UploadRequest = Request & { file?: { buffer: Buffer; mimetype: string; originalname: string } };

// ========== VALIDATION SCHEMAS ==========

// User Event schemas
const updateUserEventSchema = z.object({
  partner1Name: z.string().optional(),
  partner2Name: z.string().optional(),
  eventDate: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  totalBudget: z.number().min(0).optional(),
  guestCountEstimate: z.number().min(0).optional(),
  notes: z.string().nullable().optional(),
  rsvpDeadline: z.string().nullable().optional(),
  rsvpMessage: z.string().nullable().optional(),
  rsvpClosed: z.boolean().optional(),
});

// Guest schemas
const createGuestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'declined', 'maybe']).default('pending'),
  group: z.string().optional(),
  plusOne: z.boolean().default(false),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
});

const updateGuestSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  status: z.enum(['pending', 'confirmed', 'declined', 'maybe']).optional(),
  group: z.string().nullable().optional(),
  plusOne: z.boolean().optional(),
  dietaryRestrictions: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// Expense schemas
const expenseCategories = [
  'venue', 'catering', 'attire', 'decoration', 'photography',
  'music', 'transportation', 'accommodation', 'invitations',
  'rings', 'gifts', 'beauty', 'other'
] as const;

const createExpenseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  amountPaid: z.number().min(0).optional(),
  category: z.enum(expenseCategories),
  date: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  paid: z.boolean().default(false),
  notes: z.string().optional(),
  vendorId: z.string().uuid().optional(),
});

const updateExpenseSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  amountPaid: z.number().min(0).optional(),
  category: z.enum(expenseCategories).optional(),
  date: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  paid: z.boolean().optional(),
  notes: z.string().nullable().optional(),
  vendorId: z.string().uuid().nullable().optional(),
});

// Todo schemas
const createTodoListSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isShared: z.boolean().optional(),
});

const updateTodoListSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  isCompleted: z.boolean().optional(),
  isShared: z.boolean().optional(),
});

const createTodoItemSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  completed: z.boolean().default(false),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  dueDate: z.string().optional(),
});

const updateTodoItemSchema = z.object({
  text: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  sortOrder: z.number().optional(),
  dueDate: z.string().nullable().optional(),
});

// Inquiry message schema
const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

// Public RSVP schema
const publicRsvpSchema = z.object({
  rsvpCode: z.string().min(1, 'RSVP code is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  status: z.enum(['confirmed', 'declined']),
  guestCount: z.number().min(1).max(2).optional(),
  dietaryNotes: z.string().optional(),
});

// Guest reminder schedule
const reminderSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(['daily', 'every_3_days', 'weekly', 'biweekly', 'monthly']).optional(),
  channel: z.enum(['email', 'sms', 'both']).optional(),
  targetStatuses: z.array(z.enum(['pending', 'confirmed', 'declined', 'maybe'])).min(1).optional(),
  customMessage: z.string().max(500).nullable().optional(),
  stopDaysBefore: z.number().min(0).max(365).optional(),
  scheduleMode: z.enum(['recurring', 'custom_dates']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').nullable().optional(),
  /** The exact days to send on, in custom_dates mode. Replaces the list. */
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')).max(40).optional(),
});

// ========== CONTROLLER ==========

export const userController = {
  // ========== USER EVENT ==========

  async getUserEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await userService.getUserEvent(req.user!.userId);
      res.json(event);
    } catch (error) {
      next(error);
    }
  },

  async updateUserEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = updateUserEventSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const event = await userService.upsertUserEvent(req.user!.userId, {
        partner1_name: data.partner1Name,
        partner2_name: data.partner2Name,
        event_date: data.eventDate || undefined,
        venue: data.venue || undefined,
        total_budget: data.totalBudget,
        guest_count_estimate: data.guestCountEstimate,
        notes: data.notes || undefined,
        // Passed through as-is so an explicit null clears the deadline.
        rsvp_deadline: data.rsvpDeadline,
        rsvp_message: data.rsvpMessage,
        rsvp_closed: data.rsvpClosed,
      });

      res.json(event);
    } catch (error) {
      next(error);
    }
  },

  // ========== GUESTS ==========

  async getGuests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const guests = await userService.getGuests(req.user!.userId);
      res.json(guests);
    } catch (error) {
      next(error);
    }
  },

  async getGuestStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await userService.getGuestStats(req.user!.userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  async getGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const guest = await userService.getGuest(req.params.id, req.user!.userId);
      if (!guest) {
        res.status(404).json({ error: 'Guest not found' });
        return;
      }
      res.json(guest);
    } catch (error) {
      next(error);
    }
  },

  async createGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = createGuestSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const guest = await userService.createGuest(req.user!.userId, {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone,
        status: data.status,
        guest_group: data.group,
        plus_one: data.plusOne,
        dietary_restrictions: data.dietaryRestrictions,
        notes: data.notes,
      });

      res.status(201).json(guest);
    } catch (error) {
      next(error);
    }
  },

  async updateGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = updateGuestSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const guest = await userService.updateGuest(req.params.id, req.user!.userId, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        guest_group: data.group,
        plus_one: data.plusOne,
        dietary_restrictions: data.dietaryRestrictions,
        notes: data.notes,
      });

      if (!guest) {
        res.status(404).json({ error: 'Guest not found' });
        return;
      }

      res.json(guest);
    } catch (error) {
      next(error);
    }
  },

  async deleteGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await userService.deleteGuest(req.params.id, req.user!.userId);
      if (!deleted) {
        res.status(404).json({ error: 'Guest not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // ========== EXPENSES ==========

  async getExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expenses = await userService.getExpenses(req.user!.userId);
      res.json(expenses);
    } catch (error) {
      next(error);
    }
  },

  async getExpenseSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await userService.getExpenseSummary(req.user!.userId);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  },

  async getExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await userService.getExpense(req.params.id, req.user!.userId);
      if (!expense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }
      res.json(expense);
    } catch (error) {
      next(error);
    }
  },

  async createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = createExpenseSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const expense = await userService.createExpense(req.user!.userId, {
        name: data.name,
        amount: data.amount,
        amount_paid: data.amountPaid,
        category: data.category,
        expense_date: data.date,
        due_date: data.dueDate,
        paid: data.paid,
        notes: data.notes,
        vendor_id: data.vendorId,
      });

      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  },

  async updateExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = updateExpenseSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const expense = await userService.updateExpense(req.params.id, req.user!.userId, {
        name: data.name,
        amount: data.amount,
        amount_paid: data.amountPaid,
        category: data.category,
        expense_date: data.date,
        due_date: data.dueDate,
        paid: data.paid,
        notes: data.notes,
        vendor_id: data.vendorId,
      });

      if (!expense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }

      res.json(expense);
    } catch (error) {
      next(error);
    }
  },

  async deleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await userService.deleteExpense(req.params.id, req.user!.userId);
      if (!deleted) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // ========== TODO LISTS ==========

  async getTodoLists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lists = await userService.getTodoLists(req.user!.userId);
      res.json(lists);
    } catch (error) {
      next(error);
    }
  },

  async getTodoList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await userService.getTodoList(req.params.id, req.user!.userId);
      if (!list) {
        res.status(404).json({ error: 'Todo list not found' });
        return;
      }
      res.json(list);
    } catch (error) {
      next(error);
    }
  },

  async createTodoList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = createTodoListSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const list = await userService.createTodoList(req.user!.userId, {
        title: validation.data.title,
        description: validation.data.description,
        is_shared: validation.data.isShared,
      });
      res.status(201).json(list);
    } catch (error) {
      next(error);
    }
  },

  async updateTodoList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = updateTodoListSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const list = await userService.updateTodoList(req.params.id, req.user!.userId, {
        title: data.title,
        description: data.description,
        is_completed: data.isCompleted,
        is_shared: data.isShared,
      });

      if (!list) {
        res.status(404).json({ error: 'Todo list not found' });
        return;
      }

      res.json(list);
    } catch (error) {
      next(error);
    }
  },

  async deleteTodoList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await userService.deleteTodoList(req.params.id, req.user!.userId);
      if (!deleted) {
        res.status(404).json({ error: 'Todo list not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // ========== TODO ITEMS ==========

  async addTodoItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = createTodoItemSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      // Map explicitly rather than spreading: the request uses camelCase while
      // the model expects snake_case, so a spread silently dropped the due date
      // and the item never reached anyone's calendar.
      const item = await userService.addTodoItem(req.params.id, req.user!.userId, {
        text: data.text,
        completed: data.completed,
        status: data.status,
        due_date: data.dueDate ?? null,
      });
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof Error && error.message === 'Todo list not found') {
        res.status(404).json({ error: 'Todo list not found' });
        return;
      }
      next(error);
    }
  },

  async updateTodoItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = updateTodoItemSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const item = await userService.updateTodoItem(req.params.itemId, req.user!.userId, {
        text: data.text,
        completed: data.completed,
        status: data.status,
        sort_order: data.sortOrder,
        due_date: data.dueDate !== undefined ? (data.dueDate ?? null) : undefined,
      });

      if (!item) {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }

      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  async toggleTodoItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await userService.toggleTodoItem(req.params.itemId, req.user!.userId);
      if (!item) {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  async deleteTodoItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await userService.deleteTodoItem(req.params.itemId, req.user!.userId);
      if (!deleted) {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // ========== DASHBOARD ==========

  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await userService.getDashboardData(req.user!.userId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async getPlannerLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const link = await userService.getPlannerLink(req.user!.userId);
      res.json(link);
    } catch (error) {
      next(error);
    }
  },

  // ========== CLIENT INQUIRIES ==========

  async listMyInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inquiries = await vendorService.listClientInquiries(req.user!.userId);
      res.json(inquiries);
    } catch (error) {
      next(error);
    }
  },

  async getMyInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await vendorService.getClientInquiryWithMessages(req.user!.userId, req.params.id);
      if (!result) {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async sendMyInquiryMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = sendMessageSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const message = await vendorService.sendInquiryMessageAsClient(
        req.user!.userId,
        req.params.id,
        validation.data.message
      );
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof Error && error.message === 'Inquiry not found') {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }
      next(error);
    }
  },

  // ========== IMAGE UPLOAD ==========

  async uploadImage(req: UploadRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      const result = await storageService.uploadImage(`users/${req.user!.userId}/registry`, req.file);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // ========== PUBLIC RSVP (No auth required) ==========

  async getEventInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      if (!code) {
        res.status(400).json({ error: 'RSVP code is required' });
        return;
      }

      const event = await userService.getEventByRsvpCode(code);
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      res.json({
        partner1Name: event.partner1Name,
        partner2Name: event.partner2Name,
        eventDate: event.eventDate,
        venue: event.venue,
        storySlug: event.storySlug,
        rsvpDeadline: event.rsvpDeadline,
        rsvpMessage: event.rsvpMessage,
        // Still a 200: the guest gets the event details plus the reason the
        // form is closed, rather than a bare "invalid link".
        rsvpClosed: event.rsvpClosed,
        closedReason: event.closedReason,
      });
    } catch (error) {
      next(error);
    }
  },

  async submitPublicRsvp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = publicRsvpSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const guest = await userService.submitPublicRsvp(data.rsvpCode, {
        name: data.name,
        email: data.email || undefined,
        status: data.status,
        guestCount: data.guestCount,
        dietaryNotes: data.dietaryNotes,
      });

      res.status(201).json({
        success: true,
        message: data.status === 'confirmed'
          ? 'Thank you! We can\'t wait to celebrate with you!'
          : 'Thank you for letting us know. We\'ll miss you!',
        guest: {
          id: guest.id,
          name: guest.name,
          status: guest.status,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid RSVP code') {
        res.status(404).json({ error: 'Invalid RSVP code' });
        return;
      }
      if (error instanceof Error && (error as Error & { statusCode?: number }).statusCode === 409) {
        res.status(409).json({ error: error.message });
        return;
      }
      // 410 Gone: the link was valid but the RSVP window has closed.
      if (error instanceof Error && (error as Error & { statusCode?: number }).statusCode === 410) {
        res.status(410).json({ error: error.message, rsvpClosed: true });
        return;
      }
      next(error);
    }
  },

  async getRsvpCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = await userService.getRsvpCode(req.user!.userId);
      res.json({ rsvpCode: code });
    } catch (error) {
      next(error);
    }
  },

  // ========== GUEST REMINDERS ==========

  async getReminderSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { settings, recentLog, dates } = await reminderService.getSettings(req.user!.userId);
      res.json({ settings, recentLog, dates });
    } catch (error) {
      next(error);
    }
  },

  async updateReminderSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = reminderSettingsSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;

      // Dates first: enabling reads the resulting list to pick the next send.
      if (data.dates !== undefined) {
        await reminderService.setDates(req.user!.userId, data.dates);
      }

      const settings = await reminderService.updateSettings(req.user!.userId, {
        enabled: data.enabled,
        frequency: data.frequency,
        channel: data.channel,
        target_statuses: data.targetStatuses,
        custom_message: data.customMessage,
        stop_days_before: data.stopDaysBefore,
        schedule_mode: data.scheduleMode,
        start_date: data.startDate,
      });

      const dates = await reminderService.getSettings(req.user!.userId);
      res.json({ ...settings, dates: dates.dates });
    } catch (error) {
      next(error);
    }
  },

  /** Fire a round of reminders immediately, independent of the schedule. */
  async sendRemindersNow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await reminderService.sendReminders(req.user!.userId, 'manual');
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // ========== WORKSPACE ==========

  async getWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspace = await userService.getWorkspace(req.user!.userId);
      if (!workspace) {
        res.status(404).json({ error: 'No event found' });
        return;
      }
      res.json(workspace);
    } catch (error) {
      next(error);
    }
  },

  // ========== PROJECT ==========

  async getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await userService.getProject(req.user!.userId);
      res.json(project);
    } catch (error) {
      next(error);
    }
  },

  async addProjectVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        vendorProfileId: z.string().uuid(),
        category: z.string().optional(),
        status: z.enum(['inquired', 'quoted', 'booked', 'confirmed', 'cancelled']).optional(),
        amount: z.number().min(0).optional(),
        notes: z.string().optional(),
      });
      const data = schema.parse(req.body);
      const pv = await userService.addProjectVendor(req.user!.userId, {
        vendor_profile_id: data.vendorProfileId,
        category: data.category,
        status: data.status,
        amount: data.amount,
        notes: data.notes,
      });
      res.status(201).json(pv);
    } catch (error) {
      if (error instanceof Error && error.message === 'Vendor already on project') {
        res.status(409).json({ error: 'Vendor already on project' });
        return;
      }
      next(error);
    }
  },

  async updateProjectVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        status: z.enum(['inquired', 'quoted', 'booked', 'confirmed', 'cancelled']).optional(),
        amount: z.number().min(0).nullable().optional(),
        notes: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
      });
      const data = schema.parse(req.body);
      const pv = await userService.updateProjectVendor(req.user!.userId, String(req.params.id), data);
      if (!pv) {
        res.status(404).json({ error: 'Project vendor not found' });
        return;
      }
      res.json(pv);
    } catch (error) {
      next(error);
    }
  },

  async removeProjectVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await userService.removeProjectVendor(req.user!.userId, String(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: 'Project vendor not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // ========== VENDOR REVIEWS ==========

  async getReviewableVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendors = await userService.getReviewableVendors(req.user!.userId);
      res.json(vendors);
    } catch (error) {
      next(error);
    }
  },

  async submitVendorReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        rating: z.number().int().min(1).max(5),
        title: z.string().max(150).nullable().optional(),
        comment: z.string().max(2000).nullable().optional(),
      });
      const data = schema.parse(req.body);
      const review = await userService.submitVendorReview(
        req.user!.userId,
        String(req.params.vendorProfileId),
        data
      );
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('You can only review')) {
        res.status(403).json({ error: error.message });
        return;
      }
      next(error);
    }
  },

  async deleteVendorReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await userService.deleteVendorReview(
        req.user!.userId,
        String(req.params.vendorProfileId)
      );
      if (!deleted) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
