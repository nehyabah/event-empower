import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { workspaceEventService } from '../services/workspaceEventService.js';

const eventTypes = ['meeting', 'visit', 'fitting', 'tasting', 'rehearsal', 'delivery', 'other'] as const;
// Range-checked, so an out-of-range time is a 400 rather than a database 500.
const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Time must be a valid HH:MM');

const createSchema = z.object({
  eventId: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).nullable().optional(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: timeString.nullable().optional(),
  endTime: timeString.nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  eventType: z.enum(eventTypes).optional(),
  participantIds: z.array(z.string().uuid()).max(50).optional(),
});

const updateSchema = createSchema.partial().omit({ eventId: true });

const handle = (error: unknown, res: Response, next: NextFunction) => {
  const status = (error as { statusCode?: number })?.statusCode;
  if (status === 403) {
    res.status(403).json({ error: (error as Error).message });
    return;
  }
  next(error);
};

export const workspaceEventController = {
  /** Weddings the caller can add events to, with their taggable people. */
  async getContexts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await workspaceEventService.getContexts(req.user!.userId));
    } catch (error) { next(error); }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await workspaceEventService.list(req.user!.userId));
    } catch (error) { next(error); }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }
      const { eventId, ...rest } = parsed.data;
      res.status(201).json(await workspaceEventService.create(req.user!.userId, eventId, rest));
    } catch (error) { handle(error, res, next); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }
      const updated = await workspaceEventService.update(req.user!.userId, req.params.id, parsed.data);
      if (!updated) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
      res.json(updated);
    } catch (error) { handle(error, res, next); }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ok = await workspaceEventService.remove(req.user!.userId, req.params.id);
      if (!ok) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
      res.status(204).end();
    } catch (error) { handle(error, res, next); }
  },
};
