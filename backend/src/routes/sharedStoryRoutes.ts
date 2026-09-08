import { Router } from 'express';
import { storyController } from '../controllers/storyController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Slug-based lookup (must come before :userId to avoid collision)
router.get('/by-slug/:slug', storyController.getStoryBySlug);

router.get('/:userId', storyController.getSharedStory);
// optionalAuth so a signed-in couple can be recognised on their own page.
// The route stays public: a guest posting a well wish has no account.
router.post('/:userId/comments', optionalAuth, storyController.addSharedComment);
router.post('/:userId/wishlist/:itemId/purchase', storyController.markWishlistPurchased);

export default router;
