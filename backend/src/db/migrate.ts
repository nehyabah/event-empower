import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');

  try {
    // Create migrations tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Get list of migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Get already executed migrations
    const result = await pool.query('SELECT name FROM migrations');
    const executed = new Set(result.rows.map((r: { name: string }) => r.name));

    // Run pending migrations
    for (const file of files) {
      if (!executed.has(file)) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

        await pool.query('BEGIN');
        try {
          await pool.query(sql);
          await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await pool.query('COMMIT');
          console.log(`Migration ${file} completed successfully`);
        } catch (err) {
          await pool.query('ROLLBACK');
          throw err;
        }
      }
    }

    console.log('All migrations completed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
