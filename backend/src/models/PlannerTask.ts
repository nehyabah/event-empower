import { query, queryOne } from '../config/database.js';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface PlannerTask {
  id: string;
  planner_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  due_date: Date | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  client_name?: string;
}

export interface CreatePlannerTaskInput {
  planner_id: string;
  client_id?: string;
  title: string;
  description?: string;
  due_date?: Date | string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface UpdatePlannerTaskInput {
  client_id?: string | null;
  title?: string;
  description?: string | null;
  due_date?: Date | string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export const PlannerTaskModel = {
  async findById(id: string): Promise<PlannerTask | null> {
    return queryOne<PlannerTask>(
      `SELECT t.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_tasks t
       LEFT JOIN planner_clients c ON t.client_id = c.id
       WHERE t.id = $1`,
      [id]
    );
  },

  async findByPlannerId(plannerId: string): Promise<PlannerTask[]> {
    return query<PlannerTask>(
      `SELECT t.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_tasks t
       LEFT JOIN planner_clients c ON t.client_id = c.id
       WHERE t.planner_id = $1
       ORDER BY
         CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         t.due_date ASC NULLS LAST,
         t.created_at DESC`,
      [plannerId]
    );
  },

  async findByPlannerIdAndStatus(plannerId: string, status: TaskStatus): Promise<PlannerTask[]> {
    return query<PlannerTask>(
      `SELECT t.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_tasks t
       LEFT JOIN planner_clients c ON t.client_id = c.id
       WHERE t.planner_id = $1 AND t.status = $2
       ORDER BY t.due_date ASC NULLS LAST`,
      [plannerId, status]
    );
  },

  async findByClientId(clientId: string): Promise<PlannerTask[]> {
    return query<PlannerTask>(
      `SELECT t.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_tasks t
       LEFT JOIN planner_clients c ON t.client_id = c.id
       WHERE t.client_id = $1
       ORDER BY t.due_date ASC NULLS LAST`,
      [clientId]
    );
  },

  async findOverdue(plannerId: string, limit: number = 5): Promise<PlannerTask[]> {
    return query<PlannerTask>(
      `SELECT t.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_tasks t
       LEFT JOIN planner_clients c ON t.client_id = c.id
       WHERE t.planner_id = $1
         AND t.status != 'completed'
         AND t.due_date IS NOT NULL
         AND t.due_date < CURRENT_DATE
       ORDER BY t.due_date ASC
       LIMIT $2`,
      [plannerId, limit]
    );
  },

  async findDueSoon(plannerId: string, days: number = 7, limit: number = 5): Promise<PlannerTask[]> {
    return query<PlannerTask>(
      `SELECT t.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_tasks t
       LEFT JOIN planner_clients c ON t.client_id = c.id
       WHERE t.planner_id = $1
         AND t.status != 'completed'
         AND t.due_date IS NOT NULL
         AND t.due_date >= CURRENT_DATE
         AND t.due_date <= CURRENT_DATE + ($2 || ' days')::interval
       ORDER BY t.due_date ASC
       LIMIT $3`,
      [plannerId, days, limit]
    );
  },

  async findRecent(plannerId: string, limit: number = 5): Promise<PlannerTask[]> {
    return query<PlannerTask>(
      `SELECT t.*, CONCAT(c.partner1_name, ' & ', c.partner2_name) as client_name
       FROM planner_tasks t
       LEFT JOIN planner_clients c ON t.client_id = c.id
       WHERE t.planner_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2`,
      [plannerId, limit]
    );
  },

  async create(input: CreatePlannerTaskInput): Promise<PlannerTask> {
    const result = await queryOne<PlannerTask>(
      `INSERT INTO planner_tasks (planner_id, client_id, title, description, due_date, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.planner_id,
        input.client_id || null,
        input.title,
        input.description || null,
        input.due_date || null,
        input.status || 'pending',
        input.priority || 'medium',
      ]
    );

    if (!result) {
      throw new Error('Failed to create planner task');
    }

    return result;
  },

  async update(id: string, input: UpdatePlannerTaskInput): Promise<PlannerTask | null> {
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
    if (input.due_date !== undefined) {
      fields.push(`due_date = $${paramIndex++}`);
      values.push(input.due_date || null);
    }
    if (input.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.priority !== undefined) {
      fields.push(`priority = $${paramIndex++}`);
      values.push(input.priority);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<PlannerTask>(
      `UPDATE planner_tasks SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM planner_tasks WHERE id = $1 RETURNING id',
      [id]
    );
    return result.length > 0;
  },

  async countByPlannerId(plannerId: string): Promise<{ total: number; pending: number; inProgress: number; completed: number; highPriority: number }> {
    const result = await queryOne<{ total: string; pending: string; in_progress: string; completed: string; high_priority: string }>(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE priority = 'high' AND status != 'completed') as high_priority
       FROM planner_tasks WHERE planner_id = $1`,
      [plannerId]
    );

    return {
      total: parseInt(result?.total || '0'),
      pending: parseInt(result?.pending || '0'),
      inProgress: parseInt(result?.in_progress || '0'),
      completed: parseInt(result?.completed || '0'),
      highPriority: parseInt(result?.high_priority || '0'),
    };
  },

  async countByClientForPlanner(plannerId: string): Promise<{ client_id: string | null; total: number }[]> {
    const rows = await query<{ client_id: string | null; total: string }>(
      `SELECT client_id, COUNT(*) as total
       FROM planner_tasks
       WHERE planner_id = $1
       GROUP BY client_id`,
      [plannerId]
    );

    return rows.map((row) => ({
      client_id: row.client_id,
      total: parseInt(row.total || "0", 10),
    }));
  },
};
