import { Check } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** The habit toggle. Raised key when off, green and pressed when done. */
export function Tick({ className, ...props }: Omit<ComponentProps<'button'>, 'type'> & { 'aria-pressed': boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'keycap grid size-12 shrink-0 cursor-pointer place-items-center rounded-2xl ring-2 ring-inset ring-border',
        '[--fill:var(--control)] [--edge:var(--control-edge)] [--fg:transparent] hover:[--fg:var(--muted-foreground)]',
        'aria-pressed:[--fill:var(--go)] aria-pressed:[--edge:var(--go-edge)] aria-pressed:[--fg:#fff] aria-pressed:ring-0',
        className,
      )}
      {...props}
    >
      <Check className="size-6" strokeWidth={3} aria-hidden="true" />
    </button>
  )
}
