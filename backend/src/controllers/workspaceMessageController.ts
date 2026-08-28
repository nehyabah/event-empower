import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { workspaceMessageService } from '../services/workspaceMessageService.js';
import { WorkspaceEventModel } from '../models/WorkspaceEvent.js';

const sendSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(4000),
});

const handle = (error: unknown, res: Response, next: NextFunction) => {
  const status = (error as { statusCode?: number })?.statusCode;
  if (status === 403) {
    res.status(403).json({ error: (error as Error).message });
    return;
  }
  next(error);
};

export const workspaceMessageController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [messages, participants] = await Promise.all([
        workspaceMessageService.list(req.user!.userId, req.params.eventId),
        WorkspaceEventModel.listTaggableUsers(req.params.eventId),
      ]);
      res.json({ messages, participants });
    } catch (error) { handle(error, res, next); }
  },

  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = sendSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }
      const message = await workspaceMessageService.send(req.user!.userId, req.params.eventId, parsed.data.message);
      res.status(201).json(message);
    } catch (error) { handle(error, res, next); }
  },
};
