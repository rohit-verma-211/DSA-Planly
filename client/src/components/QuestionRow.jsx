import { Bookmark, Check, ExternalLink, FileText, MoreVertical, Youtube } from 'lucide-react';
import { TOPIC_STYLE, getLinks } from '../lib/plan.js';

function Pill({ href, label, tone, direct, title }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={direct ? title : `${title} (search – open ⋮ to paste the exact link)`}
      className={`grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-[11px] font-extrabold tracking-tight transition
        ${direct ? tone : 'text-ink-faint hover:text-ink-dim hover:bg-white/5'}`}
    >
      {label}
    </a>
  );
}

export default function QuestionRow({ q, onToggle, onBookmark, onEdit, showWhere }) {
  const L = getLinks(q);
  const btn = 'grid h-8 w-8 place-items-center rounded-md text-ink-dim hover:bg-white/5 hover:text-ink transition';
  return (
    <div className="group flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0 hover:bg-white/[0.02]">
      <button
        onClick={() => onToggle(q)}
        aria-label={q.completed ? 'Mark as not done' : 'Mark as done'}
        aria-pressed={q.completed}
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition
          ${q.completed ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-600 hover:border-zinc-300'}`}
      >
        {q.completed && <Check size={13} strokeWidth={3.5} className="text-black" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className={`text-[15px] font-medium ${q.completed ? 'text-ink-faint line-through decoration-zinc-600' : ''}`}>
            {q.title}
          </span>
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${TOPIC_STYLE[q.topic] || 'bg-zinc-700 text-zinc-300'}`}>
            {q.topic}
          </span>
          {q.is_custom && <span className="text-[11px] text-ink-faint">added by you</span>}
        </div>
        {showWhere && <div className="mt-0.5 text-xs text-ink-faint">{showWhere}</div>}
      </div>

      <div className="flex shrink-0 items-center">
        {L.lc && <Pill href={L.lc.url} label="LC" title="LeetCode" direct={L.lc.direct} tone="text-amber-400 hover:bg-amber-400/10" />}
        {L.gfg && <Pill href={L.gfg.url} label="GfG" title="GeeksforGeeks" direct={L.gfg.direct} tone="text-emerald-400 hover:bg-emerald-400/10" />}
        {L.web && (
          <a href={L.web.url} target="_blank" rel="noreferrer" title="Search the web" className={btn}>
            <ExternalLink size={16} />
          </a>
        )}
        <a
          href={L.yt.url}
          target="_blank"
          rel="noreferrer"
          title={L.yt.direct ? 'YouTube' : 'YouTube (search)'}
          className={`${btn} ${L.yt.direct ? '!text-red-500' : ''}`}
        >
          <Youtube size={17} />
        </a>
        <button onClick={() => onEdit(q, 'notes')} title="Notes" className={`${btn} relative`}>
          <FileText size={16} />
          {q.notes && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />}
        </button>
        <button
          onClick={() => onBookmark(q)}
          title={q.bookmarked ? 'Remove bookmark' : 'Bookmark'}
          aria-pressed={q.bookmarked}
          className={`${btn} ${q.bookmarked ? '!text-accent' : ''}`}
        >
          <Bookmark size={16} fill={q.bookmarked ? 'currentColor' : 'none'} />
        </button>
        <button onClick={() => onEdit(q, 'links')} title="Edit links / details" className={btn}>
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
