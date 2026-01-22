import { Request, Response } from 'express';
import { storyService } from '../services/storyService.js';

export const storyController = {
  async getMyStory(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const bundle = await storyService.getStoryBundle(userId);
    res.json(bundle);
  },

  async updateMyStory(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const story = await storyService.upsertStory(userId, req.body || {});
    res.json(story);
  },

  async listMyImages(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const images = await storyService.listImages(userId);
    res.json(images);
  },

  async addMyImage(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const image = await storyService.addImage(userId, req.body);
    res.json(image);
  },

  async deleteMyImage(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const success = await storyService.deleteImage(userId, req.params.id);
    res.json({ success });
  },

  async listMyComments(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const comments = await storyService.listComments(userId);
    res.json(comments);
  },

  async addMyComment(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const comment = await storyService.addComment(userId, req.body);
    res.json(comment);
  },

  async listMyWishlist(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const items = await storyService.listWishlist(userId);
    res.json(items);
  },

  async addMyWishlistItem(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const item = await storyService.addWishlistItem(userId, req.body);
    res.json(item);
  },

  async updateMyWishlistItem(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const item = await storyService.updateWishlistItem(userId, req.params.id, req.body);
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    res.json(item);
  },

  async deleteMyWishlistItem(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const success = await storyService.deleteWishlistItem(userId, req.params.id);
    res.json({ success });
  },

  async listMyBankDetails(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const items = await storyService.listBankDetails(userId);
    res.json(items);
  },

  async addMyBankDetail(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const item = await storyService.addBankDetail(userId, req.body);
    res.json(item);
  },

  async updateMyBankDetail(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const item = await storyService.updateBankDetail(userId, req.params.id, req.body);
    if (!item) {
      res.status(404).json({ error: 'Bank detail not found' });
      return;
    }

    res.json(item);
  },

  async deleteMyBankDetail(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const success = await storyService.deleteBankDetail(userId, req.params.id);
    res.json({ success });
  },

  async getSharedStory(req: Request, res: Response) {
    const userId = req.params.userId;
    const bundle = await storyService.getStoryBundle(userId);
    res.json(bundle);
  },

  async addSharedComment(req: Request, res: Response) {
    const userId = req.params.userId;
    const comment = await storyService.addComment(userId, req.body);
    res.json(comment);
  },

  async markWishlistPurchased(req: Request, res: Response) {
    const userId = req.params.userId;
    const itemId = req.params.itemId;
    const { purchaserName, isAnonymous } = req.body || {};

    if (!purchaserName) {
      res.status(400).json({ error: 'Purchaser name is required' });
      return;
    }

    const item = await storyService.updateWishlistItem(userId, itemId, {
      purchased_by: purchaserName,
      is_anonymous: Boolean(isAnonymous),
    });

    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    res.json(item);
  },
};
