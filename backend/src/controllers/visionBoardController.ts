import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { VisionBoardItemModel } from '../models/VisionBoardItem.js';
import { storageService } from '../services/storageService.js';

type UploadRequest = Request & { file?: { buffer: Buffer; mimetype: string; originalname: string } };

const createSchema = z.object({
  type: z.enum(['note', 'image', 'concept']),
  title: z.string().max(255).optional(),
  content: z.string().optional(),
  category: z.string().max(50).optional(),
  color: z.enum(['cream', 'blush', 'sage', 'lavender', 'gold', 'sky', 'charcoal']).optional(),
  position_x: z.number().optional(),
  position_y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const updateSchema = z.object({
  title: z.string().max(255).nullable().optional(),
  content: z.string().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  color: z.enum(['cream', 'blush', 'sage', 'lavender', 'gold', 'sky', 'charcoal']).optional(),
  position_x: z.number().optional(),
  position_y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  pinned: z.boolean().optional(),
});

/**
 * Image items keep their URL in `content`. Older rows hold a presigned S3 URL
 * that has since expired, which is why those images stopped rendering — rewrite
 * them to the non-expiring form on the way out.
 */
const withStableImageUrl = <T extends { type: string; content: string | null }>(item: T): T =>
  item.type === 'image' ? { ...item, content: storageService.toStableUrl(item.content) } : item;

export const visionBoardController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await VisionBoardItemModel.findByUserId(req.user!.userId);
      res.json(items.map(withStableImageUrl));
    } catch (e) { next(e); }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createSchema.parse(req.body);
      const item = await VisionBoardItemModel.create({ ...data, user_id: req.user!.userId, added_by: req.user!.userId });
      res.status(201).json(withStableImageUrl(item));
    } catch (e) { next(e); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateSchema.parse(req.body);
      const item = await VisionBoardItemModel.update(req.params.id, req.user!.userId, data);
      if (!item) { res.status(404).json({ error: 'Not found' }); return; }
      res.json(withStableImageUrl(item));
    } catch (e) { next(e); }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await VisionBoardItemModel.delete(req.params.id, req.user!.userId);
      res.status(204).end();
    } catch (e) { next(e); }
  },

  async uploadImage(req: UploadRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      // Try S3; fall back to base64 data URL when storage is not configured
      try {
        const result = await storageService.uploadImage(
          `vision-board/${req.user!.userId}`,
          req.file
        );
        res.json({ url: result.url });
      } catch {
        const b64 = req.file.buffer.toString('base64');
        res.json({ url: `data:${req.file.mimetype};base64,${b64}` });
      }
    } catch (e) { next(e); }
  },
};
