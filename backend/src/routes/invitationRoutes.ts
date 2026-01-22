import { Router } from 'express';
import { authenticate, requireUserType } from '../middleware/auth.js';
import { invitationController } from '../controllers/invitationController.js';

const router = Router();

router.use(authenticate);
router.use(requireUserType('client'));

router.post('/accept', invitationController.acceptInvite);

export default router;
