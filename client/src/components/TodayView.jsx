import { useState } from 'react';
import { CheckCircle2, ChevronDown, Flame } from 'lucide-react';
import QuestionList from './QuestionList.jsx';
import AddQuestion from './AddQuestion.jsx';
import { Bar } from './Progress.jsx';
import {
  DAYS, TOTAL_DAYS, countDone, dayDate, fmtDate, keyOf, locate, pct, streak,
} from '../lib/plan.js';

export default function TodayView({ questions, map, start, tIdx, handlers, onAdd, onOpenSprint }) {
  const [showBacklog, setShowBacklog] = useState(true);
  const before = tIdx < 0;
  const after = tIdx >= TOTAL_DAYS;
  const { sprint, day } = locate(before ? 0 : Math.min(tIdx, TOTAL_DAYS - 1));
  const list = map.get(keyOf(sprint, day)) || [];
  const done = countDone(list);
  const complete = list.length > 0 && done === list.length;
  const date = dayDate(start, sprint, day);

  // everything unfinished from days that are already over
  const pastPending = questions.filter((q) => {
    const idx = (q.sprint - 1) * 7 + (q.day - 1);
    return !q.completed && idx < Math.min(tIdx, TOTAL_DAYS);
  });
  const s = streak(map, tIdx);

  const whereOf = (q) => `Sprint ${q.sprint} · ${DAYS[q.day - 1].name}, ${fmtDate(dayDate(start, q.sprint, q.day))}`;

  let headline;
  if (before) headline = `Your plan starts on ${fmtDate(start)}`;
  else if (after) headline = 'The 13 sprints are over';
  else if (complete) headline = "Today's task is complete";
  else headline = `${list.length - done} left for today`;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-dim">
              {before ? 'Preview' : after ? 'Last day shown' : `Day ${tIdx + 1} of ${TOTAL_DAYS}`}
              {' – '}Sprint {sprint}, {DAYS[day - 1].name} {DAYS[day - 1].hours} hr, {fmtDate(date)}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{headline}</h1>
          </div>
          <div className="flex items-center gap-2">
            {s > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 text-sm font-semibold text-orange-300">
                <Flame size={15} /> {s}-day streak
              </span>
            )}
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold
              ${complete ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/[0.06] text-ink-dim'}`}>
              {complete && <CheckCircle2 size={15} />}
              {done} / {list.length} done
            </span>
          </div>
        </div>
        <Bar value={pct(done, list.length)} className="mt-5" tone={complete ? 'bg-emerald-500' : 'bg-accent'} />
        {pastPending.length > 0 && !after && (
          <p className="mt-4 text-sm text-amber-300">
            You still have {pastPending.length} unfinished question{pastPending.length > 1 ? 's' : ''} from earlier days.
          </p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{before ? 'Day 1 preview' : "Today's questions"}</h2>
          <button onClick={() => onOpenSprint(sprint, day)} className="text-sm text-ink-dim hover:text-ink">Open in Sprint {sprint}</button>
        </div>
        <QuestionList questions={list} handlers={handlers} empty="No questions assigned for this day." />
        <AddQuestion onAdd={(q) => onAdd({ ...q, sprint, day })} />
      </section>

      {pastPending.length > 0 && (
        <section>
          <button onClick={() => setShowBacklog(!showBacklog)} className="mb-3 flex items-center gap-2 text-lg font-bold">
            Pending from earlier days ({pastPending.length})
            <ChevronDown size={18} className={`transition ${showBacklog ? '' : '-rotate-90'}`} />
          </button>
          {showBacklog && <QuestionList questions={pastPending} handlers={handlers} whereOf={whereOf} />}
        </section>
      )}
    </div>
  );
}
