import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { thankYouService } from '../services/thankYouService.js';
import { storageService } from '../services/storageService.js';

interface UploadRequest extends Request {
  file?: Express.Multer.File;
}

const audience = z.enum(['attended', 'all']);

const saveSchema = z.object({
  subject: z.string().trim().min(1, 'Give the email a subject').max(200),
  body: z.string().trim().min(1, 'Write a message').max(5000),
  photoUrl: z.string().trim().url('That photo link is not a valid URL').nullish(),
  audience: audience.optional(),
});

const handle = (error: unknown, res: Response, next: NextFunction) => {
  const status = (error as { statusCode?: number })?.statusCode;
  if (status === 400 || status === 403) {
    res.status(status).json({ error: (error as Error).message });
    return;
  }
  next(error);
};

export const thankYouController = {
  async getDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const draft = await thankYouService.getDraft(req.user!.userId);
      const [breakdown, eventDate] = await Promise.all([
        thankYouService.breakdown(req.user!.userId, draft?.audience ?? 'attended'),
        thankYouService.eventDate(req.user!.userId),
      ]);
      res.json({ draft, breakdown, eventDate });
    } catch (error) { handle(error, res, next); }
  },

  async saveDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = saveSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
      }
      const draft = await thankYouService.saveDraft(req.user!.userId, {
        subject: parsed.data.subject,
        body: parsed.data.body,
        photo_url: parsed.data.photoUrl ?? null,
        audience: parsed.data.audience,
      });
      res.json({ draft });
    } catch (error) { handle(error, res, next); }
  },

  /** Counts for a chosen audience, before anything is saved or sent. */
  async preview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = audience.safeParse(req.query.audience ?? 'attended');
      if (!parsed.success) {
        res.status(400).json({ error: 'Unknown audience' });
        return;
      }
      res.json(await thankYouService.breakdown(req.user!.userId, parsed.data));
    } catch (error) { handle(error, res, next); }
  },

  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await thankYouService.send(req.user!.userId));
    } catch (error) { handle(error, res, next); }
  },

  /** The one photo the note may carry, stored under the couple's own prefix. */
  async uploadPhoto(req: UploadRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      res.json(await storageService.uploadImage(`users/${req.user!.userId}/thank-you`, req.file));
    } catch (error) { handle(error, res, next); }
  },

  async history(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({ notes: await thankYouService.history(req.user!.userId) });
    } catch (error) { handle(error, res, next); }
  },
};
