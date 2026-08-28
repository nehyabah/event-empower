import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { blockUnapprovedWrites } from '../middleware/requireApproved.js';
import { workspaceMessageController } from '../controllers/workspaceMessageController.js';

const router = Router();

router.use(authenticate);

// Reading the thread is fine for an unreviewed professional (same reasoning
// as workspace events); posting into a live chat with the couple is not.
router.use(blockUnapprovedWrites());

router.get('/:eventId/messages', workspaceMessageController.list);
router.post('/:eventId/messages', workspaceMessageController.send);

export default router;
