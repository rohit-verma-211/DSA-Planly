import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const asyncRoute = (fn) => (req, res) => fn(req, res).catch((e) => {
  console.error(e);
  res.status(500).json({ error: 'Server error' });
});

// Everything the UI needs in one request (~900 rows is tiny).
app.get('/api/plan', asyncRoute(async (_req, res) => {
  const q = await pool.query('SELECT * FROM questions ORDER BY sprint, day, position, id');
  const s = await pool.query('SELECT key, value FROM settings');
  const settings = Object.fromEntries(s.rows.map((r) => [r.key, r.value]));
  res.json({ questions: q.rows, settings });
}));

// Update one question: completed, bookmarked, notes, links, title
const EDITABLE = ['completed', 'bookmarked', 'notes', 'lc_url', 'gfg_url', 'yt_url', 'title'];
app.patch('/api/questions/:id', asyncRoute(async (req, res) => {
  const sets = [];
  const vals = [];
  for (const key of EDITABLE) {
    if (!(key in req.body)) continue;
    let v = req.body[key];
    if (['lc_url', 'gfg_url', 'yt_url'].includes(key)) v = v && String(v).trim() ? String(v).trim() : null;
    vals.push(v);
    sets.push(`${key} = $${vals.length}`);
    if (key === 'completed') sets.push(`completed_at = ${v ? 'now()' : 'NULL'}`);
  }
  if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });
  vals.push(req.params.id);
  const r = await pool.query(
    `UPDATE questions SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`, vals);
  if (!r.rowCount) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
}));

// Add your own extra question to a day
app.post('/api/questions', asyncRoute(async (req, res) => {
  const { sprint, day, title, topic = 'DSA', lc_url = null, gfg_url = null } = req.body;
  if (!sprint || !day || !title?.trim()) return res.status(400).json({ error: 'sprint, day and title are required' });
  const pos = await pool.query(
    'SELECT COALESCE(MAX(position), 0) + 1 AS p FROM questions WHERE sprint = $1 AND day = $2', [sprint, day]);
  const r = await pool.query(
    `INSERT INTO questions (sprint, day, position, title, topic, lc_url, gfg_url, is_custom)
     VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE) RETURNING *`,
    [sprint, day, pos.rows[0].p, title.trim(), topic, lc_url || null, gfg_url || null]);
  res.status(201).json(r.rows[0]);
}));

app.delete('/api/questions/:id', asyncRoute(async (req, res) => {
  await pool.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
  res.status(204).end();
}));

// Day 1 of your plan (a Wednesday)
app.put('/api/settings/start_date', asyncRoute(async (req, res) => {
  const v = String(req.body.value || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return res.status(400).json({ error: 'Use YYYY-MM-DD' });
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('start_date', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [v]);
  res.json({ start_date: v });
}));

// In production, serve the built React app from the same server
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
