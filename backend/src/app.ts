import express from 'express';
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
import { vendorController } from './controllers/vendorController.js';

const app = express();

// Security middleware
app.use(helmet());
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

// Public inquiries (client -> vendor)
app.post('/api/inquiries', vendorController.createInquiry);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const port = parseInt(env.PORT, 10);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

export default app;
