import { query, queryOne } from '../config/database.js';

export type ExpenseCategory =
  | 'venue'
  | 'catering'
  | 'attire'
  | 'decoration'
  | 'photography'
  | 'music'
  | 'transportation'
  | 'accommodation'
  | 'invitations'
  | 'rings'
  | 'gifts'
  | 'beauty'
  | 'other';

export interface Expense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  amount_paid: number;
  category: ExpenseCategory;
  expense_date: Date | null;
  /** When the outstanding balance must be settled. */
  due_date: Date | null;
  paid: boolean;
  notes: string | null;
  vendor_id: string | null;
  /** Resolved from vendor_profiles for display; not a stored column. */
  vendor_name?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateExpenseInput {
  user_id: string;
  name: string;
  amount: number;
  amount_paid?: number;
  category: ExpenseCategory;
  expense_date?: Date | string;
  due_date?: Date | string | null;
  paid?: boolean;
  notes?: string;
  vendor_id?: string;
}

export interface UpdateExpenseInput {
  name?: string;
  amount?: number;
  amount_paid?: number;
  category?: ExpenseCategory;
  expense_date?: Date | string | null;
  due_date?: Date | string | null;
  paid?: boolean;
  notes?: string | null;
  vendor_id?: string | null;
}

export const ExpenseModel = {
  async findById(id: string): Promise<Expense | null> {
    return queryOne<Expense>(
      'SELECT * FROM expenses WHERE id = $1',
      [id]
    );
  },

  async findByUserId(userId: string): Promise<Expense[]> {
    return query<Expense>(
      `SELECT e.*, vp.business_name AS vendor_name
         FROM expenses e
         LEFT JOIN vendor_profiles vp ON vp.id = e.vendor_id
        WHERE e.user_id = $1
        ORDER BY e.expense_date DESC NULLS LAST, e.created_at DESC`,
      [userId]
    );
  },

  async findByUserIdAndCategory(userId: string, category: ExpenseCategory): Promise<Expense[]> {
    return query<Expense>(
      `SELECT e.*, vp.business_name AS vendor_name
         FROM expenses e
         LEFT JOIN vendor_profiles vp ON vp.id = e.vendor_id
        WHERE e.user_id = $1 AND e.category = $2
        ORDER BY e.expense_date DESC NULLS LAST`,
      [userId, category]
    );
  },

  async create(input: CreateExpenseInput): Promise<Expense> {
    const amountPaid = input.amount_paid ?? (input.paid ? input.amount : 0);
    const normalizedPaidAmount = Math.min(Math.max(amountPaid, 0), input.amount);
    const paid = normalizedPaidAmount >= input.amount;
    const result = await queryOne<Expense>(
      `INSERT INTO expenses (user_id, name, amount, amount_paid, category, expense_date, due_date, paid, notes, vendor_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        input.user_id,
        input.name,
        input.amount,
        normalizedPaidAmount,
        input.category,
        input.expense_date || null,
        input.due_date || null,
        paid,
        input.notes || null,
        input.vendor_id || null,
      ]
    );

    if (!result) {
      throw new Error('Failed to create expense');
    }

    return result;
  },

  async update(id: string, input: UpdateExpenseInput): Promise<Expense | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.amount !== undefined) {
      fields.push(`amount = $${paramIndex++}`);
      values.push(input.amount);
    }
    if (input.amount_paid !== undefined) {
      fields.push(`amount_paid = $${paramIndex++}`);
      values.push(input.amount_paid);
    }
    if (input.category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.expense_date !== undefined) {
      fields.push(`expense_date = $${paramIndex++}`);
      values.push(input.expense_date || null);
    }
    if (input.due_date !== undefined) {
      fields.push(`due_date = $${paramIndex++}`);
      values.push(input.due_date || null);
    }
    if (input.paid !== undefined) {
      fields.push(`paid = $${paramIndex++}`);
      values.push(input.paid);
    }
    if (input.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(input.notes || null);
    }
    if (input.vendor_id !== undefined) {
      fields.push(`vendor_id = $${paramIndex++}`);
      values.push(input.vendor_id || null);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<Expense>(
      `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM expenses WHERE id = $1 RETURNING id',
      [id]
    );
    return result.length > 0;
  },

  async getSummaryByUserId(userId: string): Promise<{
    total_spent: number;
    total_paid: number;
    total_unpaid: number;
    total_committed: number;
    overdue_total: number;
    overdue_count: number;
    due_soon_total: number;
    next_due: { id: string; name: string; due_date: string; balance: number } | null;
    by_category: Record<string, number>;
  }> {
    const totals = await queryOne<{
      total_spent: string; total_paid: string; total_unpaid: string; total_committed: string;
      overdue_total: string; overdue_count: string; due_soon_total: string;
    }>(
      `SELECT
        COALESCE(SUM(amount_paid), 0) as total_spent,
        COALESCE(SUM(amount_paid), 0) as total_paid,
        COALESCE(SUM(amount - amount_paid), 0) as total_unpaid,
        COALESCE(SUM(amount), 0) as total_committed,
        -- Balances whose due date has already passed.
        COALESCE(SUM(amount - amount_paid) FILTER (
          WHERE due_date IS NOT NULL AND due_date < CURRENT_DATE AND amount_paid < amount
        ), 0) as overdue_total,
        COUNT(*) FILTER (
          WHERE due_date IS NOT NULL AND due_date < CURRENT_DATE AND amount_paid < amount
        ) as overdue_count,
        -- Balances falling due within the next 30 days.
        COALESCE(SUM(amount - amount_paid) FILTER (
          WHERE due_date IS NOT NULL
            AND due_date >= CURRENT_DATE
            AND due_date <= CURRENT_DATE + INTERVAL '30 days'
            AND amount_paid < amount
        ), 0) as due_soon_total
       FROM expenses WHERE user_id = $1`,
      [userId]
    );

    const nextDue = await queryOne<{ id: string; name: string; due_date: string; balance: string }>(
      `SELECT id, name, due_date, (amount - amount_paid) AS balance
       FROM expenses
       WHERE user_id = $1 AND due_date IS NOT NULL AND amount_paid < amount
       ORDER BY due_date ASC
       LIMIT 1`,
      [userId]
    );

    const byCategory = await query<{ category: string; total: string }>(
      `SELECT category, COALESCE(SUM(amount), 0) as total
       FROM expenses WHERE user_id = $1
       GROUP BY category`,
      [userId]
    );

    const categoryTotals: Record<string, number> = {};
    byCategory.forEach(row => {
      categoryTotals[row.category] = parseFloat(row.total);
    });

    return {
      total_spent: parseFloat(totals?.total_spent || '0'),
      total_paid: parseFloat(totals?.total_paid || '0'),
      total_unpaid: parseFloat(totals?.total_unpaid || '0'),
      total_committed: parseFloat(totals?.total_committed || '0'),
      overdue_total: parseFloat(totals?.overdue_total || '0'),
      overdue_count: parseInt(totals?.overdue_count || '0', 10),
      due_soon_total: parseFloat(totals?.due_soon_total || '0'),
      next_due: nextDue
        ? {
            id: nextDue.id,
            name: nextDue.name,
            due_date: String(nextDue.due_date).split('T')[0],
            balance: parseFloat(nextDue.balance),
          }
        : null,
      by_category: categoryTotals,
    };
  },
};
