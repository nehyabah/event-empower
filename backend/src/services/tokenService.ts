import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { jwtConfig } from '../config/jwt.js';
import { RefreshTokenModel } from '../models/RefreshToken.js';
import type { User } from '../models/User.js';

export interface TokenPayload {
  userId: string;
  email: string | null;
  userType: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const tokenService = {
  generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      userType: user.user_type,
    };

    return jwt.sign(payload, jwtConfig.accessToken.secret, {
      expiresIn: jwtConfig.accessToken.expiresIn,
    });
  },

  async generateRefreshToken(user: User): Promise<string> {
    // Generate a random token
    const token = crypto.randomBytes(64).toString('hex');

    // Hash the token for storage
    const tokenHash = await bcrypt.hash(token, 10);

    // Calculate expiration date (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store the hashed token
    await RefreshTokenModel.create(user.id, tokenHash, expiresAt);

    return token;
  },

  async generateTokenPair(user: User): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  },

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, jwtConfig.accessToken.secret) as TokenPayload;
  },

  async verifyRefreshToken(token: string): Promise<{ userId: string; tokenId: string } | null> {
    // Get all non-revoked, non-expired tokens
    // We need to check each one since we store hashes
    const { query } = await import('../config/database.js');

    const tokens = await query<{ id: string; user_id: string; token_hash: string }>(
      `SELECT id, user_id, token_hash FROM refresh_tokens
       WHERE is_revoked = FALSE AND expires_at > NOW()`
    );

    for (const storedToken of tokens) {
      const isMatch = await bcrypt.compare(token, storedToken.token_hash);
      if (isMatch) {
        return { userId: storedToken.user_id, tokenId: storedToken.id };
      }
    }

    return null;
  },

  async rotateRefreshToken(oldTokenId: string, user: User): Promise<TokenPair> {
    // Revoke the old token
    await RefreshTokenModel.revoke(oldTokenId);

    // Generate new token pair
    return this.generateTokenPair(user);
  },

  async revokeAllUserTokens(userId: string): Promise<void> {
    await RefreshTokenModel.revokeAllForUser(userId);
  },
};
