import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { query, queryOne } from '../config/database.js';
import { UserModel } from '../models/User.js';
import { emailService } from './emailService.js';
import { tokenService } from './tokenService.js';

/**
 * Password reset by emailed six-digit code.
 *
 * A code rather than a link: the reset is often started on a laptop while the
 * email arrives on a phone, and link scanners in corporate mail can consume a
 * one-time URL before the human ever clicks it.
 */

const CODE_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

interface ResetCodeRow {
  id: string;
  user_id: string;
  code_hash: string;
  expires_at: Date;
  attempts: number;
}

/** Six digits, uniformly distributed — Math.random() is not acceptable here. */
function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export const passwordResetService = {
  /**
   * Issue a code, if that email belongs to an account.
   *
   * Returns nothing either way. Telling the caller whether the address exists
   * turns this endpoint into a way to enumerate our users, so the controller
   * answers identically in both cases.
   */
  async requestCode(email: string): Promise<void> {
    const user = await UserModel.findByEmail(email.toLowerCase().trim());
    if (!user || !user.email) return;

    // An account created through Google has no password to reset, and telling
    // them to check their email for a code that cannot help would be worse
    // than saying nothing.
    if (user.auth_provider === 'google' && !user.password_hash) {
      console.log(`[password-reset] ${user.email} is a Google account; no code sent`);
      return;
    }

    // Supersede any outstanding code, so requesting a new one invalidates the
    // old rather than leaving several valid at once.
    await query('UPDATE password_reset_codes SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [
      user.id,
    ]);

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    await query(
      'INSERT INTO password_reset_codes (user_id, code_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, codeHash, expiresAt]
    );

    await emailService.sendPasswordResetCode({
      toEmail: user.email,
      toName: user.name || '',
      code,
      expiresInMinutes: CODE_TTL_MINUTES,
    });
  },

  /**
   * Verify a code and set the new password.
   *
   * Throws with a statusCode so the controller can pass the message through;
   * the wording is deliberately the same for a wrong code and an unknown
   * email, again to avoid confirming which accounts exist.
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    const user = await UserModel.findByEmail(email.toLowerCase().trim());
    if (!user) throw badRequest('That code is not valid. Please request a new one.');

    const row = await queryOne<ResetCodeRow>(
      `SELECT id, user_id, code_hash, expires_at, attempts
         FROM password_reset_codes
        WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1`,
      [user.id]
    );
    if (!row) throw badRequest('That code is not valid. Please request a new one.');

    if (row.attempts >= MAX_ATTEMPTS) {
      // Burn it rather than leaving a code that can be guessed at forever.
      await query('UPDATE password_reset_codes SET used_at = NOW() WHERE id = $1', [row.id]);
      throw badRequest('Too many attempts. Please request a new code.');
    }

    const matches = await bcrypt.compare(code, row.code_hash);
    if (!matches) {
      await query('UPDATE password_reset_codes SET attempts = attempts + 1 WHERE id = $1', [row.id]);
      throw badRequest('That code is not valid. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    // Written directly rather than through UserModel.update: password_hash is
    // deliberately absent from UpdateUserInput so a password cannot be changed
    // as a side effect of an ordinary profile update.
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      passwordHash,
      user.id,
    ]);
    await query('UPDATE password_reset_codes SET used_at = NOW() WHERE id = $1', [row.id]);

    // Whoever had the old password may still hold a live session. Resetting is
    // how someone reacts to a compromise, so every existing session goes.
    await tokenService.revokeAllUserTokens(user.id);
  },
};

function badRequest(message: string): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = 400;
  return err;
}
