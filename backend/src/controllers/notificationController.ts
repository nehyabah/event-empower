import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await notificationService.list(req.user!.userId));
    } catch (error) { next(error); }
  },

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await notificationService.markRead(req.user!.userId, req.params.id);
      // Already read, or not theirs — either way there is nothing to change.
      if (!updated) { res.status(204).end(); return; }
      res.json(updated);
    } catch (error) { next(error); }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ marked: await notificationService.markAllRead(req.user!.userId) });
    } catch (error) { next(error); }
  },
};
