import { cn } from '@/lib/utils'

type Props = { done?: number; total?: number; className?: string }

export function HurdleTrack({ done = 4, total = 6, className }: Props) {
  return (
    <div
      aria-hidden="true"
      style={{ '--n': total } as React.CSSProperties}
      className={cn(
        'grid grid-cols-[repeat(var(--n),1fr)] border-y-[3px] border-on-brand',
        'bg-[repeating-linear-gradient(90deg,transparent_0,transparent_calc(100%/var(--n)-2px),var(--on-brand-faint)_calc(100%/var(--n)-2px),var(--on-brand-faint)_calc(100%/var(--n)))]',
        className,
      )}
    >
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="grid h-16 place-items-center lg:h-24">
          <i
            className={cn(
              'grid size-10 place-items-center rounded-[14px] font-display text-sm font-extrabold not-italic lg:size-14 lg:text-base',
              i < done
                ? 'bg-volt text-brand-ink shadow-[0_4px_0_var(--volt-edge)]'
                : 'border-[3px] border-dashed border-[#5E8D78] text-[#8FB5A1]',
            )}
          >
            {i + 1}
          </i>
        </div>
      ))}
    </div>
  )
}
