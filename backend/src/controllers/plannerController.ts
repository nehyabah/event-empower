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
