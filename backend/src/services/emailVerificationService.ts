import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { query, queryOne } from '../config/database.js';
import { emailService } from './emailService.js';

/**
 * Proving a signup owns the address it registered with.
 *
 * Nothing checked this before: register created the account and signed the
 * person straight in. A typo meant they could never reset their password,
 * because the code went to whoever really owns that address — and registering
 * someone else's address squatted it, since duplicates are rejected.
 *
 * Codes rather than links, matching password reset and passwordless sign-in:
 * a reset is often begun on a laptop while the mail arrives on a phone, and
 * corporate link scanners consume one-time URLs before anyone clicks them.
 */

const CODE_TTL_MINUTES = 30;
const MAX_ATTEMPTS = 5;
const SALT_ROUNDS = 10;
/** Stops the endpoint being used to send someone a stream of mail. */
const MIN_SECONDS_BETWEEN_SENDS = 60;

interface CodeRow {
  id: string;
  code_hash: string;
  attempts: number;
}

const generateCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');

function badRequest(message: string): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = 400;
  return err;
}

export const emailVerificationService = {
  /**
   * Send a fresh code to the signed-in user's own address.
   *
   * Deliberately takes no email argument: the address comes from the session,
   * so this can never be pointed at somebody else's inbox.
   */
  async sendCode(userId: string): Promise<void> {
    const user = await queryOne<{ email: string | null; name: string | null; email_verified_at: Date | null }>(
      'SELECT email, name, email_verified_at FROM users WHERE id = $1',
      [userId]
    );
    if (!user?.email) throw badRequest('This account has no email address.');
    if (user.email_verified_at) return; // Already done; nothing to send.

    const recent = await queryOne<{ created_at: Date }>(
      `SELECT created_at FROM email_verification_codes
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId]
    );
    if (recent && Date.now() - new Date(recent.created_at).getTime() < MIN_SECONDS_BETWEEN_SENDS * 1000) {
      throw badRequest('A code was just sent. Please wait a moment before asking for another.');
    }

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    // Any earlier code stops working, so only the newest one is live.
    await query(
      `UPDATE email_verification_codes SET used_at = NOW()
        WHERE user_id = $1 AND used_at IS NULL`,
      [userId]
    );
    await query(
      `INSERT INTO email_verification_codes (user_id, code_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, codeHash, expiresAt]
    );

    await emailService.sendEmailVerification({
      toEmail: user.email,
      toName: user.name || '',
      code,
      expiresInMinutes: CODE_TTL_MINUTES,
    });
  },

  async verify(userId: string, code: string): Promise<void> {
    const row = await queryOne<CodeRow>(
      `SELECT id, code_hash, attempts
         FROM email_verification_codes
        WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId]
    );
    if (!row) throw badRequest('That code has expired. Please request a new one.');

    if (row.attempts >= MAX_ATTEMPTS) {
      // Burn it rather than leaving a spent code to be guessed at further.
      await query('UPDATE email_verification_codes SET used_at = NOW() WHERE id = $1', [row.id]);
      throw badRequest('Too many attempts. Please request a new code.');
    }

    const ok = await bcrypt.compare(code.trim(), row.code_hash);
    if (!ok) {
      await query('UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = $1', [row.id]);
      throw badRequest('That code is not correct.');
    }

    await query('UPDATE email_verification_codes SET used_at = NOW() WHERE id = $1', [row.id]);
    await query('UPDATE users SET email_verified_at = NOW() WHERE id = $1', [userId]);
  },
};
