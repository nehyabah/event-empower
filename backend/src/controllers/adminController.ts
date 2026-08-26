import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { CookieOptions } from 'express';
import { authService } from '../services/authService.js';
import { tokenService } from '../services/tokenService.js';
import { jwtConfig } from '../config/jwt.js';
import { query, queryOne } from '../config/database.js';
import type { UserType } from '../models/User.js';
import {
  VendorProfileModel,
  VendorServiceModel,
  VendorImageModel,
  VendorInquiryModel,
  InquiryMessageModel,
} from '../models/VendorProfile.js';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const allowedUserTypes: UserType[] = ['client', 'vendor', 'planner', 'admin'];

function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie('refreshToken', refreshToken, jwtConfig.cookie as CookieOptions);
}

function sanitizeUserType(input: unknown): UserType | null {
  if (typeof input !== 'string') return null;
  return allowedUserTypes.includes(input as UserType) ? (input as UserType) : null;
}

interface AuditLogInput {
  action: string;
  resourceType: string;
  resourceId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
}

function getRequestIp(req: Request): string | null {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0]?.trim() || null;
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0] || null;
  }

  return req.ip || null;
}

async function logAdminAction(req: Request, input: AuditLogInput): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)`,
      [
        req.user?.userId || null,
        input.action,
        input.resourceType,
        input.resourceId || null,
        input.oldValues === undefined ? null : JSON.stringify(input.oldValues),
        input.newValues === undefined ? null : JSON.stringify(input.newValues),
        getRequestIp(req),
        req.headers['user-agent'] || null,
      ]
    );
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

export const adminController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input);

      if (result.user.userType !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      // Fetch admin role
      const roleRow = await queryOne<{ admin_role: string | null }>(
        'SELECT admin_role FROM users WHERE id = $1',
        [result.user.id]
      );

      setRefreshTokenCookie(res, result.tokens.refreshToken);

      // Audit log for admin login (use raw query since req.user isn't set yet)
      query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [result.user.id, 'admin.login', 'user', result.user.id, getRequestIp(req), req.headers['user-agent'] || null]
      ).catch(() => {});

      res.json({
        user: {
          ...result.user,
          adminRole: roleRow?.admin_role || 'admin',
        },
        accessToken: result.tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await queryOne<{
        id: string;
        email: string | null;
        name: string | null;
        phone: string | null;
        user_type: UserType;
        avatar_url: string | null;
        admin_role: string | null;
        created_at: Date;
      }>(
        'SELECT id, email, name, phone, user_type, avatar_url, admin_role, created_at FROM users WHERE id = $1',
        [req.user.userId]
      );

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        userType: user.user_type,
        avatarUrl: user.avatar_url,
        adminRole: user.admin_role || 'admin',
        createdAt: user.created_at,
      });
    } catch (error) {
      next(error);
    }
  },

  async stats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await query<{ user_type: UserType; count: number }>(
        `SELECT user_type, COUNT(*)::int AS count
         FROM users
         GROUP BY user_type`
      );

      const stats = {
        totalUsers: 0,
        clients: 0,
        vendors: 0,
        planners: 0,
        admins: 0,
      };

      for (const row of rows) {
        stats.totalUsers += row.count;
        if (row.user_type === 'client') stats.clients = row.count;
        if (row.user_type === 'vendor') stats.vendors = row.count;
        if (row.user_type === 'planner') stats.planners = row.count;
        if (row.user_type === 'admin') stats.admins = row.count;
      }

      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  async dashboardActivity(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [active24h, active7d, active30d, recentRegistrations, recentInquiries, recentAuditLogs] =
        await Promise.all([
          queryOne<{ count: number }>(
            `SELECT COUNT(*)::int AS count FROM users WHERE last_login_at >= NOW() - INTERVAL '24 hours'`
          ),
          queryOne<{ count: number }>(
            `SELECT COUNT(*)::int AS count FROM users WHERE last_login_at >= NOW() - INTERVAL '7 days'`
          ),
          queryOne<{ count: number }>(
            `SELECT COUNT(*)::int AS count FROM users WHERE last_login_at >= NOW() - INTERVAL '30 days'`
          ),
          query<{
            id: string;
            name: string | null;
            email: string | null;
            user_type: string;
            created_at: Date;
          }>(
            `SELECT id, name, email, user_type, created_at
             FROM users
             ORDER BY created_at DESC
             LIMIT 10`
          ),
          query<{
            id: string;
            sender_name: string;
            business_name: string;
            status: string;
            created_at: Date;
          }>(
            `SELECT vi.id, vi.sender_name, vp.business_name, vi.status, vi.created_at
             FROM vendor_inquiries vi
             JOIN vendor_profiles vp ON vp.id = vi.vendor_id
             ORDER BY vi.created_at DESC
             LIMIT 10`
          ),
          query<{
            id: string;
            action: string;
            resource_type: string | null;
            actor_name: string | null;
            created_at: Date;
          }>(
            `SELECT al.id, al.action, al.resource_type, u.name AS actor_name, al.created_at
             FROM audit_logs al
             LEFT JOIN users u ON u.id = al.user_id
             ORDER BY al.created_at DESC
             LIMIT 10`
          ),
        ]);

      res.json({
        activeUsers: {
          last24h: active24h?.count || 0,
          last7d: active7d?.count || 0,
          last30d: active30d?.count || 0,
        },
        recentRegistrations: recentRegistrations.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          userType: r.user_type,
          createdAt: r.created_at,
        })),
        recentInquiries: recentInquiries.map((i) => ({
          id: i.id,
          senderName: i.sender_name,
          vendorName: i.business_name,
          status: i.status,
          createdAt: i.created_at,
        })),
        recentAuditLogs: recentAuditLogs.map((l) => ({
          id: l.id,
          action: l.action,
          resourceType: l.resource_type,
          actorName: l.actor_name,
          createdAt: l.created_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
      const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0);
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const userType = sanitizeUserType(req.query.type);

      const filters: string[] = [];
      const params: unknown[] = [];

      if (userType) {
        params.push(userType);
        filters.push(`user_type = $${params.length}`);
      }

      if (search) {
        params.push(`%${search}%`);
        filters.push(`(email ILIKE $${params.length} OR name ILIKE $${params.length} OR phone ILIKE $${params.length})`);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      const countRow = await queryOne<{ count: number }>(
        `SELECT COUNT(*)::int AS count
         FROM users
         ${whereClause}`,
        params
      );

      const listParams = [...params, limit, offset];

      const users = await query<{
        id: string;
        email: string | null;
        phone: string | null;
        name: string | null;
        user_type: UserType;
        avatar_url: string | null;
        is_active: boolean;
        suspended_at: Date | null;
        deleted_at: Date | null;
        created_at: Date;
      }>(
        `SELECT id, email, phone, name, user_type, avatar_url, is_active, suspended_at, deleted_at, created_at
         FROM users
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${listParams.length - 1}
         OFFSET $${listParams.length}`,
        listParams
      );

      res.json({
        total: countRow?.count || 0,
        limit,
        offset,
        users: users.map((user) => ({
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          userType: user.user_type,
          avatarUrl: user.avatar_url,
          isActive: user.is_active,
          suspendedAt: user.suspended_at,
          deletedAt: user.deleted_at,
          createdAt: user.created_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.id);
      const user = await queryOne<{
        id: string;
        email: string | null;
        phone: string | null;
        name: string | null;
        user_type: UserType;
        avatar_url: string | null;
        is_active: boolean;
        suspended_at: Date | null;
        deleted_at: Date | null;
        admin_notes: string | null;
        business_name: string | null;
        instagram_handle: string | null;
        whatsapp_phone: string | null;
        city: string | null;
        approval_status: string;
        auth_provider: string | null;
        created_at: Date;
        updated_at: Date;
      }>(
        `SELECT id, email, phone, name, user_type, avatar_url, is_active, suspended_at, deleted_at,
                admin_notes, business_name, instagram_handle, whatsapp_phone, city,
                approval_status, auth_provider, created_at, updated_at
         FROM users
         WHERE id = $1`,
        [userId]
      );

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        userType: user.user_type,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        suspendedAt: user.suspended_at,
        deletedAt: user.deleted_at,
        adminNotes: user.admin_notes,
        businessName: user.business_name,
        instagramHandle: user.instagram_handle,
        whatsappPhone: user.whatsapp_phone,
        city: user.city,
        approvalStatus: user.approval_status,
        authProvider: user.auth_provider,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      });
    } catch (error) {
      next(error);
    }
  },

  async suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.id);
      const existingUser = await queryOne<{
        id: string;
        is_active: boolean;
        suspended_at: Date | null;
        deleted_at: Date | null;
      }>(
        `SELECT id, is_active, suspended_at, deleted_at
         FROM users
         WHERE id = $1`,
        [userId]
      );

      if (!existingUser || existingUser.deleted_at) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const user = await queryOne<{
        id: string;
        is_active: boolean;
        suspended_at: Date | null;
      }>(
        `UPDATE users
         SET is_active = false,
             suspended_at = NOW(),
             updated_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id, is_active, suspended_at`,
        [userId]
      );

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await tokenService.revokeAllUserTokens(userId);
      await logAdminAction(req, {
        action: 'admin.user.suspend',
        resourceType: 'user',
        resourceId: user.id,
        oldValues: {
          isActive: existingUser.is_active,
          suspendedAt: existingUser.suspended_at,
        },
        newValues: {
          isActive: user.is_active,
          suspendedAt: user.suspended_at,
        },
      });

      res.json({ id: user.id, isActive: user.is_active });
    } catch (error) {
      next(error);
    }
  },

  async activateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.id);
      const existingUser = await queryOne<{ id: string; is_active: boolean; suspended_at: Date | null }>(
        'SELECT id, is_active, suspended_at FROM users WHERE id = $1 AND deleted_at IS NULL',
        [userId]
      );

      if (!existingUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const user = await queryOne<{
        id: string;
        is_active: boolean;
      }>(
        `UPDATE users
         SET is_active = true,
             suspended_at = NULL,
             updated_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id, is_active`,
        [userId]
      );

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await logAdminAction(req, {
        action: 'admin.user.activate',
        resourceType: 'user',
        resourceId: user.id,
        oldValues: { isActive: existingUser.is_active, suspendedAt: existingUser.suspended_at },
        newValues: { isActive: true, suspendedAt: null },
      });

      res.json({ id: user.id, isActive: user.is_active });
    } catch (error) {
      next(error);
    }
  },

  async softDeleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.id);
      const existingUser = await queryOne<{
        id: string;
        is_active: boolean;
        suspended_at: Date | null;
        deleted_at: Date | null;
      }>(
        `SELECT id, is_active, suspended_at, deleted_at
         FROM users
         WHERE id = $1`,
        [userId]
      );

      if (!existingUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const user = await queryOne<{ id: string; is_active: boolean; deleted_at: Date | null }>(
        `UPDATE users
         SET deleted_at = NOW(),
             is_active = false,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, is_active, deleted_at`,
        [userId]
      );

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await tokenService.revokeAllUserTokens(userId);
      await logAdminAction(req, {
        action: 'admin.user.soft_delete',
        resourceType: 'user',
        resourceId: user.id,
        oldValues: {
          isActive: existingUser.is_active,
          suspendedAt: existingUser.suspended_at,
          deletedAt: existingUser.deleted_at,
        },
        newValues: {
          isActive: user.is_active,
          deletedAt: user.deleted_at,
        },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.id);
      const schema = z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        user_type: z.enum(['client', 'vendor', 'planner', 'admin']).optional(),
        // Professional details. A vendor or planner who signed up with Google
        // never supplies these, so an admin has to be able to fill them in
        // before approving — the approvals list is keyed on business_name.
        business_name: z.string().optional(),
        instagram_handle: z.string().optional(),
        whatsapp_phone: z.string().optional(),
        city: z.string().optional(),
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const existing = await queryOne<{ id: string; name: string | null; email: string | null; phone: string | null; user_type: UserType }>(
        'SELECT id, name, email, phone, user_type FROM users WHERE id = $1',
        [userId]
      );
      if (!existing) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;
      const updates = validation.data;

      if (updates.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }
      if (updates.email !== undefined) {
        fields.push(`email = $${paramIndex++}`);
        values.push(updates.email.toLowerCase());
      }
      if (updates.phone !== undefined) {
        fields.push(`phone = $${paramIndex++}`);
        values.push(updates.phone || null);
      }
      if (updates.user_type !== undefined) {
        fields.push(`user_type = $${paramIndex++}`);
        values.push(updates.user_type);
      }
      // Empty string clears the column rather than storing ''.
      for (const column of ['business_name', 'instagram_handle', 'whatsapp_phone', 'city'] as const) {
        const value = updates[column];
        if (value !== undefined) {
          fields.push(`${column} = $${paramIndex++}`);
          values.push(value || null);
        }
      }

      if (fields.length === 0) {
        res.status(400).json({ error: 'No updates provided' });
        return;
      }

      fields.push('updated_at = NOW()');
      values.push(userId);

      const user = await queryOne(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      await logAdminAction(req, {
        action: 'admin.user.update',
        resourceType: 'user',
        resourceId: userId,
        oldValues: { name: existing.name, email: existing.email, phone: existing.phone, userType: existing.user_type },
        newValues: updates,
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateUserNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.id);
      const schema = z.object({
        adminNotes: z.string(),
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const existing = await queryOne<{ id: string; admin_notes: string | null }>(
        'SELECT id, admin_notes FROM users WHERE id = $1',
        [userId]
      );
      if (!existing) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await query(
        'UPDATE users SET admin_notes = $1, updated_at = NOW() WHERE id = $2',
        [validation.data.adminNotes, userId]
      );

      await logAdminAction(req, {
        action: 'admin.user.update_notes',
        resourceType: 'user',
        resourceId: userId,
        oldValues: { adminNotes: existing.admin_notes },
        newValues: { adminNotes: validation.data.adminNotes },
      });

      res.json({ id: userId, adminNotes: validation.data.adminNotes });
    } catch (error) {
      next(error);
    }
  },

  async resetUserPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = String(req.params.id);
      const existing = await queryOne<{ id: string; email: string | null }>(
        'SELECT id, email FROM users WHERE id = $1',
        [userId]
      );
      if (!existing) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Generate a random temporary password
      const temporaryPassword = crypto.randomBytes(8).toString('hex');
      const passwordHash = await bcrypt.hash(temporaryPassword, 12);

      await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, userId]
      );

      await tokenService.revokeAllUserTokens(userId);

      await logAdminAction(req, {
        action: 'admin.user.reset_password',
        resourceType: 'user',
        resourceId: userId,
      });

      res.json({ temporaryPassword });
    } catch (error) {
      next(error);
    }
  },

  async listVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
      const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0);
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

      const filters: string[] = [];
      const params: unknown[] = [];

      if (search) {
        params.push(`%${search}%`);
        filters.push(`(vp.business_name ILIKE $${params.length} OR vp.category ILIKE $${params.length} OR vp.location ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      const countRow = await queryOne<{ count: number }>(
        `SELECT COUNT(*)::int AS count
         FROM vendor_profiles vp
         JOIN users u ON u.id = vp.user_id
         ${whereClause}`,
        params
      );

      const listParams = [...params, limit, offset];
      const vendors = await query<{
        id: string;
        user_id: string;
        business_name: string;
        category: string;
        location: string | null;
        is_verified: boolean;
        is_active: boolean;
        created_at: Date;
        email: string | null;
      }>(
        `SELECT vp.id, vp.user_id, vp.business_name, vp.category, vp.location, vp.is_verified, vp.is_active, vp.created_at, u.email
         FROM vendor_profiles vp
         JOIN users u ON u.id = vp.user_id
         ${whereClause}
         ORDER BY vp.created_at DESC
         LIMIT $${listParams.length - 1}
         OFFSET $${listParams.length}`,
        listParams
      );

      res.json({
        total: countRow?.count || 0,
        limit,
        offset,
        vendors: vendors.map((vendor) => ({
          id: vendor.id,
          userId: vendor.user_id,
          businessName: vendor.business_name,
          category: vendor.category,
          location: vendor.location,
          isVerified: vendor.is_verified,
          isActive: vendor.is_active,
          createdAt: vendor.created_at,
          email: vendor.email,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async getVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = String(req.params.id);
      const profile = await VendorProfileModel.findById(vendorId);
      if (!profile) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      const [services, images, user, featured] = await Promise.all([
        VendorServiceModel.findByVendorId(profile.id),
        VendorImageModel.findByVendorId(profile.id),
        queryOne<{ email: string | null }>('SELECT email FROM users WHERE id = $1', [profile.user_id]),
        queryOne<{ is_featured: boolean }>('SELECT is_featured FROM vendor_profiles WHERE id = $1', [profile.id]),
      ]);

      res.json({
        profile: {
          ...profile,
          is_featured: featured?.is_featured || false,
        },
        services,
        images,
        email: user?.email || null,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = String(req.params.id);
      const schema = z.object({
        business_name: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const existing = await VendorProfileModel.findById(vendorId);
      if (!existing) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;
      const updates = validation.data;

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          fields.push(`${key} = $${paramIndex++}`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        res.status(400).json({ error: 'No updates provided' });
        return;
      }

      fields.push('updated_at = NOW()');
      values.push(vendorId);

      const updated = await queryOne(
        `UPDATE vendor_profiles SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      await logAdminAction(req, {
        action: 'admin.vendor.update',
        resourceType: 'vendor_profile',
        resourceId: vendorId,
        oldValues: updates,
        newValues: updated,
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async verifyVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = String(req.params.id);
      const vendor = await queryOne<{ id: string; is_verified: boolean }>(
        `UPDATE vendor_profiles SET is_verified = true, updated_at = NOW() WHERE id = $1 RETURNING id, is_verified`,
        [vendorId]
      );
      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      await logAdminAction(req, {
        action: 'admin.vendor.verify',
        resourceType: 'vendor_profile',
        resourceId: vendorId,
        oldValues: { isVerified: false },
        newValues: { isVerified: true },
      });

      res.json({ id: vendor.id, isVerified: vendor.is_verified });
    } catch (error) {
      next(error);
    }
  },

  async unverifyVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = String(req.params.id);
      const vendor = await queryOne<{ id: string; is_verified: boolean }>(
        `UPDATE vendor_profiles SET is_verified = false, updated_at = NOW() WHERE id = $1 RETURNING id, is_verified`,
        [vendorId]
      );
      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      await logAdminAction(req, {
        action: 'admin.vendor.unverify',
        resourceType: 'vendor_profile',
        resourceId: vendorId,
        oldValues: { isVerified: true },
        newValues: { isVerified: false },
      });

      res.json({ id: vendor.id, isVerified: vendor.is_verified });
    } catch (error) {
      next(error);
    }
  },

  async featureVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = String(req.params.id);
      const vendor = await queryOne<{ id: string; is_featured: boolean }>(
        `UPDATE vendor_profiles SET is_featured = true, updated_at = NOW() WHERE id = $1 RETURNING id, is_featured`,
        [vendorId]
      );
      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      await logAdminAction(req, {
        action: 'admin.vendor.feature',
        resourceType: 'vendor_profile',
        resourceId: vendorId,
        oldValues: { isFeatured: false },
        newValues: { isFeatured: true },
      });

      res.json({ id: vendor.id, isFeatured: vendor.is_featured });
    } catch (error) {
      next(error);
    }
  },

  async unfeatureVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = String(req.params.id);
      const vendor = await queryOne<{ id: string; is_featured: boolean }>(
        `UPDATE vendor_profiles SET is_featured = false, updated_at = NOW() WHERE id = $1 RETURNING id, is_featured`,
        [vendorId]
      );
      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      await logAdminAction(req, {
        action: 'admin.vendor.unfeature',
        resourceType: 'vendor_profile',
        resourceId: vendorId,
        oldValues: { isFeatured: true },
        newValues: { isFeatured: false },
      });

      res.json({ id: vendor.id, isFeatured: vendor.is_featured });
    } catch (error) {
      next(error);
    }
  },

  async suspendVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = String(req.params.id);
      const profile = await VendorProfileModel.findById(vendorId);
      if (!profile) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      await query(
        `UPDATE vendor_profiles SET is_active = false, updated_at = NOW() WHERE id = $1`,
        [vendorId]
      );
      await query(
        `UPDATE users SET is_active = false, suspended_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [profile.user_id]
      );
      await tokenService.revokeAllUserTokens(profile.user_id);

      await logAdminAction(req, {
        action: 'admin.vendor.suspend',
        resourceType: 'vendor_profile',
        resourceId: vendorId,
        oldValues: { isActive: true },
        newValues: { isActive: false },
      });

      res.json({ id: vendorId, isActive: false });
    } catch (error) {
      next(error);
    }
  },

  async activateVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorId = String(req.params.id);
      const profile = await VendorProfileModel.findById(vendorId);
      if (!profile) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }

      await query(
        `UPDATE vendor_profiles SET is_active = true, updated_at = NOW() WHERE id = $1`,
        [vendorId]
      );
      await query(
        `UPDATE users SET is_active = true, suspended_at = NULL, updated_at = NOW() WHERE id = $1`,
        [profile.user_id]
      );

      await logAdminAction(req, {
        action: 'admin.vendor.activate',
        resourceType: 'vendor_profile',
        resourceId: vendorId,
        oldValues: { isActive: false },
        newValues: { isActive: true },
      });

      res.json({ id: vendorId, isActive: true });
    } catch (error) {
      next(error);
    }
  },

  async listInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
      const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0);
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';

      const filters: string[] = [];
      const params: unknown[] = [];

      if (status) {
        params.push(status);
        filters.push(`vi.status = $${params.length}`);
      }
      if (search) {
        params.push(`%${search}%`);
        filters.push(`(vi.sender_name ILIKE $${params.length} OR vi.sender_email ILIKE $${params.length} OR vp.business_name ILIKE $${params.length})`);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      const countRow = await queryOne<{ count: number }>(
        `SELECT COUNT(*)::int AS count
         FROM vendor_inquiries vi
         JOIN vendor_profiles vp ON vp.id = vi.vendor_id
         ${whereClause}`,
        params
      );

      const listParams = [...params, limit, offset];
      const inquiries = await query<{
        id: string;
        vendor_id: string;
        sender_name: string;
        sender_email: string | null;
        status: string;
        event_date: Date | null;
        created_at: Date;
        business_name: string;
      }>(
        `SELECT vi.id, vi.vendor_id, vi.sender_name, vi.sender_email, vi.status, vi.event_date, vi.created_at,
                vp.business_name
         FROM vendor_inquiries vi
         JOIN vendor_profiles vp ON vp.id = vi.vendor_id
         ${whereClause}
         ORDER BY vi.created_at DESC
         LIMIT $${listParams.length - 1}
         OFFSET $${listParams.length}`,
        listParams
      );

      res.json({
        total: countRow?.count || 0,
        limit,
        offset,
        inquiries: inquiries.map((inquiry) => ({
          id: inquiry.id,
          vendorId: inquiry.vendor_id,
          vendorName: inquiry.business_name,
          senderName: inquiry.sender_name,
          senderEmail: inquiry.sender_email,
          status: inquiry.status,
          eventDate: inquiry.event_date,
          createdAt: inquiry.created_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async getInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inquiryId = String(req.params.id);
      const inquiry = await VendorInquiryModel.findById(inquiryId);
      if (!inquiry) {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }

      const [messages, vendor] = await Promise.all([
        InquiryMessageModel.listByInquiryId(inquiryId),
        VendorProfileModel.findById(inquiry.vendor_id),
      ]);

      res.json({
        inquiry,
        messages,
        vendor,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existingInquiry = await VendorInquiryModel.findById(String(req.params.id));
      if (!existingInquiry) {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }

      const schema = z.object({
        status: z.enum(['new', 'replied', 'archived']).optional(),
        notes: z.string().optional(),
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const inquiry = await VendorInquiryModel.update(String(req.params.id), {
        status: validation.data.status,
        notes: validation.data.notes,
      });

      if (!inquiry) {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }

      await logAdminAction(req, {
        action: 'admin.inquiry.update',
        resourceType: 'inquiry',
        resourceId: inquiry.id,
        oldValues: {
          status: existingInquiry.status,
          notes: existingInquiry.notes,
        },
        newValues: {
          status: inquiry.status,
          notes: inquiry.notes,
        },
      });

      res.json(inquiry);
    } catch (error) {
      next(error);
    }
  },

  async analyticsOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [userCounts, vendorCounts, inquiryCounts] = await Promise.all([
        queryOne<{ total: number }>('SELECT COUNT(*)::int AS total FROM users'),
        queryOne<{ total: number }>('SELECT COUNT(*)::int AS total FROM vendor_profiles'),
        queryOne<{ total: number }>('SELECT COUNT(*)::int AS total FROM vendor_inquiries'),
      ]);

      const userGrowth = await query<{ day: string; count: number }>(
        `WITH days AS (
          SELECT generate_series(current_date - interval '29 days', current_date, '1 day')::date AS day
        )
        SELECT d.day::text AS day, COALESCE(COUNT(u.id), 0)::int AS count
        FROM days d
        LEFT JOIN users u ON u.created_at::date = d.day
        GROUP BY d.day
        ORDER BY d.day`
      );

      const inquiriesByStatus = await query<{ status: string; count: number }>(
        `SELECT status, COUNT(*)::int AS count
         FROM vendor_inquiries
         GROUP BY status`
      );

      const inquiryVolume = await query<{ day: string; count: number }>(
        `WITH days AS (
          SELECT generate_series(current_date - interval '29 days', current_date, '1 day')::date AS day
        )
        SELECT d.day::text AS day, COALESCE(COUNT(i.id), 0)::int AS count
        FROM days d
        LEFT JOIN vendor_inquiries i ON i.created_at::date = d.day
        GROUP BY d.day
        ORDER BY d.day`
      );

      res.json({
        totals: {
          users: userCounts?.total || 0,
          vendors: vendorCounts?.total || 0,
          inquiries: inquiryCounts?.total || 0,
        },
        userGrowth,
        inquiriesByStatus,
        inquiryVolume,
      });
    } catch (error) {
      next(error);
    }
  },

  async analyticsUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usersByType = await query<{ user_type: UserType; count: number }>(
        `SELECT user_type, COUNT(*)::int AS count
         FROM users
         GROUP BY user_type`
      );

      const userGrowth = await query<{ day: string; count: number }>(
        `WITH days AS (
          SELECT generate_series(current_date - interval '29 days', current_date, '1 day')::date AS day
        )
        SELECT d.day::text AS day, COALESCE(COUNT(u.id), 0)::int AS count
        FROM days d
        LEFT JOIN users u ON u.created_at::date = d.day
        GROUP BY d.day
        ORDER BY d.day`
      );

      res.json({ usersByType, userGrowth });
    } catch (error) {
      next(error);
    }
  },

  async analyticsVendors(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendorsByCategory = await query<{ category: string; count: number }>(
        `SELECT category, COUNT(*)::int AS count
         FROM vendor_profiles
         GROUP BY category
         ORDER BY count DESC`
      );

      const vendorGrowth = await query<{ day: string; count: number }>(
        `WITH days AS (
          SELECT generate_series(current_date - interval '29 days', current_date, '1 day')::date AS day
        )
        SELECT d.day::text AS day, COALESCE(COUNT(v.id), 0)::int AS count
        FROM days d
        LEFT JOIN vendor_profiles v ON v.created_at::date = d.day
        GROUP BY d.day
        ORDER BY d.day`
      );

      res.json({ vendorsByCategory, vendorGrowth });
    } catch (error) {
      next(error);
    }
  },

  async analyticsInquiries(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inquiriesByStatus = await query<{ status: string; count: number }>(
        `SELECT status, COUNT(*)::int AS count
         FROM vendor_inquiries
         GROUP BY status`
      );

      const inquiryVolume = await query<{ day: string; count: number }>(
        `WITH days AS (
          SELECT generate_series(current_date - interval '29 days', current_date, '1 day')::date AS day
        )
        SELECT d.day::text AS day, COALESCE(COUNT(i.id), 0)::int AS count
        FROM days d
        LEFT JOIN vendor_inquiries i ON i.created_at::date = d.day
        GROUP BY d.day
        ORDER BY d.day`
      );

      res.json({ inquiriesByStatus, inquiryVolume });
    } catch (error) {
      next(error);
    }
  },

  async listSupportTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
      const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0);
      const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

      const filters: string[] = [];
      const params: unknown[] = [];

      if (status) {
        params.push(status);
        filters.push(`t.status = $${params.length}`);
      }
      if (search) {
        params.push(`%${search}%`);
        filters.push(`(t.subject ILIKE $${params.length} OR t.description ILIKE $${params.length})`);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      const countRow = await queryOne<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM support_tickets t ${whereClause}`,
        params
      );

      const listParams = [...params, limit, offset];
      const tickets = await query<{
        id: string;
        ticket_number: number;
        subject: string;
        status: string;
        priority: string;
        category: string | null;
        created_at: Date;
      }>(
        `SELECT id, ticket_number, subject, status, priority, category, created_at
         FROM support_tickets t
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${listParams.length - 1}
         OFFSET $${listParams.length}`,
        listParams
      );

      res.json({
        total: countRow?.count || 0,
        limit,
        offset,
        tickets: tickets.map((ticket) => ({
          id: ticket.id,
          ticketNumber: ticket.ticket_number,
          subject: ticket.subject,
          status: ticket.status,
          priority: ticket.priority,
          category: ticket.category,
          createdAt: ticket.created_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async getSupportTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await queryOne<{
        id: string;
        ticket_number: number;
        user_id: string | null;
        assigned_to: string | null;
        subject: string;
        description: string | null;
        status: string;
        priority: string;
        category: string | null;
        created_at: Date;
        updated_at: Date;
      }>(
        `SELECT * FROM support_tickets WHERE id = $1`,
        [String(req.params.id)]
      );

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      const messages = await query<{
        id: string;
        sender_id: string | null;
        message: string;
        is_internal: boolean;
        created_at: Date;
      }>(
        `SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC`,
        [String(req.params.id)]
      );

      res.json({
        ticket,
        messages,
      });
    } catch (error) {
      next(error);
    }
  },

  async createSupportTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        subject: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        category: z.string().optional(),
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const ticket = await queryOne<{ id: string; subject: string; priority: string; category: string | null }>(
        `INSERT INTO support_tickets (subject, description, priority, category)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          validation.data.subject,
          validation.data.description || null,
          validation.data.priority || 'medium',
          validation.data.category || null,
        ]
      );

      if (ticket) {
        await logAdminAction(req, {
          action: 'admin.support.ticket.create',
          resourceType: 'support_ticket',
          resourceId: ticket.id,
          newValues: { subject: ticket.subject, priority: ticket.priority, category: ticket.category },
        });
      }

      res.status(201).json(ticket);
    } catch (error) {
      next(error);
    }
  },

  async updateSupportTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        status: z.enum(['open', 'pending', 'resolved']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        category: z.string().optional(),
        resolved: z.boolean().optional(),
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (validation.data.status) {
        fields.push(`status = $${paramIndex++}`);
        values.push(validation.data.status);
      }
      if (validation.data.priority) {
        fields.push(`priority = $${paramIndex++}`);
        values.push(validation.data.priority);
      }
      if (validation.data.category !== undefined) {
        fields.push(`category = $${paramIndex++}`);
        values.push(validation.data.category || null);
      }
      if (validation.data.resolved) {
        fields.push(`resolved_at = NOW()`);
      }

      if (!fields.length) {
        res.status(400).json({ error: 'No updates provided' });
        return;
      }

      values.push(String(req.params.id));

      const existingTicket = await queryOne<{ id: string; status: string; priority: string; category: string | null }>(
        'SELECT id, status, priority, category FROM support_tickets WHERE id = $1',
        [String(req.params.id)]
      );

      const ticket = await queryOne(
        `UPDATE support_tickets SET ${fields.join(', ')}, updated_at = NOW()
         WHERE id = $${paramIndex}
         RETURNING *`,
        values
      );

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      await logAdminAction(req, {
        action: 'admin.support.ticket.update',
        resourceType: 'support_ticket',
        resourceId: String(req.params.id),
        oldValues: existingTicket ? { status: existingTicket.status, priority: existingTicket.priority, category: existingTicket.category } : null,
        newValues: validation.data,
      });

      res.json(ticket);
    } catch (error) {
      next(error);
    }
  },

  async addSupportMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        message: z.string().min(1),
        isInternal: z.boolean().optional(),
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const message = await queryOne<{ id: string }>(
        `INSERT INTO ticket_messages (ticket_id, sender_id, message, is_internal)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [String(req.params.id), req.user?.userId || null, validation.data.message, validation.data.isInternal || false]
      );

      if (message) {
        await logAdminAction(req, {
          action: 'admin.support.message.add',
          resourceType: 'support_ticket',
          resourceId: String(req.params.id),
          newValues: { messageId: message.id, isInternal: validation.data.isInternal || false },
        });
      }

      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  },

  async listModerationComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
      const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0);
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

      const filters: string[] = [];
      const params: unknown[] = [];

      if (search) {
        params.push(`%${search}%`);
        filters.push(`(c.name ILIKE $${params.length} OR c.text ILIKE $${params.length})`);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      const countRow = await queryOne<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM story_comments c ${whereClause}`,
        params
      );

      const listParams = [...params, limit, offset];
      const comments = await query<{
        id: string;
        user_id: string;
        name: string;
        text: string;
        created_at: Date;
      }>(
        `SELECT id, user_id, name, text, created_at
         FROM story_comments c
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${listParams.length - 1}
         OFFSET $${listParams.length}`,
        listParams
      );

      res.json({
        total: countRow?.count || 0,
        limit,
        offset,
        comments,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteModerationComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await queryOne<{ id: string; user_id: string; name: string; text: string }>(
        `DELETE FROM story_comments
         WHERE id = $1
         RETURNING id, user_id, name, text`,
        [String(req.params.id)]
      );

      if (!result) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      await logAdminAction(req, {
        action: 'admin.moderation.comment.delete',
        resourceType: 'story_comment',
        resourceId: result.id,
        oldValues: {
          userId: result.user_id,
          name: result.name,
          text: result.text,
        },
        newValues: null,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async listModerationImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
      const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0);

      const countRow = await queryOne<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM story_images`
      );

      const images = await query<{
        id: string;
        user_id: string;
        url: string;
        caption: string | null;
        story_type: string;
        created_at: Date;
      }>(
        `SELECT id, user_id, url, caption, story_type, created_at
         FROM story_images
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      res.json({
        total: countRow?.count || 0,
        limit,
        offset,
        images,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteModerationImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await queryOne<{
        id: string;
        user_id: string;
        url: string;
        caption: string | null;
        story_type: string;
      }>(
        `DELETE FROM story_images
         WHERE id = $1
         RETURNING id, user_id, url, caption, story_type`,
        [String(req.params.id)]
      );

      if (!result) {
        res.status(404).json({ error: 'Image not found' });
        return;
      }

      await logAdminAction(req, {
        action: 'admin.moderation.image.delete',
        resourceType: 'story_image',
        resourceId: result.id,
        oldValues: {
          userId: result.user_id,
          url: result.url,
          caption: result.caption,
          storyType: result.story_type,
        },
        newValues: null,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // ── Broadcasts ──────────────────────────────────────────────────────────

  async listBroadcasts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
      const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0);
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
      const audience = typeof req.query.audience === 'string' ? req.query.audience.trim() : '';

      const filters: string[] = [];
      const params: unknown[] = [];

      if (search) {
        params.push(`%${search}%`);
        filters.push(`title ILIKE $${params.length}`);
      }
      if (status) {
        params.push(status);
        filters.push(`status = $${params.length}`);
      }
      if (audience) {
        params.push(audience);
        filters.push(`audience = $${params.length}`);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      const countRow = await queryOne<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM admin_broadcasts ${whereClause}`,
        params
      );

      const listParams = [...params, limit, offset];
      const rows = await query<{
        id: string;
        title: string;
        body: string;
        audience: string;
        status: string;
        template_id: string | null;
        scheduled_at: Date | null;
        sent_at: Date | null;
        cancelled_at: Date | null;
        created_by: string | null;
        created_at: Date;
        updated_at: Date;
      }>(
        `SELECT id, title, body, audience, status, template_id, scheduled_at, sent_at, cancelled_at, created_by, created_at, updated_at
         FROM admin_broadcasts
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${listParams.length - 1}
         OFFSET $${listParams.length}`,
        listParams
      );

      res.json({
        total: countRow?.count || 0,
        limit,
        offset,
        broadcasts: rows,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBroadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const row = await queryOne<{
        id: string;
        title: string;
        body: string;
        audience: string;
        status: string;
        template_id: string | null;
        scheduled_at: Date | null;
        sent_at: Date | null;
        cancelled_at: Date | null;
        created_by: string | null;
        created_at: Date;
        updated_at: Date;
      }>(
        `SELECT * FROM admin_broadcasts WHERE id = $1`,
        [String(req.params.id)]
      );
      if (!row) {
        res.status(404).json({ error: 'Broadcast not found' });
        return;
      }
      res.json(row);
    } catch (error) {
      next(error);
    }
  },

  async createBroadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        audience: z.enum(['all', 'client', 'vendor', 'planner', 'newsletter']).optional(),
        status: z.enum(['draft', 'scheduled', 'sent']).optional(),
        scheduledAt: z.string().optional(),
        confirmSend: z.boolean().optional(),
        templateId: z.string().uuid().optional(),
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const status = validation.data.status || 'draft';
      let scheduledAt: string | null = null;
      let sentAt: string | null = null;

      if (status === 'scheduled') {
        if (!validation.data.scheduledAt) {
          res.status(400).json({ error: 'scheduledAt is required when status is scheduled' });
          return;
        }
        const scheduledDate = new Date(validation.data.scheduledAt);
        if (Number.isNaN(scheduledDate.getTime())) {
          res.status(400).json({ error: 'Invalid scheduledAt datetime' });
          return;
        }
        scheduledAt = scheduledDate.toISOString();
      }

      if (status === 'sent') {
        if (!validation.data.confirmSend) {
          res.status(400).json({ error: 'confirmSend is required when status is sent' });
          return;
        }
        sentAt = new Date().toISOString();
      }

      const row = await queryOne(
        `INSERT INTO admin_broadcasts (title, body, audience, status, scheduled_at, sent_at, template_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          validation.data.title,
          validation.data.body,
          validation.data.audience || 'all',
          status,
          scheduledAt,
          sentAt,
          validation.data.templateId || null,
          req.user?.userId || null,
        ]
      );

      if (row) {
        await logAdminAction(req, {
          action: 'admin.broadcast.create',
          resourceType: 'broadcast',
          resourceId: (row as { id: string }).id,
          newValues: { title: validation.data.title, audience: validation.data.audience || 'all', status },
        });
      }

      res.status(201).json(row);
    } catch (error) {
      next(error);
    }
  },

  async updateBroadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const broadcastId = String(req.params.id);
      const existing = await queryOne<{ id: string; status: string; title: string; body: string; audience: string; template_id: string | null; scheduled_at: Date | null }>(
        'SELECT id, status, title, body, audience, template_id, scheduled_at FROM admin_broadcasts WHERE id = $1',
        [broadcastId]
      );
      if (!existing) {
        res.status(404).json({ error: 'Broadcast not found' });
        return;
      }
      if (existing.status !== 'draft' && existing.status !== 'scheduled') {
        res.status(400).json({ error: 'Only draft or scheduled broadcasts can be edited' });
        return;
      }

      const schema = z.object({
        title: z.string().min(1).optional(),
        body: z.string().min(1).optional(),
        audience: z.enum(['all', 'client', 'vendor', 'planner', 'newsletter']).optional(),
        status: z.enum(['draft', 'scheduled', 'sent']).optional(),
        scheduledAt: z.string().optional(),
        confirmSend: z.boolean().optional(),
        templateId: z.string().uuid().nullable().optional(),
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;
      const d = validation.data;

      if (d.title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(d.title); }
      if (d.body !== undefined) { fields.push(`body = $${paramIndex++}`); values.push(d.body); }
      if (d.audience !== undefined) { fields.push(`audience = $${paramIndex++}`); values.push(d.audience); }
      if (d.templateId !== undefined) { fields.push(`template_id = $${paramIndex++}`); values.push(d.templateId); }

      if (d.status !== undefined) {
        let sentAt: string | null = null;
        let scheduledAt: string | null = null;

        if (d.status === 'sent') {
          if (!d.confirmSend) {
            res.status(400).json({ error: 'confirmSend is required when status is sent' });
            return;
          }
          sentAt = new Date().toISOString();
          fields.push(`sent_at = $${paramIndex++}`);
          values.push(sentAt);
        }
        if (d.status === 'scheduled') {
          if (!d.scheduledAt) {
            res.status(400).json({ error: 'scheduledAt is required when status is scheduled' });
            return;
          }
          const parsed = new Date(d.scheduledAt);
          if (Number.isNaN(parsed.getTime())) {
            res.status(400).json({ error: 'Invalid scheduledAt datetime' });
            return;
          }
          scheduledAt = parsed.toISOString();
          fields.push(`scheduled_at = $${paramIndex++}`);
          values.push(scheduledAt);
        }

        fields.push(`status = $${paramIndex++}`);
        values.push(d.status);
      } else if (d.scheduledAt !== undefined) {
        const parsed = new Date(d.scheduledAt);
        if (!Number.isNaN(parsed.getTime())) {
          fields.push(`scheduled_at = $${paramIndex++}`);
          values.push(parsed.toISOString());
        }
      }

      if (fields.length === 0) {
        res.status(400).json({ error: 'No updates provided' });
        return;
      }

      fields.push('updated_at = NOW()');
      values.push(broadcastId);

      const updated = await queryOne(
        `UPDATE admin_broadcasts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      await logAdminAction(req, {
        action: 'admin.broadcast.update',
        resourceType: 'broadcast',
        resourceId: broadcastId,
        oldValues: { title: existing.title, status: existing.status, audience: existing.audience },
        newValues: d,
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteBroadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const broadcastId = String(req.params.id);
      const existing = await queryOne<{ id: string; status: string; title: string }>(
        'SELECT id, status, title FROM admin_broadcasts WHERE id = $1',
        [broadcastId]
      );
      if (!existing) {
        res.status(404).json({ error: 'Broadcast not found' });
        return;
      }
      if (existing.status !== 'draft') {
        res.status(400).json({ error: 'Only draft broadcasts can be deleted' });
        return;
      }

      await query('DELETE FROM admin_broadcasts WHERE id = $1', [broadcastId]);

      await logAdminAction(req, {
        action: 'admin.broadcast.delete',
        resourceType: 'broadcast',
        resourceId: broadcastId,
        oldValues: { title: existing.title, status: existing.status },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async cancelBroadcast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const broadcastId = String(req.params.id);
      const existing = await queryOne<{ id: string; status: string; title: string }>(
        'SELECT id, status, title FROM admin_broadcasts WHERE id = $1',
        [broadcastId]
      );
      if (!existing) {
        res.status(404).json({ error: 'Broadcast not found' });
        return;
      }
      if (existing.status !== 'scheduled') {
        res.status(400).json({ error: 'Only scheduled broadcasts can be cancelled' });
        return;
      }

      const updated = await queryOne(
        `UPDATE admin_broadcasts SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
        [broadcastId]
      );

      await logAdminAction(req, {
        action: 'admin.broadcast.cancel',
        resourceType: 'broadcast',
        resourceId: broadcastId,
        oldValues: { status: 'scheduled' },
        newValues: { status: 'cancelled' },
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  // ── Templates ─────────────────────────────────────────────────────────

  async listTemplates(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await query(
        `SELECT id, name, subject, body, channel, created_at, updated_at
         FROM notification_templates
         ORDER BY created_at DESC`
      );
      res.json(rows);
    } catch (error) {
      next(error);
    }
  },

  async getTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const row = await queryOne(
        `SELECT * FROM notification_templates WHERE id = $1`,
        [String(req.params.id)]
      );
      if (!row) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }
      res.json(row);
    } catch (error) {
      next(error);
    }
  },

  async createTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        name: z.string().min(1),
        subject: z.string().optional(),
        body: z.string().min(1),
        channel: z.enum(['email', 'sms', 'inapp']).optional(),
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const row = await queryOne<{ id: string; name: string; subject: string | null; channel: string }>(
        `INSERT INTO notification_templates (name, subject, body, channel)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          validation.data.name,
          validation.data.subject || null,
          validation.data.body,
          validation.data.channel || 'email',
        ]
      );

      if (row) {
        await logAdminAction(req, {
          action: 'admin.template.create',
          resourceType: 'notification_template',
          resourceId: row.id,
          newValues: { name: row.name, subject: row.subject, channel: row.channel },
        });
      }

      res.status(201).json(row);
    } catch (error) {
      next(error);
    }
  },

  async updateTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = String(req.params.id);
      const existing = await queryOne<{ id: string; name: string; subject: string | null; body: string; channel: string }>(
        'SELECT id, name, subject, body, channel FROM notification_templates WHERE id = $1',
        [templateId]
      );
      if (!existing) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      const schema = z.object({
        name: z.string().min(1).optional(),
        subject: z.string().optional(),
        body: z.string().min(1).optional(),
        channel: z.enum(['email', 'sms', 'inapp']).optional(),
      });
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;
      const d = validation.data;

      if (d.name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(d.name); }
      if (d.subject !== undefined) { fields.push(`subject = $${paramIndex++}`); values.push(d.subject || null); }
      if (d.body !== undefined) { fields.push(`body = $${paramIndex++}`); values.push(d.body); }
      if (d.channel !== undefined) { fields.push(`channel = $${paramIndex++}`); values.push(d.channel); }

      if (fields.length === 0) {
        res.status(400).json({ error: 'No updates provided' });
        return;
      }

      fields.push('updated_at = NOW()');
      values.push(templateId);

      const updated = await queryOne(
        `UPDATE notification_templates SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      await logAdminAction(req, {
        action: 'admin.template.update',
        resourceType: 'notification_template',
        resourceId: templateId,
        oldValues: { name: existing.name, subject: existing.subject, channel: existing.channel },
        newValues: d,
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = String(req.params.id);
      const existing = await queryOne<{ id: string; name: string }>(
        'SELECT id, name FROM notification_templates WHERE id = $1',
        [templateId]
      );
      if (!existing) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      await query('DELETE FROM notification_templates WHERE id = $1', [templateId]);

      await logAdminAction(req, {
        action: 'admin.template.delete',
        resourceType: 'notification_template',
        resourceId: templateId,
        oldValues: { name: existing.name },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // ── Subscribers ───────────────────────────────────────────────────────

  async listSubscribers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || '50'), 10), 100);
      const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0);
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

      const params: unknown[] = [];
      let whereClause = '';

      if (search) {
        params.push(`%${search}%`);
        whereClause = `WHERE email ILIKE $1 OR name ILIKE $1`;
      }

      const countRow = await queryOne<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM newsletter_subscribers ${whereClause}`,
        params
      );

      const listParams = [...params, limit, offset];
      const subscribers = await query<{
        id: string;
        email: string;
        name: string | null;
        source: string | null;
        is_active: boolean;
        subscribed_at: Date;
        updated_at: Date;
      }>(
        `SELECT id, email, name, source, is_active, subscribed_at, updated_at
         FROM newsletter_subscribers
         ${whereClause}
         ORDER BY subscribed_at DESC
         LIMIT $${listParams.length - 1}
         OFFSET $${listParams.length}`,
        listParams
      );

      res.json({
        total: countRow?.count || 0,
        limit,
        offset,
        subscribers,
      });
    } catch (error) {
      next(error);
    }
  },

  async activateSubscriber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscriberId = String(req.params.id);
      const updated = await queryOne<{ id: string; is_active: boolean }>(
        `UPDATE newsletter_subscribers SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING id, is_active`,
        [subscriberId]
      );
      if (!updated) {
        res.status(404).json({ error: 'Subscriber not found' });
        return;
      }

      await logAdminAction(req, {
        action: 'admin.subscriber.activate',
        resourceType: 'newsletter_subscriber',
        resourceId: subscriberId,
        oldValues: { isActive: false },
        newValues: { isActive: true },
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async deactivateSubscriber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscriberId = String(req.params.id);
      const updated = await queryOne<{ id: string; is_active: boolean }>(
        `UPDATE newsletter_subscribers SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, is_active`,
        [subscriberId]
      );
      if (!updated) {
        res.status(404).json({ error: 'Subscriber not found' });
        return;
      }

      await logAdminAction(req, {
        action: 'admin.subscriber.deactivate',
        resourceType: 'newsletter_subscriber',
        resourceId: subscriberId,
        oldValues: { isActive: true },
        newValues: { isActive: false },
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  async listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(String(req.query.limit || '50'), 10), 100);
      const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0);
      const action = typeof req.query.action === 'string' ? req.query.action.trim() : '';

      const params: unknown[] = [];
      let whereClause = '';

      if (action) {
        params.push(action);
        whereClause = `WHERE action = $1`;
      }

      const countRow = await queryOne<{ count: number }>(
        `SELECT COUNT(*)::int AS count
         FROM audit_logs
         ${whereClause}`,
        params
      );

      const listParams = [...params, limit, offset];
      const logs = await query<{
        id: string;
        user_id: string | null;
        actor_name: string | null;
        actor_email: string | null;
        action: string;
        resource_type: string | null;
        resource_id: string | null;
        old_values: unknown;
        new_values: unknown;
        ip_address: string | null;
        user_agent: string | null;
        created_at: Date;
      }>(
        `SELECT al.id, al.user_id, u.name AS actor_name, u.email AS actor_email,
                al.action, al.resource_type, al.resource_id, al.old_values, al.new_values,
                al.ip_address, al.user_agent, al.created_at
         FROM audit_logs al
         LEFT JOIN users u ON u.id = al.user_id
         ${whereClause ? whereClause.replace(/\baction\b/, 'al.action') : ''}
         ORDER BY al.created_at DESC
         LIMIT $${listParams.length - 1}
         OFFSET $${listParams.length}`,
        listParams
      );

      res.json({
        total: countRow?.count || 0,
        limit,
        offset,
        logs: logs.map((log) => ({
          ...log,
          actor_name: log.actor_name,
          actor_email: log.actor_email,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  // ========== APPROVALS ==========

  async listPendingApprovals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await query<{
        id: string; name: string | null; email: string | null; phone: string | null;
        user_type: string; business_name: string | null; instagram_handle: string | null;
        whatsapp_phone: string | null; city: string | null; created_at: Date;
      }>(
        `SELECT id, name, email, phone, user_type, business_name, instagram_handle,
                whatsapp_phone, city, created_at
         FROM users
         WHERE approval_status = 'pending' AND user_type IN ('vendor', 'planner')
         ORDER BY created_at ASC`
      );
      res.json(users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        userType: u.user_type,
        businessName: u.business_name,
        instagramHandle: u.instagram_handle,
        whatsappPhone: u.whatsapp_phone,
        city: u.city,
        createdAt: u.created_at,
      })));
    } catch (error) {
      next(error);
    }
  },

  async approveUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await query(
        `UPDATE users SET approval_status = 'approved', approved_at = NOW(), approved_by = $2 WHERE id = $1`,
        [id, req.user!.userId]
      );
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async rejectUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      await query(
        `UPDATE users SET approval_status = 'rejected', rejection_reason = $2 WHERE id = $1`,
        [id, reason || null]
      );
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

};
