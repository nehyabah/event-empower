import { Request, Response, NextFunction } from 'express';
import { emailLoginService } from '../services/emailLoginService.js';
import { passwordResetService } from '../services/passwordResetService.js';
import { z, ZodError } from 'zod';
import { authService } from '../services/authService.js';
import { googleAuthService } from '../services/googleAuthService.js';
import { twilioService } from '../services/twilioService.js';
import { jwtConfig } from '../config/jwt.js';
import type { CookieOptions } from 'express';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  userType: z.enum(['client', 'vendor', 'planner']).optional(),
  businessName: z.string().optional(),
  instagramHandle: z.string().optional(),
  whatsappPhone: z.string().optional(),
  city: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
  userType: z.enum(['client', 'vendor', 'planner']).optional(),
});

const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number'),
  channel: z.enum(['sms', 'whatsapp']).default('sms'),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number'),
  code: z.string().length(6, 'Code must be 6 digits'),
  userType: z.enum(['client', 'vendor', 'planner']).optional(),
});

function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie('refreshToken', refreshToken, jwtConfig.cookie as CookieOptions);
}

function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: jwtConfig.cookie.secure,
    sameSite: jwtConfig.cookie.sameSite,
    path: '/',
  } as CookieOptions);
}


const requestPasswordResetSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});


const emailLoginRequestSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const emailLoginVerifySchema = z.object({
  email: z.string().email('Enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
});

export const authController = {
  /** Send a one-time sign-in code. Silent about whether the account exists. */
  async requestEmailLoginCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = emailLoginRequestSchema.parse(req.body);
      await emailLoginService.requestCode(input.email);
      res.json({ message: 'If that email has an account, a sign-in code is on its way.' });
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
        return;
      }
      console.error('[requestEmailLoginCode]', error);
      res.json({ message: 'If that email has an account, a sign-in code is on its way.' });
    }
  },

  /** Verify the code and start a session, exactly as a password login would. */
  async verifyEmailLoginCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = emailLoginVerifySchema.parse(req.body);
      const result = await emailLoginService.verifyCode(input.email, input.code);

      setRefreshTokenCookie(res, result.tokens.refreshToken);

      res.json({
        user: result.user,
        accessToken: result.tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Start a password reset.
   *
   * Always answers 200 with the same body, whether or not the address belongs
   * to an account — a different response for an unknown email would turn this
   * into a way to test which addresses are registered.
   */
  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = requestPasswordResetSchema.parse(req.body);
      await passwordResetService.requestCode(input.email);
      res.json({ message: 'If that email has an account, a reset code is on its way.' });
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
        return;
      }
      // A failure to send must not reveal anything either; it is logged and
      // the caller sees the same message as everyone else.
      console.error('[requestPasswordReset]', error);
      res.json({ message: 'If that email has an account, a reset code is on its way.' });
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = resetPasswordSchema.parse(req.body);
      await passwordResetService.resetPassword(input.email, input.code, input.password);
      res.json({ message: 'Your password has been changed. Please sign in.' });
    } catch (error) {
      next(error);
    }
  },

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.register({
        email: input.email,
        password: input.password,
        name: input.name,
        userType: input.userType,
        businessName: input.businessName,
        instagramHandle: input.instagramHandle,
        whatsappPhone: input.whatsappPhone,
        city: input.city,
      });

      setRefreshTokenCookie(res, result.tokens.refreshToken);

      res.status(201).json({
        user: result.user,
        accessToken: result.tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input);

      setRefreshTokenCookie(res, result.tokens.refreshToken);

      res.json({
        user: result.user,
        accessToken: result.tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await authService.logout(req.user.userId);
      }

      clearRefreshTokenCookie(res);

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token required' });
        return;
      }

      const result = await authService.refreshTokens(refreshToken);

      setRefreshTokenCookie(res, result.tokens.refreshToken);

      res.json({
        user: result.user,
        accessToken: result.tokens.accessToken,
      });
    } catch (error) {
      clearRefreshTokenCookie(res);
      next(error);
    }
  },

  /** Body-based refresh for mobile clients (no httpOnly cookies) */
  async refreshFromBody(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token required' });
        return;
      }

      const result = await authService.refreshTokens(refreshToken);

      res.json({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = googleAuthSchema.parse(req.body);
      const result = await googleAuthService.verifyIdToken(input.idToken, input.userType);

      setRefreshTokenCookie(res, result.tokens.refreshToken);

      res.json({
        user: result.user,
        accessToken: result.tokens.accessToken,
        isNewUser: result.isNewUser,
      });
    } catch (error) {
      next(error);
    }
  },

  async sendPhoneOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = sendOtpSchema.parse(req.body);
      await twilioService.sendOtp(input.phone, input.channel);

      res.json({ message: 'Verification code sent' });
    } catch (error) {
      next(error);
    }
  },

  async verifyPhoneOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = verifyOtpSchema.parse(req.body);
      const result = await twilioService.verifyOtp(input.phone, input.code, input.userType);

      setRefreshTokenCookie(res, result.tokens.refreshToken);

      res.json({
        user: result.user,
        accessToken: result.tokens.accessToken,
        isNewUser: result.isNewUser,
      });
    } catch (error) {
      next(error);
    }
  },
};
