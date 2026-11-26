import { cn } from '@/lib/utils'

export type DayState = 'done' | 'none' | 'today' | 'today-done'

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const DOT: Record<DayState, string> = {
  none: 'bg-muted',
  done: 'bg-go shadow-[0_3px_0_var(--go-edge)]',
  today: 'border-[3px] border-dashed border-ember bg-card',
  'today-done': 'bg-volt shadow-[0_3px_0_var(--volt-edge)]',
}

export function WeekStrip({ days }: { days: DayState[] }) {
  return (
    <div
      role="group"
      aria-label="This week"
      className="mt-3.5 grid grid-cols-7 gap-1.5 text-center text-xs font-extrabold text-muted-foreground"
    >
      {days.map((state, i) => (
        <div key={i}>
          <span className={cn(state.startsWith('today') && 'text-foreground')}>{LETTERS[i]}</span>
          <i
            data-state={state}
            className={cn('mx-auto mt-1 block aspect-square w-full max-w-[38px] rounded-xl not-italic', DOT[state])}
          />
        </div>
      ))}
    </div>
  )
}
