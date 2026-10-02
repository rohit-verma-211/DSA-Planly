import { Check } from 'lucide-react';
import QuestionList from './QuestionList.jsx';
import AddQuestion from './AddQuestion.jsx';
import { Bar } from './Progress.jsx';
import {
  DAYS, SPRINTS, countDone, dayDate, dayIndex, dayStats, fmtDate, keyOf, pct,
} from '../lib/plan.js';

export default function SprintView({ sprint, setSprint, day, setDay, map, start, tIdx, handlers, onAdd }) {
  const stats = Array.from({ length: SPRINTS }, (_, i) => {
    let done = 0; let total = 0;
    for (let d = 1; d <= 7; d++) { const s = dayStats(map, i + 1, d); done += s.done; total += s.total; }
    return { done, total };
  });
  const list = map.get(keyOf(sprint, day)) || [];

  return (
    <div className="grid gap-6 md:grid-cols-[230px_1fr]">
      {/* sprint picker */}
      <aside className="md:sticky md:top-20 md:self-start">
        <select
          className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm md:hidden"
          value={sprint} onChange={(e) => setSprint(Number(e.target.value))} aria-label="Sprint"
        >
          {stats.map((s, i) => <option key={i} value={i + 1}>Sprint {i + 1} – {pct(s.done, s.total)}%</option>)}
        </select>
        <nav className="hidden space-y-1 md:block" aria-label="Sprints">
          {stats.map((s, i) => {
            const active = sprint === i + 1;
            return (
              <button key={i} onClick={() => setSprint(i + 1)}
                className={`block w-full rounded-xl px-3 py-2.5 text-left transition ${active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'}`}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className={active ? 'font-bold' : 'font-medium text-ink-dim'}>Sprint {i + 1}</span>
                  <span className="text-xs text-ink-faint">{s.done}/{s.total}</span>
                </div>
                <Bar value={pct(s.done, s.total)} className="mt-2" tone={pct(s.done, s.total) === 100 ? 'bg-emerald-500' : 'bg-accent'} />
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        {/* day tabs */}
        <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
          {DAYS.map((d, i) => {
            const n = i + 1;
            const st = dayStats(map, sprint, n);
            const active = n === day;
            const isToday = dayIndex(sprint, n) === tIdx;
            return (
              <button key={n} onClick={() => setDay(n)}
                className={`min-w-[104px] shrink-0 rounded-xl border px-3 py-2.5 text-left transition
                  ${active ? 'border-accent/60 bg-accent/10' : 'border-line bg-card hover:border-zinc-600'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{d.short}</span>
                  {st.complete ? <Check size={15} className="text-emerald-400" strokeWidth={3} />
                    : isToday ? <span className="rounded bg-accent px-1.5 text-[10px] font-extrabold text-black">TODAY</span> : null}
                </div>
                <div className="mt-0.5 text-xs text-ink-faint">{fmtDate(dayDate(start, sprint, n))} · {d.hours} hr</div>
                <div className="mt-1.5 text-xs text-ink-dim">{st.done}/{st.total} done</div>
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Sprint {sprint} – {DAYS[day - 1].name}</h2>
          <span className="text-sm text-ink-dim">{countDone(list)} of {list.length} completed</span>
        </div>
        <QuestionList questions={list} handlers={handlers} empty="No questions assigned for this day." />
        <AddQuestion onAdd={(q) => onAdd({ ...q, sprint, day })} />
      </div>
    </div>
  );
}
