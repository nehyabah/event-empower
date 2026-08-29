import { Request, Response, NextFunction } from 'express';
import { queryOne } from '../config/database.js';

/**
 * Blocks the actions that reach other people until an address is confirmed.
 *
 * Deliberately narrow. Signing up, planning a wedding and filling in a
 * profile are all fine unverified — a wall on first use would cost more than
 * it protects. What is gated is anything that leaves the account: messaging a
 * vendor, and publishing a public wedding site. Those are where an
 * unverifiable identity actually costs somebody else something.
 *
 * Accounts created before verification existed were backfilled as verified,
 * so this only ever applies to new signups.
 */
export async function requireVerifiedEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const row = await queryOne<{ email_verified_at: Date | null; email: string | null }>(
      'SELECT email_verified_at, email FROM users WHERE id = $1',
      [req.user!.userId]
    );

    // No address at all means phone signup, which this cannot speak to.
    if (!row?.email || row.email_verified_at) {
      next();
      return;
    }

    res.status(403).json({
      error: 'Please confirm your email address first. We sent you a code when you signed up.',
      emailVerificationRequired: true,
    });
  } catch (error) {
    next(error);
  }
}
