import { Dumbbell, ListChecks, Target } from 'lucide-react'

const TRACKABLE = [
  { label: 'Habits', Icon: ListChecks },
  { label: 'Workouts', Icon: Dumbbell },
  { label: 'Goals', Icon: Target },
]

export function About() {
  return (
    <section className="mx-auto max-w-page px-gutter py-section">
      <div className="grid gap-8 rounded-lg border-2 border-border bg-card p-5 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-9">
        <div>
          <h2 className="text-title text-foreground">Well, track it.</h2>
          <p className="mt-3 max-w-[52ch] text-lede text-muted-foreground">
            WellTrack is built on one idea: you can&apos;t improve what you don&apos;t track. Track your habits, log your
            workouts and set weekly goals in one place, then watch your week add up.
          </p>
        </div>
        <div className="grid gap-4">
          <ul aria-label="What you can track" className="grid grid-cols-3 gap-3">
            {TRACKABLE.map(({ label, Icon }) => (
              <li
                key={label}
                className="grid justify-items-center gap-2 rounded-2xl bg-muted px-2 py-4 text-label font-extrabold text-foreground"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-ink text-volt shadow-[0_4px_0_#06241A] dark:bg-volt dark:text-brand-ink dark:shadow-[0_4px_0_var(--volt-edge)]">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <p className="text-label font-semibold text-muted-foreground">
            And more: short articles matched to what you care about.
          </p>
        </div>
      </div>
    </section>
  )
}
