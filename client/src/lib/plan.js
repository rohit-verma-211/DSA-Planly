export const DAYS = [
  { name: 'Wednesday', short: 'Wed', hours: 2 },
  { name: 'Thursday', short: 'Thu', hours: 5 },
  { name: 'Friday', short: 'Fri', hours: 5 },
  { name: 'Saturday', short: 'Sat', hours: 5 },
  { name: 'Sunday', short: 'Sun', hours: 5 },
  { name: 'Monday', short: 'Mon', hours: 1 },
  { name: 'Tuesday', short: 'Tue', hours: 1 },
];
export const SPRINTS = 13;
export const TOTAL_DAYS = SPRINTS * 7;

export const TOPICS = ['DSA', 'SQL', 'OOP', 'OS', 'CN', 'LLD', 'DBMS'];
export const TOPIC_STYLE = {
  DSA: 'bg-amber-500/15 text-amber-300',
  SQL: 'bg-sky-500/15 text-sky-300',
  OOP: 'bg-rose-500/15 text-rose-300',
  OS: 'bg-violet-500/15 text-violet-300',
  CN: 'bg-teal-500/15 text-teal-300',
  LLD: 'bg-orange-500/15 text-orange-300',
  DBMS: 'bg-lime-500/15 text-lime-300',
};

// ---------- dates (all local time, 'YYYY-MM-DD' strings) ----------
const pad = (n) => String(n).padStart(2, '0');
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const startOfToday = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
export const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/** 0-based index of today inside the 91-day plan (can be <0 or >=91 outside the plan). */
export const todayIndex = (start) => Math.round((startOfToday() - start) / 86400000);
export const locate = (idx) => ({ sprint: Math.floor(idx / 7) + 1, day: (idx % 7) + 1 });
export const dayIndex = (sprint, day) => (sprint - 1) * 7 + (day - 1);
export const dayDate = (start, sprint, day) => addDays(start, dayIndex(sprint, day));

// ---------- grouping & stats ----------
export const keyOf = (sprint, day) => `${sprint}-${day}`;

export function groupByDay(questions) {
  const map = new Map();
  for (const q of questions) {
    const k = keyOf(q.sprint, q.day);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(q);
  }
  return map;
}

export const countDone = (list = []) => list.filter((q) => q.completed).length;
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

export function dayStats(map, sprint, day) {
  const list = map.get(keyOf(sprint, day)) || [];
  const done = countDone(list);
  return { total: list.length, done, complete: list.length > 0 && done === list.length };
}

/** Consecutive fully-completed plan days, ending today (if done) or yesterday. */
export function streak(map, tIdx) {
  let idx = Math.min(tIdx, TOTAL_DAYS - 1);
  if (idx < 0) return 0;
  const at = (i) => { const { sprint, day } = locate(i); return dayStats(map, sprint, day); };
  if (!at(idx).complete) idx -= 1;
  let n = 0;
  while (idx >= 0 && at(idx).complete) { n++; idx--; }
  return n;
}

// ---------- links ----------
const enc = encodeURIComponent;
export const isCode = (q) => q.topic === 'DSA' || q.topic === 'SQL';

/** direct=false means "search link until you paste the real one". */
export function getLinks(q) {
  const code = isCode(q);
  const lc = q.lc_url
    ? { url: q.lc_url, direct: true }
    : code ? { url: `https://leetcode.com/problemset/?search=${enc(q.title)}`, direct: false } : null;
  const gfg = q.gfg_url
    ? { url: q.gfg_url, direct: true }
    : code ? { url: `https://www.google.com/search?q=${enc(`${q.title} site:geeksforgeeks.org`)}`, direct: false } : null;
  const yt = q.yt_url
    ? { url: q.yt_url, direct: true }
    : { url: `https://www.youtube.com/results?search_query=${enc(code ? `${q.title} ${q.topic === 'SQL' ? 'sql' : ''} solution` : `${q.title} ${q.topic}`)}`, direct: false };
  const web = !code ? { url: `https://www.google.com/search?q=${enc(`${q.title} ${q.topic}`)}`, direct: false } : null;
  return { lc, gfg, yt, web };
}
