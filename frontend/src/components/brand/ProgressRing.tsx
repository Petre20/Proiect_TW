type Props = { value: number; size?: number; stroke?: number; label?: string; className?: string }

export function ProgressRing({ value, size = 120, stroke = 12, label, className = '' }: Props) {
  const v = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className={`relative inline-grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`${label ?? 'Progress'}: ${Math.round(v)}%`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--go)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}
          style={{ transition: 'stroke-dashoffset .6s var(--ease)' }}
        />
      </svg>
      <span className="num absolute font-display text-xl font-extrabold">{Math.round(v)}%</span>
    </div>
  )
}
