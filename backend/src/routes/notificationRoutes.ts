import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { notificationController } from '../controllers/notificationController.js';

const router = Router();
router.use(authenticate);

// Every role has a notification feed; what lands in it differs.
router.get('/', notificationController.list);
router.post('/read-all', notificationController.markAllRead);
router.post('/:id/read', notificationController.markRead);

export default router;
