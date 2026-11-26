import { useState } from 'react'
import { Link } from 'react-router'
import { Tick } from '@/components/brand/Tick'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LandingHeader } from './LandingHeader'
import { WeekStrip, type DayState } from './WeekStrip'

const HABITS = [
  { name: 'Morning run', meta: '20 min · Mon, Wed, Thu' },
  { name: 'Read 10 pages', meta: 'Every day' },
  { name: 'Cook a proper meal', meta: 'Every day' },
]

function message(done: number) {
  if (done === HABITS.length) return 'Day cleared. That is the whole trick.'
  return done > 0 ? 'Nice. Keep going.' : ''
}

function TodayCard() {
  const [ticked, setTicked] = useState([true, false, false])

  const done = ticked.filter(Boolean).length
  const percent = Math.round((done / HABITS.length) * 100)
  const week: DayState[] = ['done', 'done', 'done', done === HABITS.length ? 'today-done' : 'today', 'none', 'none', 'none']

  return (
    <div className="relative text-foreground motion-safe:rotate-[1.6deg]">
      <p
        aria-hidden="true"
        className="absolute -top-8 right-3 flex rotate-2 items-center gap-1.5 text-sm font-extrabold text-on-brand"
      >
        Go on, tick one
        <svg viewBox="0 0 34 26" className="h-[26px] w-[34px] fill-none stroke-ember stroke-[2.4] [stroke-linecap:round] [stroke-linejoin:round]">
          <path d="M2 4c10-4 22 0 26 16" />
          <path d="m21 17 7 4 3-8" />
        </svg>
      </p>
      <div className="rounded-lg border-2 border-border bg-card p-4 shadow-[0_8px_0_rgb(6_36_26/0.45),0_26px_36px_-14px_rgb(0_0_0/0.5)]">
        <h2 className="mb-1 text-lg">Today, Thursday</h2>
        {HABITS.map((habit, i) => (
          <div key={habit.name} className="flex min-h-[68px] items-center gap-3.5 border-t-2 border-muted py-2.5 first-of-type:border-t-0">
            <Tick
              aria-label={habit.name}
              aria-pressed={ticked[i]}
              onClick={() => setTicked((t) => t.map((v, j) => (j === i ? !v : v)))}
            />
            <div>
              <div className={cn('font-extrabold', ticked[i] && 'text-muted-foreground line-through decoration-2')}>
                {habit.name}
              </div>
              <p className="text-sm font-semibold text-muted-foreground">{habit.meta}</p>
            </div>
          </div>
        ))}
        <div className="mt-2 flex items-center gap-3">
          <div
            role="progressbar"
            aria-label="Today's habits"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-3.5 flex-1 overflow-hidden rounded-full bg-muted"
          >
            <i
              className="block h-full rounded-full bg-volt shadow-[inset_0_-3px_0_var(--volt-edge)] transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${percent}%` }}
            />
          </div>
          <b className="num font-display text-label font-extrabold whitespace-nowrap">
            {done} of {HABITS.length}
          </b>
        </div>
        <p aria-live="polite" className="mt-2 min-h-6 text-label font-bold text-go-text">
          {message(done)}
        </p>
        <WeekStrip days={week} />
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <header className="on-ink relative overflow-hidden rounded-b-[38px] bg-brand-ink pb-14 text-on-brand lg:rounded-b-[54px] lg:pb-[4.6rem] dark:border-b dark:border-white/10">
      <LandingHeader />
      <div className="mx-auto mt-6 grid max-w-page gap-10 px-gutter lg:mt-10 lg:grid-cols-[1.12fr_1fr] lg:items-center lg:gap-14">
        <div>
          <h1 className="text-display">
            Build habits that{' '}
            <mark className="relative bg-transparent whitespace-nowrap text-volt after:absolute after:inset-x-[-2%] after:-bottom-[0.08em] after:h-[0.14em] after:-rotate-[1.2deg] after:rounded-[9px] after:bg-volt after:opacity-90">
              stick.
            </mark>
          </h1>
          <p className="mt-4 max-w-[36ch] text-lede text-on-brand-muted">
            Tick off today, log a workout in seconds, and watch your week add up. Habits, activities and goals in one
            place.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth?mode=register">Start building</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-on-brand ring-2 ring-inset ring-on-brand/30 hover:bg-brand-ink-2"
            >
              <a href="#pick">See what people track</a>
            </Button>
          </div>
          {/* <p className="mt-4 text-sm text-on-brand-muted/90">
            Made for the days between lectures, shifts and everything else.
          </p> */}
        </div>
        <TodayCard />
      </div>
    </header>
  )
}
