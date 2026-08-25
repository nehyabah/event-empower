import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import sharedStoryRoutes from './routes/sharedStoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import visionBoardRoutes from './routes/visionBoardRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import workspaceEventRoutes from './routes/workspaceEventRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import { scheduler } from './services/scheduler.js';
import { vendorController } from './controllers/vendorController.js';
import { userController } from './controllers/userController.js';
import { optionalAuth } from './middleware/auth.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      // Radix/shadcn set inline styles at runtime; fonts come from Google Fonts.
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      // Uploads are proxied through /api/media ('self'); the rest are stock photos.
      imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com',
               'https://picsum.photos', 'https://res.cloudinary.com'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
}));
app.use(cors({
  origin: env.ALLOWED_ORIGINS.split(','),
  credentials: true,
}));

// Parse JSON and cookies
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// Rate limiting
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/shared-story', sharedStoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/vision-board', visionBoardRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/workspace-events', workspaceEventRoutes);
app.use('/api/notifications', notificationRoutes);
// Re-signing proxy for stored images; see storageService for why URLs point here.
app.use('/api/media', mediaRoutes);

// Public inquiries (client -> vendor) — optionalAuth sets sender_id when logged in
app.post('/api/inquiries', optionalAuth, vendorController.createInquiry);

// Public RSVP endpoints (no auth required)
app.get('/api/rsvp/:code', userController.getEventInfo);
app.post('/api/rsvp', userController.submitPublicRsvp);

// Single-domain deploy: the built SPA is bundled next to the compiled API.
// Absent in local dev (frontend runs on Vite :8080), so this is skipped there.
const webDist = path.resolve(__dirname, '../web');
if (fs.existsSync(path.join(webDist, 'index.html'))) {
  app.use(express.static(webDist, {
    index: false,
    setHeaders: (res, filePath) => {
      // Asset filenames are content-hashed, so they can be cached indefinitely.
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));

  // Client-side routes (/s/:slug, /rsvp/:code, ...) must survive a hard refresh.
  // Anything not under /api or /health returns the shell; a real RegExp is used
  // because path-to-regexp has no negative lookahead.
  app.get(/^\/(?!api\/|health$).*/, (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const port = parseInt(env.PORT, 10);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${env.NODE_ENV}`);

  // Guest RSVP reminders run on an hourly tick inside the API process.
  scheduler.start();
});

export default app;
