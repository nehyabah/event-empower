import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Email/password authentication
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', optionalAuth, authController.logout);
router.post('/refresh', authController.refresh);
router.post('/refresh-token', authController.refreshFromBody);

// Google OAuth
router.post('/google', authLimiter, authController.googleAuth);

// Phone OTP
router.post('/phone/send-otp', otpLimiter, authController.sendPhoneOtp);
router.post('/phone/verify-otp', authLimiter, authController.verifyPhoneOtp);

export default router;
