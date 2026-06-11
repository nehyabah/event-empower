import { query, queryOne } from '../config/database.js';

export interface UserEvent {
  id: string;
  user_id: string;
  planner_id: string | null;
  partner1_name: string | null;
  partner2_name: string | null;
  event_date: Date | null;
  venue: string | null;
  total_budget: number;
  guest_count_estimate: number;
  notes: string | null;
  rsvp_code: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserEventInput {
  user_id: string;
  partner1_name?: string;
  partner2_name?: string;
  event_date?: Date | string;
  venue?: string;
  total_budget?: number;
  guest_count_estimate?: number;
  notes?: string;
}

export interface UpdateUserEventInput {
  partner1_name?: string;
  partner2_name?: string;
  event_date?: Date | string | null;
  venue?: string | null;
  total_budget?: number;
  guest_count_estimate?: number;
  notes?: string | null;
}

export const UserEventModel = {
  async findById(id: string): Promise<UserEvent | null> {
    return queryOne<UserEvent>(
      'SELECT * FROM user_events WHERE id = $1',
      [id]
    );
  },

  async findByUserId(userId: string): Promise<UserEvent | null> {
    return queryOne<UserEvent>(
      'SELECT * FROM user_events WHERE user_id = $1',
      [userId]
    );
  },

  async findByRsvpCode(rsvpCode: string): Promise<UserEvent | null> {
    return queryOne<UserEvent>(
      'SELECT * FROM user_events WHERE rsvp_code = $1',
      [rsvpCode.toUpperCase()]
    );
  },

  async create(input: CreateUserEventInput): Promise<UserEvent> {
    // Generate a random 8-character RSVP code
    const rsvpCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const result = await queryOne<UserEvent>(
      `INSERT INTO user_events (user_id, partner1_name, partner2_name, event_date, venue, total_budget, guest_count_estimate, notes, rsvp_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        input.user_id,
        input.partner1_name || null,
        input.partner2_name || null,
        input.event_date || null,
        input.venue || null,
        input.total_budget || 0,
        input.guest_count_estimate || 0,
        input.notes || null,
        rsvpCode,
      ]
    );

    if (!result) {
      throw new Error('Failed to create user event');
    }

    return result;
  },

  async update(userId: string, input: UpdateUserEventInput): Promise<UserEvent | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.partner1_name !== undefined) {
      fields.push(`partner1_name = $${paramIndex++}`);
      values.push(input.partner1_name || null);
    }
    if (input.partner2_name !== undefined) {
      fields.push(`partner2_name = $${paramIndex++}`);
      values.push(input.partner2_name || null);
    }
    if (input.event_date !== undefined) {
      fields.push(`event_date = $${paramIndex++}`);
      values.push(input.event_date || null);
    }
    if (input.venue !== undefined) {
      fields.push(`venue = $${paramIndex++}`);
      values.push(input.venue || null);
    }
    if (input.total_budget !== undefined) {
      fields.push(`total_budget = $${paramIndex++}`);
      values.push(input.total_budget);
    }
    if (input.guest_count_estimate !== undefined) {
      fields.push(`guest_count_estimate = $${paramIndex++}`);
      values.push(input.guest_count_estimate);
    }
    if (input.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(input.notes || null);
    }

    if (fields.length === 0) {
      return this.findByUserId(userId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    return queryOne<UserEvent>(
      `UPDATE user_events SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async upsert(input: CreateUserEventInput): Promise<UserEvent> {
    const existing = await this.findByUserId(input.user_id);
    if (existing) {
      const updated = await this.update(input.user_id, input);
      return updated!;
    }
    return this.create(input);
  },

  async setPlanner(userId: string, plannerId: string | null): Promise<UserEvent | null> {
    return queryOne<UserEvent>(
      `UPDATE user_events SET planner_id = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *`,
      [plannerId, userId]
    );
  },

  async findByPlannerId(plannerId: string): Promise<UserEvent[]> {
    return query<UserEvent>(
      'SELECT * FROM user_events WHERE planner_id = $1 ORDER BY event_date ASC NULLS LAST',
      [plannerId]
    );
  },

  async delete(userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM user_events WHERE user_id = $1 RETURNING id',
      [userId]
    );
    return result.length > 0;
  },
};
