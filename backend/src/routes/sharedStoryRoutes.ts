import { Router } from 'express';
import { storyController } from '../controllers/storyController.js';

const router = Router();

// Slug-based lookup (must come before :userId to avoid collision)
router.get('/by-slug/:slug', storyController.getStoryBySlug);

router.get('/:userId', storyController.getSharedStory);
router.post('/:userId/comments', storyController.addSharedComment);
router.post('/:userId/wishlist/:itemId/purchase', storyController.markWishlistPurchased);

export default router;
