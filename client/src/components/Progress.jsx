export function Bar({ value, tone = 'bg-emerald-500', className = '' }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07] ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${tone}`} style={{ width: `${value}%` }} />
    </div>
  );
}
