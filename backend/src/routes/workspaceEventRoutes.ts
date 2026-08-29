import { Router } from 'express';
import { blockUnapprovedWrites } from '../middleware/requireApproved.js';
import { blockUnverifiedWrites } from '../middleware/requireVerifiedEmail.js';
import { authenticate } from '../middleware/auth.js';
import { workspaceEventController } from '../controllers/workspaceEventController.js';

const router = Router();

router.use(authenticate);

// Workspace events surface to everyone in the workspace, so an unreviewed
// professional should not be able to create them.
router.use(blockUnverifiedWrites());
router.use(blockUnapprovedWrites());

// Available to every role: couples, planners and vendors all schedule against
// a wedding they are connected to.
router.get('/contexts', workspaceEventController.getContexts);
router.get('/', workspaceEventController.list);
router.post('/', workspaceEventController.create);
router.patch('/:id', workspaceEventController.update);
router.delete('/:id', workspaceEventController.remove);

export default router;
