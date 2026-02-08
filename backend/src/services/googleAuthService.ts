import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { UserModel, UserType } from '../models/User.js';
import { tokenService, TokenPair } from './tokenService.js';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export interface GoogleAuthResult {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    userType: UserType;
    avatarUrl: string | null;
  };
  tokens: TokenPair;
  isNewUser: boolean;
}

export const googleAuthService = {
  async verifyIdToken(idToken: string, userType?: UserType): Promise<GoogleAuthResult> {
    // Verify the ID token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token');
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!googleId || !email) {
      throw new Error('Google account missing required information');
    }

    // Check if user exists by Google ID
    let user = await UserModel.findByGoogleId(googleId);
    let isNewUser = false;

    if (!user) {
      // Check if user exists by email
      user = await UserModel.findByEmail(email);

      if (user) {
        // User exists with email, but hasn't linked Google yet
        // For security, we don't auto-link accounts
        throw new Error('An account with this email already exists. Please login with your password.');
      }

      // Create new user
      user = await UserModel.create({
        email,
        name: name || email.split('@')[0],
        avatar_url: picture,
        auth_provider: 'google',
        google_id: googleId,
        user_type: userType || 'client',
      });
      isNewUser = true;
    } else if (user.deleted_at || !user.is_active) {
      throw new Error('Account is inactive. Please contact support.');
    } else if (userType && userType !== user.user_type) {
      // Update user type if provided and different
      const updatedUser = await UserModel.update(user.id, { user_type: userType });
      if (updatedUser) {
        user = updatedUser;
      }
    }

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
      isNewUser,
    };
  },
};
