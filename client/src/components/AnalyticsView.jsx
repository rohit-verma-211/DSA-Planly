import { Bar } from './Progress.jsx';
import { SPRINTS, TOPICS, TOPIC_STYLE, TOTAL_DAYS, dayStats, locate, pct, streak, toISO, addDays, startOfToday, fmtDate } from '../lib/plan.js';

function Stat({ label, value, sub, tone = '' }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="text-sm text-ink-dim">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${tone}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-faint">{sub}</div>}
    </div>
  );
}

export default function AnalyticsView({ questions, map, tIdx, onOpenSprint }) {
  const total = questions.length;
  const done = questions.filter((q) => q.completed).length;

  let daysComplete = 0;
  for (let i = 0; i < TOTAL_DAYS; i++) { const { sprint, day } = locate(i); if (dayStats(map, sprint, day).complete) daysComplete++; }

  const due = questions.filter((q) => (q.sprint - 1) * 7 + (q.day - 1) < Math.min(Math.max(tIdx, 0), TOTAL_DAYS));
  const behind = due.filter((q) => !q.completed).length;

  // completions per calendar day, last 14 days
  const byDate = {};
  for (const q of questions) if (q.completed_at) { const k = toISO(new Date(q.completed_at)); byDate[k] = (byDate[k] || 0) + 1; }
  const today = startOfToday();
  const last14 = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13)).map((d) => ({ d, n: byDate[toISO(d)] || 0 }));
  const max = Math.max(1, ...last14.map((x) => x.n));

  const topicRows = TOPICS.map((t) => {
    const l = questions.filter((q) => q.topic === t);
    return { t, done: l.filter((q) => q.completed).length, total: l.length };
  }).filter((r) => r.total);

  const sprintRows = Array.from({ length: SPRINTS }, (_, i) => {
    const l = questions.filter((q) => q.sprint === i + 1);
    return { n: i + 1, done: l.filter((q) => q.completed).length, total: l.length };
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Questions completed" value={`${done} / ${total}`} sub={`${pct(done, total)}% of the plan`} />
        <Stat label="Days fully completed" value={`${daysComplete} / ${TOTAL_DAYS}`} />
        <Stat label="Current streak" value={`${streak(map, tIdx)} day${streak(map, tIdx) === 1 ? '' : 's'}`} sub="Days with every question ticked" />
        <Stat
          label="Against schedule"
          value={tIdx < 0 ? 'Not started' : behind === 0 ? 'On track' : `${behind} behind`}
          tone={behind === 0 ? 'text-emerald-400' : 'text-amber-300'}
          sub={tIdx < 0 ? '' : `${due.length - behind} of ${due.length} due questions done`}
        />
      </div>

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-4 text-lg font-bold">Questions completed, last 14 days</h2>
        <div className="flex h-36 items-end gap-1.5" role="img" aria-label="Bar chart of questions completed per day">
          {last14.map(({ d, n }) => (
            <div key={toISO(d)} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] text-ink-faint">{n || ''}</span>
              <div className={`w-full rounded-t ${n ? 'bg-accent' : 'bg-white/[0.06]'}`} style={{ height: `${Math.max(4, (n / max) * 100)}%` }} />
              <span className="text-[10px] text-ink-faint">{d.getDate()}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 text-lg font-bold">By subject</h2>
          <div className="space-y-4">
            {topicRows.map((r) => (
              <div key={r.t}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${TOPIC_STYLE[r.t]}`}>{r.t}</span>
                  <span className="text-ink-dim">{r.done}/{r.total} · {pct(r.done, r.total)}%</span>
                </div>
                <Bar value={pct(r.done, r.total)} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 text-lg font-bold">By sprint</h2>
          <div className="space-y-3">
            {sprintRows.map((r) => (
              <button key={r.n} onClick={() => onOpenSprint(r.n, 1)} className="block w-full text-left">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">Sprint {r.n}</span>
                  <span className="text-ink-dim">{r.done}/{r.total}</span>
                </div>
                <Bar value={pct(r.done, r.total)} tone={pct(r.done, r.total) === 100 ? 'bg-emerald-500' : 'bg-accent'} />
              </button>
            ))}
          </div>
        </section>
      </div>
      <p className="text-xs text-ink-faint">
        Questions imported from your Excel sheet are counted on the day you imported them ({fmtDate(today)} or earlier).
      </p>
    </div>
  );
}
