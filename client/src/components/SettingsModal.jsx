import { useState } from 'react';
import { X } from 'lucide-react';
import { parseISO } from '../lib/plan.js';

export default function SettingsModal({ startDate, onSave, onClose }) {
  const [v, setV] = useState(startDate);
  const notWed = v && parseISO(v).getDay() !== 3;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-line bg-card p-5" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-bold">Plan start date</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-dim hover:bg-white/5"><X size={18} /></button>
        </div>
        <p className="mb-3 text-sm text-ink-dim">
          Day 1 of Sprint 1 is a Wednesday. Today's task, pending questions and the schedule check are all calculated from this date.
        </p>
        <input type="date" value={v} onChange={(e) => setV(e.target.value)}
          className="w-full rounded-lg border border-line bg-page px-3 py-2 text-sm focus:border-accent focus:outline-none" />
        {notWed && <p className="mt-2 text-sm text-amber-300">That date is not a Wednesday, so the weekday labels will not match your plan.</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-ink-dim hover:bg-white/5">Cancel</button>
          <button disabled={!v} onClick={() => onSave(v)} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black disabled:opacity-40">Save start date</button>
        </div>
      </div>
    </div>
  );
}
