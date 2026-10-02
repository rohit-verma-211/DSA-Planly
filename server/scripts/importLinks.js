// Bulk-fill direct links from a CSV.
// Usage: npm run links -- path/to/links.csv
// CSV header: title,lc_url,gfg_url,yt_url   (title must match the question title; empty cells are ignored)
import fs from 'node:fs';
import { pool } from '../src/db.js';

const file = process.argv[2];
if (!file) { console.error('Usage: npm run links -- links.csv'); process.exit(1); }

function parseCsvLine(line) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
const header = parseCsvLine(lines.shift()).map((h) => h.toLowerCase());
let updated = 0; let missing = 0;
for (const line of lines) {
  const row = Object.fromEntries(parseCsvLine(line).map((v, i) => [header[i], v]));
  if (!row.title) continue;
  const r = await pool.query(
    `UPDATE questions SET
       lc_url  = COALESCE(NULLIF($2,''), lc_url),
       gfg_url = COALESCE(NULLIF($3,''), gfg_url),
       yt_url  = COALESCE(NULLIF($4,''), yt_url)
     WHERE lower(title) = lower($1)`,
    [row.title, row.lc_url || '', row.gfg_url || '', row.yt_url || '']);
  if (r.rowCount) updated += r.rowCount; else { missing++; console.warn('No match:', row.title); }
}
console.log(`Updated ${updated} questions, ${missing} titles not found.`);
await pool.end();
