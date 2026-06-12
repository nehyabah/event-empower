import { Router } from 'express';
import { authenticate, requireUserType } from '../middleware/auth.js';
import { visionBoardController } from '../controllers/visionBoardController.js';

const router = Router();
router.use(authenticate, requireUserType('client'));

router.get('/', visionBoardController.list);
router.post('/', visionBoardController.create);
router.patch('/:id', visionBoardController.update);
router.delete('/:id', visionBoardController.remove);

export default router;
