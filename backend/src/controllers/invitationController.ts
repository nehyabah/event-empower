import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { plannerService } from '../services/plannerService.js';

const acceptInviteSchema = z.object({
  code: z.string().min(4, 'Invite code is required'),
});

export const invitationController = {
  async previewInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = req.params.code.trim().toUpperCase();
      const preview = await plannerService.previewInvite(code);
      res.json(preview);
    } catch (error) {
      next(error);
    }
  },

  async acceptInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = acceptInviteSchema.parse(req.body);
      const client = await plannerService.acceptInvite(req.user!.userId, input.code.trim().toUpperCase());
      res.json(client);
    } catch (error) {
      next(error);
    }
  },
};
