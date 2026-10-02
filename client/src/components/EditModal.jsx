import { useEffect, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';

const input = 'w-full rounded-lg border border-line bg-page px-3 py-2 text-sm placeholder:text-ink-faint focus:border-accent focus:outline-none';

export default function EditModal({ q, focus, onClose, onSave, onDelete }) {
  const [f, setF] = useState({
    title: q.title, lc_url: q.lc_url || '', gfg_url: q.gfg_url || '', yt_url: q.yt_url || '', notes: q.notes || '',
  });
  const notesRef = useRef(null);
  useEffect(() => { if (focus === 'notes') notesRef.current?.focus(); }, [focus]);
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-line bg-card p-5" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold">Edit question</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-dim hover:bg-white/5"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <label className="block text-sm"><span className="mb-1 block text-ink-dim">Title</span>
            <input className={input} value={f.title} onChange={set('title')} /></label>
          <label className="block text-sm"><span className="mb-1 block text-ink-dim">LeetCode link</span>
            <input className={input} placeholder="https://leetcode.com/problems/two-sum/" value={f.lc_url} onChange={set('lc_url')} /></label>
          <label className="block text-sm"><span className="mb-1 block text-ink-dim">GeeksforGeeks link (use when it is not on LeetCode)</span>
            <input className={input} placeholder="https://www.geeksforgeeks.org/..." value={f.gfg_url} onChange={set('gfg_url')} /></label>
          <label className="block text-sm"><span className="mb-1 block text-ink-dim">YouTube link</span>
            <input className={input} placeholder="https://youtu.be/..." value={f.yt_url} onChange={set('yt_url')} /></label>
          <label className="block text-sm"><span className="mb-1 block text-ink-dim">Notes (approach, mistakes, time complexity)</span>
            <textarea ref={notesRef} rows={4} className={input} value={f.notes} onChange={set('notes')} /></label>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => { if (confirm('Delete this question?')) onDelete(q); }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
          ><Trash2 size={15} /> Delete</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-ink-dim hover:bg-white/5">Cancel</button>
            <button onClick={() => onSave(q, f)} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black hover:brightness-110">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
