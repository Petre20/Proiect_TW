import { Flame } from 'lucide-react'

export function StreakFlame({ days }: { days: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ember px-2.5 py-0.5 text-caption font-extrabold text-ember-foreground">
      <Flame className="size-4" aria-hidden="true" />
      <span className="num">{days}</span> {days === 1 ? 'day' : 'days'}
    </span>
  )
}
