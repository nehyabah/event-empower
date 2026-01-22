import { query, queryOne } from '../config/database.js';

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  is_revoked: boolean;
  created_at: Date;
}

export const RefreshTokenModel = {
  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken> {
    const result = await queryOne<RefreshToken>(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, tokenHash, expiresAt]
    );

    if (!result) {
      throw new Error('Failed to create refresh token');
    }

    return result;
  },

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return queryOne<RefreshToken>(
      `SELECT * FROM refresh_tokens
       WHERE token_hash = $1
       AND is_revoked = FALSE
       AND expires_at > NOW()`,
      [tokenHash]
    );
  },

  async revoke(id: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1',
      [id]
    );
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1',
      [userId]
    );
  },

  async deleteExpired(): Promise<void> {
    await query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR is_revoked = TRUE'
    );
  },
};
