import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Email/password authentication
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', optionalAuth, authController.logout);

// Password reset. otpLimiter (5/hour/IP) throttles code requests so the
// endpoint cannot be used to spam an inbox or grind through addresses;
// authLimiter guards the verify step against brute-forcing a 6-digit code.
router.post('/password/request-reset', otpLimiter, authController.requestPasswordReset);
router.post('/password/reset', authLimiter, authController.resetPassword);

// Passwordless sign-in by emailed code. Offered alongside password and Google,
// not instead: an account whose only door is an inbox is unreachable during an
// email outage.
router.post('/email/request-code', otpLimiter, authController.requestEmailLoginCode);
router.post('/email/verify-code', authLimiter, authController.verifyEmailLoginCode);
router.post('/refresh', authController.refresh);
router.post('/refresh-token', authController.refreshFromBody);

// Google OAuth
router.post('/google', authLimiter, authController.googleAuth);

// Phone OTP
router.post('/phone/send-otp', otpLimiter, authController.sendPhoneOtp);
router.post('/phone/verify-otp', authLimiter, authController.verifyPhoneOtp);

export default router;
