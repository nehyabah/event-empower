import bcrypt from 'bcrypt';
import { UserModel, User, UserType } from '../models/User.js';
import { tokenService, TokenPair } from './tokenService.js';

const SALT_ROUNDS = 12;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  userType?: UserType;
}

export interface LoginInput {
  email: string;
  password: string;
  userType?: UserType;
}

export interface AuthResult {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    userType: UserType;
    avatarUrl: string | null;
  };
  tokens: TokenPair;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Create the user
    const user = await UserModel.create({
      email: input.email,
      password_hash: passwordHash,
      name: input.name,
      user_type: input.userType || 'client',
      auth_provider: 'email',
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
      },
      tokens,
    };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    // Find the user
    const user = await UserModel.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user has a password (might be OAuth only)
    if (!user.password_hash) {
      throw new Error('This account uses social login. Please sign in with Google or phone.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(input.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update user type if provided and different
    let updatedUser = user;
    if (input.userType && input.userType !== user.user_type) {
      const result = await UserModel.update(user.id, { user_type: input.userType });
      if (result) {
        updatedUser = result;
      }
    }

    // Generate tokens
    const tokens = await tokenService.generateTokenPair(updatedUser);

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        userType: updatedUser.user_type,
        avatarUrl: updatedUser.avatar_url,
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

    // Rotate the refresh token
    const tokens = await tokenService.rotateRefreshToken(tokenData.tokenId, user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        avatarUrl: user.avatar_url,
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
