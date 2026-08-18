import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { calendarController } from '../controllers/calendarController.js';

const router = Router();

// Public: the ICS feed authenticates by the secret token in its own URL, since
// Google/Apple/Outlook cannot send an Authorization header when polling.
// Matches both /feed/<token> and /feed/<token>.ics.
router.get(/^\/feed\/([^/]+?)(?:\.ics)?$/, calendarController.getFeed);

// Authenticated calendar surface.
router.get('/', authenticate, calendarController.getMyCalendar);
router.post('/feed/rotate', authenticate, calendarController.rotateFeedToken);
router.get(/^\/export(?:\.ics)?$/, authenticate, calendarController.exportAll);
// Entry ids contain hyphens and a UUID, so match them with an explicit regex
// rather than relying on how a ":param.ics" pattern is parsed.
router.get(/^\/entry\/([^/]+?)(?:\.ics)?$/, authenticate, calendarController.exportEntry);

export default router;
