import { Request, Response, RequestHandler } from 'express';
import { wrapController } from '../middleware/asyncHandler.js';
import { storyService } from '../services/storyService.js';
import { queryOne } from '../config/database.js';

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/;

const handlers = {
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

    // Publishing puts a page in front of guests, so it needs a confirmed
    // address behind it. Editing does not — a couple should be able to build
    // their site while the code is still sitting in their inbox.
    if (req.body.site_published === true) {
      const owner = await queryOne<{ email: string | null; email_verified_at: Date | null }>(
        'SELECT email, email_verified_at FROM users WHERE id = $1',
        [userId]
      );
      if (owner?.email && !owner.email_verified_at) {
        res.status(403).json({
          error: 'Please confirm your email address before publishing your wedding site.',
          emailVerificationRequired: true,
        });
        return;
      }
    }

    // Validate slug if provided
    if (req.body.slug !== undefined && req.body.slug !== null) {
      const slug = req.body.slug as string;
      if (!SLUG_RE.test(slug)) {
        res.status(400).json({ error: 'Slug must be 3-60 chars, lowercase alphanumeric and hyphens only' });
        return;
      }
      const available = await storyService.checkSlugAvailability(slug, userId);
      if (!available) {
        res.status(409).json({ error: 'This URL is already taken' });
        return;
      }
    }

    const story = await storyService.upsertStory(userId, req.body || {});
    res.json(story);
  },

  // --- Images ---
  async listMyImages(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const images = await storyService.listImages(userId);
    res.json(images);
  },

  async addMyImage(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const image = await storyService.addImage(userId, req.body);
    res.json(image);
  },

  async deleteMyImage(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const success = await storyService.deleteImage(userId, String(req.params.id));
    res.json({ success });
  },

  // --- Comments ---
  async listMyComments(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const comments = await storyService.listComments(userId);
    res.json(comments);
  },

  async addMyComment(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const comment = await storyService.addComment(userId, req.body);
    res.json(comment);
  },

  // --- Wishlist ---
  async listMyWishlist(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const items = await storyService.listWishlist(userId);
    res.json(items);
  },

  async addMyWishlistItem(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const item = await storyService.addWishlistItem(userId, req.body);
    res.json(item);
  },

  async updateMyWishlistItem(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const item = await storyService.updateWishlistItem(userId, String(req.params.id), req.body);
    if (!item) { res.status(404).json({ error: 'Item not found' }); return; }
    res.json(item);
  },

  async deleteMyWishlistItem(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const success = await storyService.deleteWishlistItem(userId, String(req.params.id));
    res.json({ success });
  },

  // --- Bank Details ---
  async listMyBankDetails(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const items = await storyService.listBankDetails(userId);
    res.json(items);
  },

  async addMyBankDetail(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const item = await storyService.addBankDetail(userId, req.body);
    res.json(item);
  },

  async updateMyBankDetail(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const item = await storyService.updateBankDetail(userId, String(req.params.id), req.body);
    if (!item) { res.status(404).json({ error: 'Bank detail not found' }); return; }
    res.json(item);
  },

  async deleteMyBankDetail(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const success = await storyService.deleteBankDetail(userId, String(req.params.id));
    res.json({ success });
  },

  // --- Slug check ---
  async checkSlug(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }

    const slug = req.query.slug as string;
    if (!slug || !SLUG_RE.test(slug)) {
      res.json({ available: false });
      return;
    }
    const available = await storyService.checkSlugAvailability(slug, userId);
    res.json({ available });
  },

  // --- Timeline ---
  async listTimeline(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const items = await storyService.listTimeline(userId);
    res.json(items);
  },

  async addTimeline(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    if (!req.body.title) { res.status(400).json({ error: 'Title is required' }); return; }
    const item = await storyService.addTimeline(userId, req.body);
    res.json(item);
  },

  async updateTimeline(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const item = await storyService.updateTimeline(userId, String(req.params.id), req.body);
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  },

  async deleteTimeline(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const success = await storyService.deleteTimeline(userId, String(req.params.id));
    res.json({ success });
  },

  async reorderTimeline(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    if (!Array.isArray(req.body.ids)) { res.status(400).json({ error: 'ids array required' }); return; }
    await storyService.reorderTimeline(userId, req.body.ids);
    res.json({ success: true });
  },

  // --- Wedding Party ---
  async listWeddingParty(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const items = await storyService.listWeddingParty(userId);
    res.json(items);
  },

  async addWeddingParty(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    if (!req.body.name || !req.body.role) { res.status(400).json({ error: 'Name and role are required' }); return; }
    const item = await storyService.addWeddingParty(userId, req.body);
    res.json(item);
  },

  async updateWeddingParty(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const item = await storyService.updateWeddingParty(userId, String(req.params.id), req.body);
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  },

  async deleteWeddingParty(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const success = await storyService.deleteWeddingParty(userId, String(req.params.id));
    res.json({ success });
  },

  async reorderWeddingParty(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    if (!Array.isArray(req.body.ids)) { res.status(400).json({ error: 'ids array required' }); return; }
    await storyService.reorderWeddingParty(userId, req.body.ids);
    res.json({ success: true });
  },

  // --- Travel ---
  async listTravel(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const items = await storyService.listTravel(userId);
    res.json(items);
  },

  async addTravel(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    if (!req.body.title) { res.status(400).json({ error: 'Title is required' }); return; }
    const item = await storyService.addTravel(userId, req.body);
    res.json(item);
  },

  async updateTravel(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const item = await storyService.updateTravel(userId, String(req.params.id), req.body);
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  },

  async deleteTravel(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const success = await storyService.deleteTravel(userId, String(req.params.id));
    res.json({ success });
  },

  async reorderTravel(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    if (!Array.isArray(req.body.ids)) { res.status(400).json({ error: 'ids array required' }); return; }
    await storyService.reorderTravel(userId, req.body.ids);
    res.json({ success: true });
  },

  // --- FAQ ---
  async listFaq(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const items = await storyService.listFaq(userId);
    res.json(items);
  },

  async addFaq(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    if (!req.body.question || !req.body.answer) { res.status(400).json({ error: 'Question and answer are required' }); return; }
    const item = await storyService.addFaq(userId, req.body);
    res.json(item);
  },

  async updateFaq(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const item = await storyService.updateFaq(userId, String(req.params.id), req.body);
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  },

  async deleteFaq(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    const success = await storyService.deleteFaq(userId, String(req.params.id));
    res.json({ success });
  },

  async reorderFaq(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    if (!Array.isArray(req.body.ids)) { res.status(400).json({ error: 'ids array required' }); return; }
    await storyService.reorderFaq(userId, req.body.ids);
    res.json({ success: true });
  },

  // --- Shared (public) ---
  async getSharedStory(req: Request, res: Response) {
    const userId = String(req.params.userId);
    const bundle = await storyService.getStoryBundle(userId);
    res.json(bundle);
  },

  async getStoryBySlug(req: Request, res: Response) {
    const slug = String(req.params.slug);
    const bundle = await storyService.getStoryBySlug(slug);
    if (!bundle) {
      res.status(404).json({ error: 'Wedding site not found' });
      return;
    }
    res.json(bundle);
  },

  async addSharedComment(req: Request, res: Response) {
    const userId = String(req.params.userId);
    const comment = await storyService.addComment(userId, req.body);
    res.json(comment);
  },

  async markWishlistPurchased(req: Request, res: Response) {
    const userId = String(req.params.userId);
    const itemId = String(req.params.itemId);
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

/**
 * Every handler here is wrapped rather than each one growing its own try/catch.
 * A wrapper cannot be forgotten when the 41st endpoint is added; forty separate
 * try/catch blocks can, and that is exactly the gap that took the site down.
 */
export const storyController = wrapController(handlers as unknown as Record<string, RequestHandler>) as unknown as typeof handlers;
