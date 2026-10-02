import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Bookmark, CalendarCheck, Layers, Settings } from 'lucide-react';
import { api } from './api.js';
import { Bar } from './components/Progress.jsx';
import TodayView from './components/TodayView.jsx';
import SprintView from './components/SprintView.jsx';
import AnalyticsView from './components/AnalyticsView.jsx';
import QuestionList from './components/QuestionList.jsx';
import EditModal from './components/EditModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { DAYS, TOTAL_DAYS, dayDate, fmtDate, groupByDay, locate, parseISO, pct, todayIndex } from './lib/plan.js';

const TABS = [
  { id: 'today', label: 'Today', icon: CalendarCheck },
  { id: 'sprints', label: 'Sprints', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
];

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState('today');
  const [sprint, setSprint] = useState(1);
  const [day, setDay] = useState(1);
  const [editing, setEditing] = useState(null); // { q, focus }
  const [showSettings, setShowSettings] = useState(false);

  const load = useCallback(() => {
    setState('loading');
    api.getPlan()
      .then(({ questions, settings }) => {
        setQuestions(questions);
        setStartDate(settings.start_date || null);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);
  useEffect(load, [load]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const start = useMemo(() => (startDate ? parseISO(startDate) : null), [startDate]);
  const map = useMemo(() => groupByDay(questions), [questions]);
  const tIdx = start ? todayIndex(start) : -1;

  // jump the Sprints tab to today's day on first load
  useEffect(() => {
    if (state === 'ready' && tIdx >= 0 && tIdx < TOTAL_DAYS) {
      const l = locate(tIdx); setSprint(l.sprint); setDay(l.day);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // optimistic update, rolled back if the server call fails
  const patch = async (q, changes) => {
    const prev = questions;
    const merged = { ...changes, ...(changes.completed !== undefined ? { completed_at: changes.completed ? new Date().toISOString() : null } : {}) };
    setQuestions((qs) => qs.map((x) => (x.id === q.id ? { ...x, ...merged } : x)));
    try {
      const saved = await api.updateQuestion(q.id, changes);
      setQuestions((qs) => qs.map((x) => (x.id === q.id ? saved : x)));
    } catch {
      setQuestions(prev);
      flash('Could not save that change. Check that the server is running.');
    }
  };

  const handlers = {
    onToggle: (q) => patch(q, { completed: !q.completed }),
    onBookmark: (q) => patch(q, { bookmarked: !q.bookmarked }),
    onEdit: (q, focus) => setEditing({ q, focus }),
  };

  const addQuestion = async (data) => {
    try { const created = await api.addQuestion(data); setQuestions((qs) => [...qs, created]); }
    catch { flash('Could not add the question.'); }
  };
  const deleteQuestion = async (q) => {
    try { await api.deleteQuestion(q.id); setQuestions((qs) => qs.filter((x) => x.id !== q.id)); setEditing(null); }
    catch { flash('Could not delete the question.'); }
  };
  const saveEdit = (q, f) => { patch(q, f); setEditing(null); };
  const saveStart = async (v) => {
    try { await api.setStartDate(v); setStartDate(v); setShowSettings(false); }
    catch { flash('Could not save the start date.'); }
  };
  const openSprint = (s, d) => { setSprint(s); setDay(d); setTab('sprints'); window.scrollTo(0, 0); };

  if (state === 'loading') return <div className="grid min-h-screen place-items-center text-ink-dim">Loading your plan…</div>;
  if (state === 'error') {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-xl font-bold">Cannot reach the server</h1>
          <p className="mt-2 text-sm text-ink-dim">Start the API with <code className="rounded bg-white/10 px-1.5">npm run dev</code> inside <code className="rounded bg-white/10 px-1.5">server/</code> and make sure PostgreSQL is running and seeded.</p>
          <button onClick={load} className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black">Try again</button>
        </div>
      </div>
    );
  }

  const done = questions.filter((q) => q.completed).length;
  const bookmarks = questions.filter((q) => q.bookmarked);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <div className="min-w-[150px]">
            <div className="text-[15px] font-extrabold">90-Day Sprint Tracker</div>
            <div className="mt-1.5 flex items-center gap-2">
              <Bar value={pct(done, questions.length)} className="w-28" />
              <span className="text-xs text-ink-dim">{done}/{questions.length}</span>
            </div>
          </div>
          <nav className="order-last flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto" aria-label="Main">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition
                  ${tab === id ? 'bg-white/[0.09] text-ink' : 'text-ink-dim hover:bg-white/5 hover:text-ink'}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
          <button onClick={() => setShowSettings(true)} title="Plan start date" aria-label="Settings"
            className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-ink-dim hover:bg-white/5 hover:text-ink">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'today' && (
          <TodayView questions={questions} map={map} start={start} tIdx={tIdx} handlers={handlers} onAdd={addQuestion} onOpenSprint={openSprint} />
        )}
        {tab === 'sprints' && (
          <SprintView sprint={sprint} setSprint={setSprint} day={day} setDay={setDay} map={map} start={start} tIdx={tIdx} handlers={handlers} onAdd={addQuestion} />
        )}
        {tab === 'analytics' && <AnalyticsView questions={questions} map={map} tIdx={tIdx} onOpenSprint={openSprint} />}
        {tab === 'bookmarks' && (
          <section>
            <h1 className="mb-3 text-lg font-bold">Bookmarked questions ({bookmarks.length})</h1>
            <QuestionList questions={bookmarks} handlers={handlers}
              empty="Tap the bookmark icon on any question to save it here for revision."
              whereOf={(q) => `Sprint ${q.sprint} · ${DAYS[q.day - 1].name}, ${fmtDate(dayDate(start, q.sprint, q.day))}`} />
          </section>
        )}
      </main>

      {editing && <EditModal q={editing.q} focus={editing.focus} onClose={() => setEditing(null)} onSave={saveEdit} onDelete={deleteQuestion} />}
      {showSettings && <SettingsModal startDate={startDate} onSave={saveStart} onClose={() => setShowSettings(false)} />}
      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-red-500/90 px-4 py-2.5 text-sm font-semibold text-white">{toast}</div>}
    </div>
  );
}
