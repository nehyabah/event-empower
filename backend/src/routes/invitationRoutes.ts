import { Router } from 'express';
import { authenticate, requireUserType } from '../middleware/auth.js';
import { invitationController } from '../controllers/invitationController.js';

const router = Router();

// Public: anyone with the code can preview (needed before login)
router.get('/preview/:code', invitationController.previewInvite);

// Authenticated client: accept the invite
router.post('/accept', authenticate, requireUserType('client'), invitationController.acceptInvite);

export default router;
