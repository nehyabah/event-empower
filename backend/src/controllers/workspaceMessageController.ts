import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { workspaceMessageService } from '../services/workspaceMessageService.js';
import { WorkspaceEventModel } from '../models/WorkspaceEvent.js';
import { checkMessage, recordFlag, violationMessage } from '../services/contentSafety.js';
import { notificationService } from '../services/notificationService.js';

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
      // Vendors sit in this thread too, so the same contact-sharing rule
      // applies here as in a pre-booking inquiry.
      const safety = checkMessage(parsed.data.message);
      if (!safety.ok) {
        void recordFlag({
          userId: req.user!.userId,
          surface: 'workspace_chat',
          contextId: req.params.eventId,
          violations: safety.violations,
          text: parsed.data.message,
        });
        res.status(422).json({ error: violationMessage(safety.violations), safetyBlocked: true });
        return;
      }

      const message = await workspaceMessageService.send(req.user!.userId, req.params.eventId, parsed.data.message);
      res.status(201).json(message);

      // After responding: the sender should not wait on fan-out, and a
      // notification failure must not fail a message that is already saved.
      void notificationService.workspaceMessagePosted({
        eventId: req.params.eventId,
        senderId: req.user!.userId,
        senderName: message.sender_name,
        preview: parsed.data.message.slice(0, 140),
      });
    } catch (error) { handle(error, res, next); }
  },
};
