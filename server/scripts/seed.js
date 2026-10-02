// Usage: npm run seed          (creates tables, loads plan if the table is empty)
//        npm run seed:reset    (wipes questions and reloads from data/plan.json)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const schema = fs.readFileSync(path.join(here, '../schema.sql'), 'utf8');
const plan = JSON.parse(fs.readFileSync(path.join(here, '../data/plan.json'), 'utf8'));
const reset = process.argv.includes('--reset');

// Most recent Wednesday = Day 1 by default (change it in the app's Settings)
function lastWednesday() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() - 3 + 7) % 7));
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(schema);
  if (reset) await client.query('TRUNCATE questions RESTART IDENTITY');
  const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM questions');
  if (rows[0].n > 0) {
    console.log(`questions table already has ${rows[0].n} rows – skipping (use --reset to reload).`);
  } else {
    for (const q of plan) {
      await client.query(
        `INSERT INTO questions (sprint, day, position, title, topic, completed, completed_at)
         VALUES ($1,$2,$3,$4,$5,$6, CASE WHEN $6 THEN now() END)`,
        [q.sprint, q.day, q.position, q.title, q.topic, q.completed]);
    }
    console.log(`Inserted ${plan.length} questions.`);
  }
  await client.query(
    `INSERT INTO settings (key, value) VALUES ('start_date', $1) ON CONFLICT (key) DO NOTHING`,
    [lastWednesday()]);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  console.error(e);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
