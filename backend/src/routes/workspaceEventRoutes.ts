import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { workspaceEventController } from '../controllers/workspaceEventController.js';

const router = Router();

router.use(authenticate);

// Available to every role: couples, planners and vendors all schedule against
// a wedding they are connected to.
router.get('/contexts', workspaceEventController.getContexts);
router.get('/', workspaceEventController.list);
router.post('/', workspaceEventController.create);
router.patch('/:id', workspaceEventController.update);
router.delete('/:id', workspaceEventController.remove);

export default router;
