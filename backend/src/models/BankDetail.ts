import { query, queryOne } from '../config/database.js';

export interface BankDetail {
  id: string;
  user_id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  sort_code: string | null;
  iban: string | null;
  swift: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBankDetailInput {
  bank_name: string;
  account_name: string;
  account_number: string;
  sort_code?: string | null;
  iban?: string | null;
  swift?: string | null;
  description?: string | null;
}

export interface UpdateBankDetailInput {
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  sort_code?: string | null;
  iban?: string | null;
  swift?: string | null;
  description?: string | null;
}

export const BankDetailModel = {
  async listByUserId(userId: string): Promise<BankDetail[]> {
    return query<BankDetail>(
      'SELECT * FROM bank_details WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
  },

  async create(userId: string, input: CreateBankDetailInput): Promise<BankDetail> {
    const result = await queryOne<BankDetail>(
      `INSERT INTO bank_details (user_id, bank_name, account_name, account_number, sort_code, iban, swift, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        input.bank_name,
        input.account_name,
        input.account_number,
        input.sort_code || null,
        input.iban || null,
        input.swift || null,
        input.description || null,
      ]
    );

    if (!result) {
      throw new Error('Failed to create bank detail');
    }

    return result;
  },

  async update(userId: string, id: string, input: UpdateBankDetailInput): Promise<BankDetail | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const addField = (column: string, value: unknown) => {
      fields.push(`${column} = $${paramIndex++}`);
      values.push(value);
    };

    if (input.bank_name !== undefined) addField('bank_name', input.bank_name);
    if (input.account_name !== undefined) addField('account_name', input.account_name);
    if (input.account_number !== undefined) addField('account_number', input.account_number);
    if (input.sort_code !== undefined) addField('sort_code', input.sort_code);
    if (input.iban !== undefined) addField('iban', input.iban);
    if (input.swift !== undefined) addField('swift', input.swift);
    if (input.description !== undefined) addField('description', input.description);

    if (fields.length === 0) {
      return queryOne<BankDetail>(
        'SELECT * FROM bank_details WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
    }

    fields.push('updated_at = NOW()');
    values.push(id, userId);

    return queryOne<BankDetail>(
      `UPDATE bank_details SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM bank_details WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.length > 0;
  },
};
