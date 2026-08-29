import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { blockUnverifiedWrites } from '../middleware/requireVerifiedEmail.js';
import { thankYouController } from '../controllers/thankYouController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

router.use(authenticate);
// This one sends mail to a couple's entire guest list under their name, so an
// unconfirmed address has no business reaching it.
router.use(blockUnverifiedWrites());

router.get('/', thankYouController.getDraft);
router.put('/', thankYouController.saveDraft);
router.get('/preview', thankYouController.preview);
router.get('/history', thankYouController.history);
router.post('/photo', upload.single('file'), thankYouController.uploadPhoto);
router.post('/send', thankYouController.send);

export default router;
