import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { VisionBoardItemModel } from '../models/VisionBoardItem.js';

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

export const visionBoardController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await VisionBoardItemModel.findByUserId(req.user!.userId);
      res.json(items);
    } catch (e) { next(e); }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createSchema.parse(req.body);
      const item = await VisionBoardItemModel.create({ ...data, user_id: req.user!.userId, added_by: req.user!.userId });
      res.status(201).json(item);
    } catch (e) { next(e); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateSchema.parse(req.body);
      const item = await VisionBoardItemModel.update(req.params.id, req.user!.userId, data);
      if (!item) { res.status(404).json({ error: 'Not found' }); return; }
      res.json(item);
    } catch (e) { next(e); }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await VisionBoardItemModel.delete(req.params.id, req.user!.userId);
      res.status(204).end();
    } catch (e) { next(e); }
  },
};
