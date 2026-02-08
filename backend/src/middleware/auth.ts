import { Request, Response, NextFunction } from 'express';
import { tokenService, TokenPayload } from '../services/tokenService.js';
import { queryOne } from '../config/database.js';

export type AdminRole = 'super_admin' | 'admin' | 'support' | 'analyst';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      adminRole?: AdminRole;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired access token' });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
  } catch {
    // Token is invalid, but auth is optional so we continue
  }

  next();
}

export function requireUserType(...types: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!types.includes(req.user.userType)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

export function requireAdminRole(...roles: AdminRole[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.userType !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const row = await queryOne<{ admin_role: AdminRole | null }>(
      'SELECT admin_role FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (!row || !row.admin_role) {
      res.status(403).json({ error: 'Admin role not assigned' });
      return;
    }

    req.adminRole = row.admin_role;

    if (roles.length > 0 && !roles.includes(row.admin_role)) {
      res.status(403).json({ error: 'Insufficient admin permissions' });
      return;
    }

    next();
  };
}
