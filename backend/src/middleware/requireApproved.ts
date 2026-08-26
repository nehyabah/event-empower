import { Request, Response, NextFunction } from 'express';
import { queryOne } from '../config/database.js';

/**
 * Blocks vendors and planners who have not been approved yet.
 *
 * The UI disables these actions too, but that is only a courtesy — the
 * approval gate has to hold at the API or it is decoration. Couples and
 * admins are never gated.
 *
 * Read paths stay open deliberately: a pending professional can still see and
 * complete their own profile, which is what we are asking them to do.
 */
export async function requireApproved(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userType = req.user?.userType;
    if (userType !== 'vendor' && userType !== 'planner') {
      next();
      return;
    }

    const row = await queryOne<{ approval_status: string }>(
      'SELECT approval_status FROM users WHERE id = $1',
      [req.user!.userId]
    );

    if (row?.approval_status === 'approved') {
      next();
      return;
    }

    res.status(403).json({
      error:
        row?.approval_status === 'rejected'
          ? 'Your application was not approved. Please contact support.'
          : 'Your account is awaiting approval.',
      approvalStatus: row?.approval_status ?? 'pending',
    });
  } catch (error) {
    next(error);
  }
}
