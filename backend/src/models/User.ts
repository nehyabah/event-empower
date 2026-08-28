import { query, queryOne } from '../config/database.js';

export type UserType = 'client' | 'vendor' | 'planner' | 'admin';
export type AuthProvider = 'email' | 'google' | 'phone';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  name: string | null;
  user_type: UserType;
  avatar_url: string | null;
  auth_provider: AuthProvider;
  google_id: string | null;
  is_active: boolean;
  suspended_at: Date | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  approval_status: 'pending' | 'approved' | 'rejected';
  onboarding_submitted_at: Date | string | null;
  business_name: string | null;
  instagram_handle: string | null;
  whatsapp_phone: string | null;
  city: string | null;
  rejection_reason: string | null;
  approved_at: Date | null;
  notify_reminders: boolean;
  notify_product_updates: boolean;
  notify_newsletter: boolean;
}

export interface CreateUserInput {
  email?: string;
  phone?: string;
  password_hash?: string;
  name?: string;
  user_type?: UserType;
  avatar_url?: string;
  auth_provider: AuthProvider;
  google_id?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  business_name?: string;
  instagram_handle?: string;
  whatsapp_phone?: string;
  city?: string;
}

export interface UpdateUserInput {
  email?: string;
  phone?: string;
  name?: string;
  user_type?: UserType;
  avatar_url?: string;
  is_active?: boolean;
  suspended_at?: Date | null;
  deleted_at?: Date | null;
  notify_reminders?: boolean;
  notify_product_updates?: boolean;
  notify_newsletter?: boolean;
}

export const UserModel = {
  async findById(id: string): Promise<User | null> {
    return queryOne<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
  },

  async findByEmail(email: string): Promise<User | null> {
    return queryOne<User>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
  },

  async findByPhone(phone: string): Promise<User | null> {
    return queryOne<User>(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
  },

  async findByGoogleId(googleId: string): Promise<User | null> {
    return queryOne<User>(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
  },

  async create(input: CreateUserInput): Promise<User> {
    const result = await queryOne<User>(
      `INSERT INTO users (email, phone, password_hash, name, user_type, avatar_url, auth_provider, google_id,
        approval_status, business_name, instagram_handle, whatsapp_phone, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        input.email?.toLowerCase() || null,
        input.phone || null,
        input.password_hash || null,
        input.name || null,
        input.user_type || 'client',
        input.avatar_url || null,
        input.auth_provider,
        input.google_id || null,
        input.approval_status || 'approved',
        input.business_name || null,
        input.instagram_handle || null,
        input.whatsapp_phone || null,
        input.city || null,
      ]
    );

    if (!result) {
      throw new Error('Failed to create user');
    }

    return result;
  },

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(input.email?.toLowerCase() || null);
    }
    if (input.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(input.phone || null);
    }
    if (input.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(input.name || null);
    }
    if (input.user_type !== undefined) {
      fields.push(`user_type = $${paramIndex++}`);
      values.push(input.user_type);
    }
    if (input.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramIndex++}`);
      values.push(input.avatar_url || null);
    }
    if (input.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(input.is_active);
    }
    if (input.suspended_at !== undefined) {
      fields.push(`suspended_at = $${paramIndex++}`);
      values.push(input.suspended_at);
    }
    if (input.deleted_at !== undefined) {
      fields.push(`deleted_at = $${paramIndex++}`);
      values.push(input.deleted_at);
    }
    if (input.notify_reminders !== undefined) {
      fields.push(`notify_reminders = $${paramIndex++}`);
      values.push(input.notify_reminders);
    }
    if (input.notify_product_updates !== undefined) {
      fields.push(`notify_product_updates = $${paramIndex++}`);
      values.push(input.notify_product_updates);
    }
    if (input.notify_newsletter !== undefined) {
      fields.push(`notify_newsletter = $${paramIndex++}`);
      values.push(input.notify_newsletter);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return result.length > 0;
  },
};
