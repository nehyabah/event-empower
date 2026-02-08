import { Router } from 'express';
import { publicController } from '../controllers/publicController.js';

const router = Router();

router.post('/contact', publicController.createContactTicket);
router.post('/newsletter/subscribe', publicController.subscribeNewsletter);

export default router;
