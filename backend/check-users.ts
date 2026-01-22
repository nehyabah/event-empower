import { pool } from './src/config/database.js';

async function checkUsers() {
  const result = await pool.query('SELECT id, email, name, user_type FROM users');
  console.log(JSON.stringify(result.rows, null, 2));
  await pool.end();
}

checkUsers();
