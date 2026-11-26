export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight ${className}`}>
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="10" fill="var(--volt)" />
        <path d="M9 24V11M23 24V11M7 12.5h18M7 18.5h18" stroke="var(--brand-ink)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      WellTrack
    </span>
  )
}
