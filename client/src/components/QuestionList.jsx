import QuestionRow from './QuestionRow.jsx';

export default function QuestionList({ questions, handlers, empty = 'Nothing here yet.', whereOf }) {
  if (!questions.length) {
    return <div className="rounded-2xl border border-line bg-card px-5 py-10 text-center text-sm text-ink-dim">{empty}</div>;
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      {questions.map((q) => (
        <QuestionRow key={q.id} q={q} {...handlers} showWhere={whereOf?.(q)} />
      ))}
    </div>
  );
}
