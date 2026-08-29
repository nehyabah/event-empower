import bcrypt from 'bcrypt';
import { UserModel, User, UserType } from '../models/User.js';
import { tokenService, TokenPair } from './tokenService.js';
import { query } from '../config/database.js';
import { emailVerificationService } from './emailVerificationService.js';

const SALT_ROUNDS = 12;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  userType?: UserType;
  businessName?: string;
  instagramHandle?: string;
  whatsappPhone?: string;
  city?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    userType: UserType;
    avatarUrl: string | null;
    approvalStatus: string;
    emailVerified: boolean;
    /** Null until the professional first saves their profile for review. */
    onboardingSubmittedAt: string | null;
  };
  tokens: TokenPair;
}

const createAuthError = (message: string, statusCode = 401): Error & { statusCode?: number } => {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
};

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const needsApproval = input.userType === 'vendor' || input.userType === 'planner';

    // Create the user
    const user = await UserModel.create({
      email: input.email,
      password_hash: passwordHash,
      name: input.name,
      user_type: input.userType || 'client',
      auth_provider: 'email',
      approval_status: needsApproval ? 'pending' : 'approved',
      business_name: input.businessName,
      instagram_handle: input.instagramHandle,
      whatsapp_phone: input.whatsappPhone,
      city: input.city,
    });

    // Best-effort: a mail outage must not fail a signup that has already
    // created the account. They can ask for another code from the banner.
    void emailVerificationService.sendCode(user.id).catch((err) => {
      console.error('[auth] verification code send failed:', err);
    });

    // Generate tokens
    const tokens = await tokenService.generateTokenPair(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        avatarUrl: user.avatar_url,
        approvalStatus: user.approval_status,
        emailVerified: !!user.email_verified_at,
        onboardingSubmittedAt: user.onboarding_submitted_at
          ? new Date(user.onboarding_submitted_at).toISOString()
          : null,
      },
      tokens,
    };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    // Find the user
    const user = await UserModel.findByEmail(input.email);
    if (!user) {
      throw createAuthError('Email or password is incorrect.');
    }

    if (user.deleted_at || !user.is_active) {
      throw createAuthError('Account is inactive. Please contact support.', 403);
    }

    // Check if user has a password (might be OAuth only)
    if (!user.password_hash) {
      throw createAuthError('This account uses social login. Please sign in with Google or phone.', 400);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(input.password, user.password_hash);
    if (!isValidPassword) {
      throw createAuthError('Email or password is incorrect.');
    }

    // Update last_login_at (non-blocking — column may not exist yet)
    query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]).catch(() => {});

    // Generate tokens
    const tokens = await tokenService.generateTokenPair(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        avatarUrl: user.avatar_url,
        approvalStatus: user.approval_status,
        emailVerified: !!user.email_verified_at,
        onboardingSubmittedAt: user.onboarding_submitted_at
          ? new Date(user.onboarding_submitted_at).toISOString()
          : null,
      },
      tokens,
    };
  },

  async logout(userId: string): Promise<void> {
    await tokenService.revokeAllUserTokens(userId);
  },

  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    // Verify the refresh token
    const tokenData = await tokenService.verifyRefreshToken(refreshToken);
    if (!tokenData) {
      throw new Error('Invalid or expired refresh token');
    }

    // Get the user
    const user = await UserModel.findById(tokenData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.deleted_at || !user.is_active) {
      throw createAuthError('Account is inactive. Please contact support.', 403);
    }

    // Rotate the refresh token
    const tokens = await tokenService.rotateRefreshToken(tokenData.tokenId, user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        avatarUrl: user.avatar_url,
        approvalStatus: user.approval_status,
        emailVerified: !!user.email_verified_at,
        onboardingSubmittedAt: user.onboarding_submitted_at
          ? new Date(user.onboarding_submitted_at).toISOString()
          : null,
      },
      tokens,
    };
  },

  async getUserById(id: string): Promise<User | null> {
    return UserModel.findById(id);
  },

  async updateUser(id: string, updates: { name?: string; userType?: UserType }): Promise<User | null> {
    return UserModel.update(id, {
      name: updates.name,
      user_type: updates.userType,
    });
  },
};
