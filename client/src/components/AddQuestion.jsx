import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TOPICS } from '../lib/plan.js';

export default function AddQuestion({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('DSA');
  const [lc, setLc] = useState('');

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-3 flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink">
        <Plus size={16} /> Add your own question to this day
      </button>
    );
  }
  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title, topic, lc_url: lc });
    setTitle(''); setLc(''); setOpen(false);
  };
  const field = 'rounded-lg border border-line bg-page px-3 py-2 text-sm placeholder:text-ink-faint focus:border-accent focus:outline-none';
  return (
    <div className="mt-3 flex flex-wrap gap-2 rounded-2xl border border-line bg-card p-3">
      <input autoFocus className={`${field} min-w-[200px] flex-1`} placeholder="Question title" value={title}
        onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
      <select className={field} value={topic} onChange={(e) => setTopic(e.target.value)}>
        {TOPICS.map((t) => <option key={t}>{t}</option>)}
      </select>
      <input className={`${field} min-w-[200px] flex-1`} placeholder="LeetCode / GfG link (optional)" value={lc} onChange={(e) => setLc(e.target.value)} />
      <button onClick={submit} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black">Add question</button>
      <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-ink-dim hover:bg-white/5">Cancel</button>
    </div>
  );
}
