import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { query, queryOne } from '../config/database.js';
import { UserModel } from '../models/User.js';
import { emailService } from './emailService.js';
import { tokenService } from './tokenService.js';
import type { AuthResult } from './authService.js';

/**
 * Signing in with a code emailed to the account holder.
 *
 * Offered alongside password and Google, never instead of them: email has
 * outages, and an account whose only door is an inbox is unreachable when the
 * provider is down.
 *
 * Only signs in accounts that already exist. Registration needs to know
 * whether someone is a couple, planner or vendor, and a six-digit code carries
 * no such answer.
 */

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const SALT_ROUNDS = 10;

interface LoginCodeRow {
  id: string;
  user_id: string;
  code_hash: string;
  attempts: number;
}

function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

function badRequest(message: string): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = 400;
  return err;
}

export const emailLoginService = {
  /** Issue a code. Silent about whether the address is registered. */
  async requestCode(email: string): Promise<void> {
    const user = await UserModel.findByEmail(email.toLowerCase().trim());
    if (!user || !user.email) return;

    // A suspended or deleted account must not be handed a way back in.
    if (user.deleted_at || !user.is_active) return;

    // Requesting a new code retires any outstanding one.
    await query('UPDATE email_login_codes SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [
      user.id,
    ]);

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    await query('INSERT INTO email_login_codes (user_id, code_hash, expires_at) VALUES ($1, $2, $3)', [
      user.id,
      codeHash,
      expiresAt,
    ]);

    await emailService.sendLoginCode({
      toEmail: user.email,
      toName: user.name || '',
      code,
      expiresInMinutes: CODE_TTL_MINUTES,
    });
  },

  /** Verify a code and start a session. */
  async verifyCode(email: string, code: string): Promise<AuthResult> {
    const user = await UserModel.findByEmail(email.toLowerCase().trim());
    // Same wording as a wrong code: a different message here would confirm
    // which addresses have accounts.
    if (!user) throw badRequest('That code is not valid. Please request a new one.');
    if (user.deleted_at || !user.is_active) {
      throw badRequest('Account is inactive. Please contact support.');
    }

    const row = await queryOne<LoginCodeRow>(
      `SELECT id, user_id, code_hash, attempts
         FROM email_login_codes
        WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1`,
      [user.id]
    );
    if (!row) throw badRequest('That code is not valid. Please request a new one.');

    if (row.attempts >= MAX_ATTEMPTS) {
      await query('UPDATE email_login_codes SET used_at = NOW() WHERE id = $1', [row.id]);
      throw badRequest('Too many attempts. Please request a new code.');
    }

    const matches = await bcrypt.compare(code, row.code_hash);
    if (!matches) {
      await query('UPDATE email_login_codes SET attempts = attempts + 1 WHERE id = $1', [row.id]);
      throw badRequest('That code is not valid. Please request a new one.');
    }

    await query('UPDATE email_login_codes SET used_at = NOW() WHERE id = $1', [row.id]);
    query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]).catch(() => {});

    // Receiving a code at this address proves they control the inbox, which
    // is exactly what verification asks for — so a successful sign-in settles
    // it. Only on success: a failed attempt proves nothing.
    await query(
      'UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = $1',
      [user.id]
    );

    const tokens = await tokenService.generateTokenPair(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        avatarUrl: user.avatar_url,
        approvalStatus: user.approval_status,
        emailVerified: true,
        onboardingSubmittedAt: user.onboarding_submitted_at
          ? new Date(user.onboarding_submitted_at).toISOString()
          : null,
      },
      tokens,
    };
  },
};
