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

// Railway terminates TLS at its edge and forwards over plain HTTP, setting
// X-Forwarded-*. Without this Express reports every request as insecure, so
// `secure: true` cookies are silently dropped (breaking login) and
// express-rate-limit throws because it cannot identify the caller. One hop.
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Uploads are handed out as presigned URLs on the storage host, so that origin
// has to be allowed explicitly — it is never present in the frontend source.
const storageOrigins = [env.STORAGE_PUBLIC_URL, env.STORAGE_ENDPOINT]
  .filter((v): v is string => Boolean(v))
  .map((v) => {
    try { return new URL(v).origin; } catch { return null; }
  })
  .filter((v): v is string => Boolean(v));
const uniqueStorageOrigins = [...new Set(storageOrigins)];

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Google Identity Services ships the sign-in button from Google's origin.
      scriptSrc: ["'self'", 'https://accounts.google.com', 'https://apis.google.com'],
      // The button and One Tap render inside a Google-hosted iframe.
      frameSrc: ["'self'", 'https://accounts.google.com'],
      // Radix/shadcn set inline styles at runtime; fonts come from Google Fonts.
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      // Uploads are proxied through /api/media ('self'); the rest are stock photos.
      imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com',
               'https://picsum.photos', 'https://res.cloudinary.com',
               // Google account avatars.
               'https://lh3.googleusercontent.com', 'https://accounts.google.com',
               ...uniqueStorageOrigins],
      // Videos fall back to default-src without this, which would block them.
      mediaSrc: ["'self'", 'data:', 'blob:', ...uniqueStorageOrigins],
      connectSrc: ["'self'", 'https://accounts.google.com'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  // helmet defaults to same-origin, which severs window.opener between this
  // page and Google's sign-in popup — the popup completes and then has no way
  // to hand the credential back, so the flow simply stops. Popups it opens are
  // still isolated from the rest of the origin.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  // no-referrer strips the Origin that Google matches against the client's
  // authorised JavaScript origins. This still sends nothing on downgrade and
  // only the origin cross-site, never the path.
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
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
