import 'dotenv/config';
import pg from 'pg';

const url = process.env.DATABASE_URL || 'postgres://tracker:tracker@localhost:5432/tracker';
const remote = !/localhost|127\.0\.0\.1/.test(url);

export const pool = new pg.Pool({
  connectionString: url,
  ssl: remote ? { rejectUnauthorized: false } : false,
});