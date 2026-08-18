import { Pool, types } from 'pg';
import { env } from './env.js';

// A SQL DATE carries no time and no timezone, but node-postgres parses it into
// a JS Date at *local* midnight. Serialised to JSON that becomes the previous
// day for anyone east of UTC — a wedding on the 1st reads as the 30th. Hand
// DATE columns back as plain 'YYYY-MM-DD' strings instead.
// 1082 = DATE. TIMESTAMP/TIMESTAMPTZ keep their normal Date parsing.
types.setTypeParser(1082, (value: string) => value);

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on PostgreSQL client', err);
  process.exit(-1);
});

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const result = await pool.query(text, params);
  return (result.rows[0] as T) || null;
}
