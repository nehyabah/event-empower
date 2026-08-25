import { query, queryOne } from '../config/database.js';

export type EventType = 'meeting' | 'visit' | 'rehearsal' | 'wedding' | 'consultation' | 'other';

export interface PlannerEvent {
  id: string;
  planner_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  event_date: Date;
  start_time: string | null;
  end_time: string | null;
  event_type: EventType;
  location: string | null;
  /** When true the linked client sees this entry on their own calendar. */
  visible_to_client: boolean;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  client_name?: string;
  planner_name?: string;
}

export interface CreatePlannerEventInput {
  planner_id: string;
  client_id?: string;
  title: string;
  description?: string;
  event_date: Date | string;
  start_time?: string;
  end_time?: string;
  event_type?: EventType;
  location?: string;
  visible_to_client?: boolean;
}

export interface UpdatePlannerEventInput {
  client_id?: string | null;
  title?: string;
  description?: string | null;
  event_date?: Date | string;
  start_time?: string | null;
  end_time?: string | null;
  event_type?: EventType;
  location?: string | null;
  visible_to_client?: boolean;
}

export const PlannerEventModel = {
  async findById(id: string): Promise<PlannerEvent | null> {
    return queryOne<PlannerEvent>(
      `SELECT e.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_events e
       LEFT JOIN planner_clients c ON e.client_id = c.id
       WHERE e.id = $1`,
      [id]
    );
  },

  async findByPlannerId(plannerId: string): Promise<PlannerEvent[]> {
    return query<PlannerEvent>(
      `SELECT e.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_events e
       LEFT JOIN planner_clients c ON e.client_id = c.id
       WHERE e.planner_id = $1
       ORDER BY e.event_date ASC, e.start_time ASC NULLS LAST`,
      [plannerId]
    );
  },

  async findByPlannerIdAndDateRange(plannerId: string, startDate: Date | string, endDate: Date | string): Promise<PlannerEvent[]> {
    return query<PlannerEvent>(
      `SELECT e.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_events e
       LEFT JOIN planner_clients c ON e.client_id = c.id
       WHERE e.planner_id = $1 AND e.event_date >= $2 AND e.event_date <= $3
       ORDER BY e.event_date ASC, e.start_time ASC NULLS LAST`,
      [plannerId, startDate, endDate]
    );
  },

  async findByClientId(clientId: string): Promise<PlannerEvent[]> {
    return query<PlannerEvent>(
      `SELECT e.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_events e
       LEFT JOIN planner_clients c ON e.client_id = c.id
       WHERE e.client_id = $1
       ORDER BY e.event_date ASC`,
      [clientId]
    );
  },

  /**
   * Planner entries that should appear on a client's own calendar, resolved
   * from the client's user id through their planner_clients link.
   */
  async findVisibleForClientUser(userId: string): Promise<PlannerEvent[]> {
    return query<PlannerEvent>(
      `SELECT e.*,
              CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name,
              u.name AS planner_name
       FROM planner_events e
       JOIN planner_clients c ON e.client_id = c.id
       LEFT JOIN users u ON u.id = e.planner_id
       WHERE c.user_id = $1
         AND c.invite_status = 'accepted'
         AND e.visible_to_client = TRUE
       ORDER BY e.event_date ASC, e.start_time ASC NULLS LAST`,
      [userId]
    );
  },

  async findUpcoming(plannerId: string, limit: number = 10): Promise<PlannerEvent[]> {
    return query<PlannerEvent>(
      `SELECT e.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_events e
       LEFT JOIN planner_clients c ON e.client_id = c.id
       WHERE e.planner_id = $1 AND e.event_date >= CURRENT_DATE
       ORDER BY e.event_date ASC, e.start_time ASC NULLS LAST
       LIMIT $2`,
      [plannerId, limit]
    );
  },

  async create(input: CreatePlannerEventInput): Promise<PlannerEvent> {
    const result = await queryOne<PlannerEvent>(
      `INSERT INTO planner_events (planner_id, client_id, title, description, event_date, start_time, end_time, event_type, location, visible_to_client)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        input.planner_id,
        input.client_id || null,
        input.title,
        input.description || null,
        input.event_date,
        input.start_time || null,
        input.end_time || null,
        input.event_type || 'meeting',
        input.location || null,
        input.visible_to_client ?? true,
      ]
    );

    if (!result) {
      throw new Error('Failed to create planner event');
    }

    return result;
  },

  async update(id: string, input: UpdatePlannerEventInput): Promise<PlannerEvent | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.client_id !== undefined) {
      fields.push(`client_id = $${paramIndex++}`);
      values.push(input.client_id || null);
    }
    if (input.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(input.title);
    }
    if (input.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(input.description || null);
    }
    if (input.event_date !== undefined) {
      fields.push(`event_date = $${paramIndex++}`);
      values.push(input.event_date);
    }
    if (input.start_time !== undefined) {
      fields.push(`start_time = $${paramIndex++}`);
      values.push(input.start_time || null);
    }
    if (input.end_time !== undefined) {
      fields.push(`end_time = $${paramIndex++}`);
      values.push(input.end_time || null);
    }
    if (input.event_type !== undefined) {
      fields.push(`event_type = $${paramIndex++}`);
      values.push(input.event_type);
    }
    if (input.location !== undefined) {
      fields.push(`location = $${paramIndex++}`);
      values.push(input.location || null);
    }
    if (input.visible_to_client !== undefined) {
      fields.push(`visible_to_client = $${paramIndex++}`);
      values.push(input.visible_to_client);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<PlannerEvent>(
      `UPDATE planner_events SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM planner_events WHERE id = $1 RETURNING id',
      [id]
    );
    return result.length > 0;
  },

  async countByPlannerId(plannerId: string): Promise<{ total: number; upcoming: number; thisWeek: number; thisMonth: number }> {
    const result = await queryOne<{ total: string; upcoming: string; this_week: string; this_month: string }>(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE event_date >= CURRENT_DATE) as upcoming,
        COUNT(*) FILTER (WHERE event_date >= CURRENT_DATE AND event_date <= CURRENT_DATE + INTERVAL '7 days') as this_week,
        COUNT(*) FILTER (WHERE event_date >= CURRENT_DATE AND event_date <= CURRENT_DATE + INTERVAL '30 days') as this_month
       FROM planner_events WHERE planner_id = $1`,
      [plannerId]
    );

    return {
      total: parseInt(result?.total || '0'),
      upcoming: parseInt(result?.upcoming || '0'),
      thisWeek: parseInt(result?.this_week || '0'),
      thisMonth: parseInt(result?.this_month || '0'),
    };
  },
};
