import { query, queryOne } from '../config/database.js';

export type OtpChannel = 'sms' | 'whatsapp';

export interface OtpCode {
  id: string;
  phone: string;
  code_hash: string;
  channel: OtpChannel;
  expires_at: Date;
  attempts: number;
  is_used: boolean;
  created_at: Date;
}

const MAX_ATTEMPTS = 5;

export const OtpCodeModel = {
  async create(phone: string, codeHash: string, channel: OtpChannel, expiresAt: Date): Promise<OtpCode> {
    // Invalidate any existing unused codes for this phone number
    await query(
      'UPDATE otp_codes SET is_used = TRUE WHERE phone = $1 AND is_used = FALSE',
      [phone]
    );

    const result = await queryOne<OtpCode>(
      `INSERT INTO otp_codes (phone, code_hash, channel, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [phone, codeHash, channel, expiresAt]
    );

    if (!result) {
      throw new Error('Failed to create OTP code');
    }

    return result;
  },

  async findValidCode(phone: string): Promise<OtpCode | null> {
    return queryOne<OtpCode>(
      `SELECT * FROM otp_codes
       WHERE phone = $1
       AND is_used = FALSE
       AND expires_at > NOW()
       AND attempts < $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone, MAX_ATTEMPTS]
    );
  },

  async incrementAttempts(id: string): Promise<void> {
    await query(
      'UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1',
      [id]
    );
  },

  async markAsUsed(id: string): Promise<void> {
    await query(
      'UPDATE otp_codes SET is_used = TRUE WHERE id = $1',
      [id]
    );
  },

  async deleteExpired(): Promise<void> {
    await query(
      'DELETE FROM otp_codes WHERE expires_at < NOW() OR is_used = TRUE'
    );
  },
};
