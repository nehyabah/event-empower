import { Router } from 'express';
import multer from 'multer';
import { authenticate, requireUserType } from '../middleware/auth.js';
import { visionBoardController } from '../controllers/visionBoardController.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const router = Router();
router.use(authenticate, requireUserType('client'));

router.get('/', visionBoardController.list);
router.post('/', visionBoardController.create);
router.post('/upload', upload.single('file'), visionBoardController.uploadImage);
router.patch('/:id', visionBoardController.update);
router.delete('/:id', visionBoardController.remove);

export default router;
