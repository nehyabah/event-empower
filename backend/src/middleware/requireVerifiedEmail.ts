import { Request, Response, NextFunction } from 'express';
import { queryOne } from '../config/database.js';

/**
 * Blocks a new account until it has confirmed its address.
 *
 * A hard gate: nothing is created or changed under an account whose address
 * has not been proven. The UI stands the verification screen in front of every
 * authenticated route, and this is what makes that a rule rather than a
 * routing decision — the API is reachable directly.
 *
 * Accounts created before verification existed were backfilled as verified,
 * and Google and passwordless sign-ins arrive already proven, so this only
 * ever catches a fresh email signup.
 */

/**
 * Router-level guard: blocks every write by an unverified account.
 *
 * Applied with router.use so routes added later are covered by default —
 * annotating each one means the next route added is unprotected and nobody
 * notices. Reads pass through, as does anything the account needs in order to
 * become verified.
 *
 * Only safe on a router that has already run authenticate.
 */
export function blockUnverifiedWrites(exempt: RegExp[] = []) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      next();
      return;
    }
    if (exempt.some((pattern) => pattern.test(req.path))) {
      next();
      return;
    }
    await requireVerifiedEmail(req, res, next);
  };
}

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
