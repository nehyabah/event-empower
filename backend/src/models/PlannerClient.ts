import { query, queryOne } from '../config/database.js';

export type ClientStatus = 'active' | 'completed' | 'upcoming' | 'archived';
export type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired' | null;

export interface PlannerClient {
  id: string;
  planner_id: string;
  user_id: string | null;
  event_id: string | null;
  partner1_name: string;
  partner2_name: string;
  email: string;
  phone: string | null;
  event_type: string;
  event_date: Date | null;
  status: ClientStatus;
  budget: number | null;
  venue: string | null;
  guest_count: number | null;
  notes: string | null;
  invite_code: string | null;
  invite_status: InviteStatus;
  invite_sent_at: Date | null;
  invite_accepted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface PlannerLink {
  planner_id: string;
  planner_name: string | null;
  planner_email: string | null;
}

export interface CreatePlannerClientInput {
  planner_id: string;
  user_id?: string | null;
  partner1_name: string;
  partner2_name: string;
  email: string;
  phone?: string;
  event_type?: string;
  event_date?: Date | string;
  status?: ClientStatus;
  budget?: number;
  venue?: string;
  guest_count?: number;
  notes?: string;
  invite_code?: string | null;
  invite_status?: InviteStatus;
  invite_sent_at?: Date | string | null;
  invite_accepted_at?: Date | string | null;
}

export interface UpdatePlannerClientInput {
  user_id?: string | null;
  event_id?: string | null;
  partner1_name?: string;
  partner2_name?: string;
  email?: string;
  phone?: string;
  event_type?: string;
  event_date?: Date | string;
  status?: ClientStatus;
  budget?: number;
  venue?: string;
  guest_count?: number;
  notes?: string;
  invite_code?: string | null;
  invite_status?: InviteStatus;
  invite_sent_at?: Date | string | null;
  invite_accepted_at?: Date | string | null;
}

export const PlannerClientModel = {
  async findById(id: string): Promise<PlannerClient | null> {
    return queryOne<PlannerClient>(
      'SELECT * FROM planner_clients WHERE id = $1',
      [id]
    );
  },

  async findByPlannerId(plannerId: string): Promise<PlannerClient[]> {
    return query<PlannerClient>(
      'SELECT * FROM planner_clients WHERE planner_id = $1 ORDER BY event_date ASC NULLS LAST, created_at DESC',
      [plannerId]
    );
  },

  async findByPlannerIdAndStatus(plannerId: string, status: ClientStatus): Promise<PlannerClient[]> {
    return query<PlannerClient>(
      'SELECT * FROM planner_clients WHERE planner_id = $1 AND status = $2 ORDER BY event_date ASC NULLS LAST',
      [plannerId, status]
    );
  },

  async findByInviteCode(inviteCode: string): Promise<PlannerClient | null> {
    return queryOne<PlannerClient>(
      'SELECT * FROM planner_clients WHERE invite_code = $1',
      [inviteCode]
    );
  },

  async findByUserId(userId: string): Promise<PlannerClient | null> {
    return queryOne<PlannerClient>(
      'SELECT * FROM planner_clients WHERE user_id = $1',
      [userId]
    );
  },

  async findPlannerLinkByUserId(userId: string): Promise<PlannerLink | null> {
    return queryOne<PlannerLink>(
      `SELECT u.id as planner_id, u.name as planner_name, u.email as planner_email
       FROM planner_clients pc
       JOIN users u ON pc.planner_id = u.id
       WHERE pc.user_id = $1
       LIMIT 1`,
      [userId]
    );
  },

  async findActive(plannerId: string, limit: number = 5): Promise<PlannerClient[]> {
    return query<PlannerClient>(
      `SELECT *
       FROM planner_clients
       WHERE planner_id = $1 AND status = 'active'
       ORDER BY event_date ASC NULLS LAST, created_at DESC
       LIMIT $2`,
      [plannerId, limit]
    );
  },

  async findUpcoming(plannerId: string, limit: number = 5): Promise<PlannerClient[]> {
    return query<PlannerClient>(
      `SELECT *
       FROM planner_clients
       WHERE planner_id = $1 AND event_date IS NOT NULL AND event_date >= CURRENT_DATE
       ORDER BY event_date ASC
       LIMIT $2`,
      [plannerId, limit]
    );
  },

  async create(input: CreatePlannerClientInput): Promise<PlannerClient> {
    const result = await queryOne<PlannerClient>(
      `INSERT INTO planner_clients (planner_id, user_id, partner1_name, partner2_name, email, phone, event_type, event_date, status, budget, venue, guest_count, notes, invite_code, invite_status, invite_sent_at, invite_accepted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        input.planner_id,
        input.user_id || null,
        input.partner1_name,
        input.partner2_name,
        input.email,
        input.phone || null,
        input.event_type || 'Wedding',
        input.event_date || null,
        input.status || 'upcoming',
        input.budget || null,
        input.venue || null,
        input.guest_count || null,
        input.notes || null,
        input.invite_code || null,
        input.invite_status || null,
        input.invite_sent_at || null,
        input.invite_accepted_at || null,
      ]
    );

    if (!result) {
      throw new Error('Failed to create planner client');
    }

    return result;
  },

  async update(id: string, input: UpdatePlannerClientInput): Promise<PlannerClient | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.user_id !== undefined) {
      fields.push(`user_id = $${paramIndex++}`);
      values.push(input.user_id || null);
    }
    if (input.event_id !== undefined) {
      fields.push(`event_id = $${paramIndex++}`);
      values.push(input.event_id || null);
    }
    if (input.partner1_name !== undefined) {
      fields.push(`partner1_name = $${paramIndex++}`);
      values.push(input.partner1_name);
    }
    if (input.partner2_name !== undefined) {
      fields.push(`partner2_name = $${paramIndex++}`);
      values.push(input.partner2_name);
    }
    if (input.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(input.email);
    }
    if (input.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(input.phone || null);
    }
    if (input.event_type !== undefined) {
      fields.push(`event_type = $${paramIndex++}`);
      values.push(input.event_type);
    }
    if (input.event_date !== undefined) {
      fields.push(`event_date = $${paramIndex++}`);
      values.push(input.event_date || null);
    }
    if (input.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.budget !== undefined) {
      fields.push(`budget = $${paramIndex++}`);
      values.push(input.budget || null);
    }
    if (input.venue !== undefined) {
      fields.push(`venue = $${paramIndex++}`);
      values.push(input.venue || null);
    }
    if (input.guest_count !== undefined) {
      fields.push(`guest_count = $${paramIndex++}`);
      values.push(input.guest_count || null);
    }
    if (input.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(input.notes || null);
    }
    if (input.invite_code !== undefined) {
      fields.push(`invite_code = $${paramIndex++}`);
      values.push(input.invite_code || null);
    }
    if (input.invite_status !== undefined) {
      fields.push(`invite_status = $${paramIndex++}`);
      values.push(input.invite_status || null);
    }
    if (input.invite_sent_at !== undefined) {
      fields.push(`invite_sent_at = $${paramIndex++}`);
      values.push(input.invite_sent_at || null);
    }
    if (input.invite_accepted_at !== undefined) {
      fields.push(`invite_accepted_at = $${paramIndex++}`);
      values.push(input.invite_accepted_at || null);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<PlannerClient>(
      `UPDATE planner_clients SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM planner_clients WHERE id = $1 RETURNING id',
      [id]
    );
    return result.length > 0;
  },

  async countByPlannerId(plannerId: string): Promise<{ total: number; active: number; upcoming: number; completed: number }> {
    const result = await queryOne<{ total: string; active: string; upcoming: string; completed: string }>(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'upcoming') as upcoming,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
       FROM planner_clients WHERE planner_id = $1`,
      [plannerId]
    );

    return {
      total: parseInt(result?.total || '0'),
      active: parseInt(result?.active || '0'),
      upcoming: parseInt(result?.upcoming || '0'),
      completed: parseInt(result?.completed || '0'),
    };
  },
};
