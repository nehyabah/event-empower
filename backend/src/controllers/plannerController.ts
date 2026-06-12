import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { plannerService } from '../services/plannerService.js';

// ========== VALIDATION SCHEMAS ==========

const createClientSchema = z.object({
  partner1Name: z.string().min(1, 'Partner 1 name is required'),
  partner2Name: z.string().min(1, 'Partner 2 name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  eventType: z.string().default('Wedding'),
  eventDate: z.string().optional(),
  status: z.enum(['active', 'completed', 'upcoming']).default('upcoming'),
  budget: z.number().optional(),
  venue: z.string().optional(),
  guestCount: z.number().optional(),
  notes: z.string().optional(),
});

const updateClientSchema = z.object({
  partner1Name: z.string().min(1).optional(),
  partner2Name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().nullable().optional(),
  status: z.enum(['active', 'completed', 'upcoming']).optional(),
  budget: z.number().nullable().optional(),
  venue: z.string().nullable().optional(),
  guestCount: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const createTaskSchema = z.object({
  clientId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

const updateTaskSchema = z.object({
  clientId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const createEventSchema = z.object({
  clientId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  eventDate: z.string().min(1, 'Event date is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  eventType: z.enum(['meeting', 'visit', 'rehearsal', 'wedding', 'consultation', 'other']).default('meeting'),
  location: z.string().optional(),
});

const updateEventSchema = z.object({
  clientId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  eventDate: z.string().optional(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  eventType: z.enum(['meeting', 'visit', 'rehearsal', 'wedding', 'consultation', 'other']).optional(),
  location: z.string().nullable().optional(),
});

const inviteSchema = z.object({
  clientId: z.string().uuid(),
});

const addClientTodoItemSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
});

const updateClientTodoItemSchema = z.object({
  text: z.string().min(1).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  completed: z.boolean().optional(),
});

// ========== CONTROLLER ==========

export const plannerController = {
  // ========== CLIENTS ==========

  async getClients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clients = await plannerService.getClients(req.user!.userId);
      res.json(clients);
    } catch (error) {
      next(error);
    }
  },

  async getClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await plannerService.getClient(req.params.id, req.user!.userId);
      if (!client) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }
      res.json(client);
    } catch (error) {
      next(error);
    }
  },

  async createClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createClientSchema.parse(req.body);
      const client = await plannerService.createClient(req.user!.userId, {
        partner1_name: input.partner1Name,
        partner2_name: input.partner2Name,
        email: input.email,
        phone: input.phone,
        event_type: input.eventType,
        event_date: input.eventDate,
        status: input.status,
        budget: input.budget,
        venue: input.venue,
        guest_count: input.guestCount,
        notes: input.notes,
      });
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  },

  async updateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = updateClientSchema.parse(req.body);
      const client = await plannerService.updateClient(req.params.id, req.user!.userId, {
        partner1_name: input.partner1Name,
        partner2_name: input.partner2Name,
        email: input.email,
        phone: input.phone,
        event_type: input.eventType,
        event_date: input.eventDate,
        status: input.status,
        budget: input.budget,
        venue: input.venue,
        guest_count: input.guestCount,
        notes: input.notes,
      });
      if (!client) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }
      res.json(client);
    } catch (error) {
      next(error);
    }
  },

  async deleteClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await plannerService.deleteClient(req.params.id, req.user!.userId);
      if (!deleted) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }
      res.json({ message: 'Client deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // ========== TASKS ==========

  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.query.clientId as string | undefined;
      const tasks = await plannerService.getTasks(req.user!.userId, clientId);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  },

  async getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await plannerService.getTask(req.params.id, req.user!.userId);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createTaskSchema.parse(req.body);
      const task = await plannerService.createTask(req.user!.userId, {
        client_id: input.clientId,
        title: input.title,
        description: input.description,
        due_date: input.dueDate,
        status: input.status,
        priority: input.priority,
      });
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = updateTaskSchema.parse(req.body);
      const task = await plannerService.updateTask(req.params.id, req.user!.userId, {
        client_id: input.clientId,
        title: input.title,
        description: input.description,
        due_date: input.dueDate,
        status: input.status,
        priority: input.priority,
      });
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await plannerService.deleteTask(req.params.id, req.user!.userId);
      if (!deleted) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // ========== EVENTS ==========

  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const events = await plannerService.getEvents(req.user!.userId, startDate, endDate);
      res.json(events);
    } catch (error) {
      next(error);
    }
  },

  async getEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await plannerService.getEvent(req.params.id, req.user!.userId);
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
      res.json(event);
    } catch (error) {
      next(error);
    }
  },

  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createEventSchema.parse(req.body);
      const event = await plannerService.createEvent(req.user!.userId, {
        client_id: input.clientId,
        title: input.title,
        description: input.description,
        event_date: input.eventDate,
        start_time: input.startTime,
        end_time: input.endTime,
        event_type: input.eventType,
        location: input.location,
      });
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  },

  async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = updateEventSchema.parse(req.body);
      const event = await plannerService.updateEvent(req.params.id, req.user!.userId, {
        client_id: input.clientId,
        title: input.title,
        description: input.description,
        event_date: input.eventDate,
        start_time: input.startTime,
        end_time: input.endTime,
        event_type: input.eventType,
        location: input.location,
      });
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
      res.json(event);
    } catch (error) {
      next(error);
    }
  },

  async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await plannerService.deleteEvent(req.params.id, req.user!.userId);
      if (!deleted) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // ========== CLIENT WORKSPACE ==========

  async getClientWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspace = await plannerService.getClientWorkspace(req.user!.userId, String(req.params.clientId));
      if (!workspace) {
        res.status(404).json({ error: 'Client workspace not found' });
        return;
      }
      res.json(workspace);
    } catch (error) {
      next(error);
    }
  },

  // ========== CLIENT PROJECT ==========

  async getClientProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await plannerService.getClientProject(req.user!.userId, String(req.params.clientId));
      if (!project) {
        res.status(404).json({ error: 'Client project not found' });
        return;
      }
      res.json(project);
    } catch (error) {
      next(error);
    }
  },

  async addClientProjectVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        vendorProfileId: z.string().uuid(),
        category: z.string().optional(),
        status: z.enum(['inquired', 'quoted', 'booked', 'confirmed', 'cancelled']).optional(),
        amount: z.number().min(0).optional(),
        notes: z.string().optional(),
      });
      const data = schema.parse(req.body);
      const pv = await plannerService.addClientProjectVendor(req.user!.userId, String(req.params.clientId), {
        vendor_profile_id: data.vendorProfileId,
        category: data.category,
        status: data.status,
        amount: data.amount,
        notes: data.notes,
      });
      res.status(201).json(pv);
    } catch (error) {
      if (error instanceof Error && error.message === 'Client project not found') {
        res.status(404).json({ error: 'Client project not found' });
        return;
      }
      next(error);
    }
  },

  async updateClientProjectVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        status: z.enum(['inquired', 'quoted', 'booked', 'confirmed', 'cancelled']).optional(),
        amount: z.number().min(0).nullable().optional(),
        notes: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
      });
      const data = schema.parse(req.body);
      const pv = await plannerService.updateClientProjectVendor(
        req.user!.userId,
        String(req.params.clientId),
        String(req.params.vendorId),
        data
      );
      if (!pv) {
        res.status(404).json({ error: 'Project vendor not found' });
        return;
      }
      res.json(pv);
    } catch (error) {
      next(error);
    }
  },

  async removeClientProjectVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await plannerService.removeClientProjectVendor(
        req.user!.userId,
        String(req.params.clientId),
        String(req.params.vendorId)
      );
      if (!deleted) {
        res.status(404).json({ error: 'Project vendor not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // ========== CLIENT TODO LISTS (shared) ==========

  async getClientTodos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const todos = await plannerService.getClientSharedTodos(req.user!.userId, String(req.params.clientId));
      res.json(todos);
    } catch (error) {
      next(error);
    }
  },

  async addClientTodoItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = addClientTodoItemSchema.parse(req.body);
      const item = await plannerService.addClientTodoItem(
        req.user!.userId,
        String(req.params.clientId),
        String(req.params.listId),
        input
      );
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof Error && error.message === 'Todo list not found') {
        res.status(404).json({ error: 'Todo list not found' });
        return;
      }
      if (error instanceof Error && error.message === 'Client not found or not linked') {
        res.status(404).json({ error: 'Client not found or not linked' });
        return;
      }
      next(error);
    }
  },

  async toggleClientTodoItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await plannerService.toggleClientTodoItem(
        req.user!.userId,
        String(req.params.clientId),
        String(req.params.itemId)
      );
      if (!item) {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  async updateClientTodoItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = updateClientTodoItemSchema.parse(req.body);
      const item = await plannerService.updateClientTodoItem(
        req.user!.userId,
        String(req.params.clientId),
        String(req.params.itemId),
        input
      );
      if (!item) {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  },

  async deleteClientTodoItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await plannerService.deleteClientTodoItem(
        req.user!.userId,
        String(req.params.clientId),
        String(req.params.itemId)
      );
      if (!deleted) {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // ========== CLIENT VISION BOARD (shared) ==========

  async getClientVisionBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await plannerService.getClientVisionBoard(req.user!.userId, String(req.params.clientId));
      res.json(items);
    } catch (error) { next(error); }
  },

  async addClientVisionBoardItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        type: z.enum(['note', 'image', 'concept']),
        title: z.string().optional(),
        content: z.string().optional(),
        category: z.string().optional(),
        color: z.enum(['cream', 'blush', 'sage', 'lavender', 'gold', 'sky', 'charcoal']).optional(),
        position_x: z.number().optional(),
        position_y: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      });
      const input = schema.parse(req.body);
      const item = await plannerService.addClientVisionBoardItem(req.user!.userId, String(req.params.clientId), input);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found or not linked') {
        res.status(404).json({ error: 'Client not found or not linked' });
        return;
      }
      next(error);
    }
  },

  async updateClientVisionBoardItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        title: z.string().nullable().optional(),
        content: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
        color: z.enum(['cream', 'blush', 'sage', 'lavender', 'gold', 'sky', 'charcoal']).optional(),
        position_x: z.number().optional(),
        position_y: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        pinned: z.boolean().optional(),
      });
      const input = schema.parse(req.body);
      const item = await plannerService.updateClientVisionBoardItem(
        req.user!.userId, String(req.params.clientId), String(req.params.itemId), input
      );
      if (!item) {
        res.status(404).json({ error: 'Vision board item not found' });
        return;
      }
      res.json(item);
    } catch (error) { next(error); }
  },

  async deleteClientVisionBoardItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await plannerService.deleteClientVisionBoardItem(
        req.user!.userId, String(req.params.clientId), String(req.params.itemId)
      );
      if (!deleted) {
        res.status(404).json({ error: 'Vision board item not found' });
        return;
      }
      res.status(204).send();
    } catch (error) { next(error); }
  },

  async createInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = inviteSchema.parse({ clientId: req.params.id });
      const invite = await plannerService.createInvite(req.user!.userId, input.clientId);
      res.json(invite);
    } catch (error) {
      next(error);
    }
  },

  // ========== DASHBOARD ==========

  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await plannerService.getDashboardStats(req.user!.userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },
};
