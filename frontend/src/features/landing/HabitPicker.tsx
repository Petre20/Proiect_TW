import { Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { habits } from './habits'

function ctaLabel(count: number) {
  if (count === 0) return 'Start with a blank slate'
  return count === 1 ? 'Start with this one' : `Start with these ${count}`
}

export function HabitPicker() {
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const count = picked.size

  function toggle(id: string) {
    setPicked((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }

  return (
    <section id="pick" className="mx-auto max-w-page scroll-mt-4 px-gutter py-section">
      <h2 className="text-title text-foreground">What are you building?</h2>
      <p className="mt-2 max-w-[60ch] text-lede text-muted-foreground">
        Pick one and start small. Add a few and carry them into your first day. You can change all of it later.
      </p>

      <ul
        className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pt-4 pb-6 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-[1.4rem] lg:overflow-visible lg:px-0 lg:pt-8 [&::-webkit-scrollbar]:hidden"
      >
        {habits.map(({ id, name, meta, tint, Illustration }) => {
          const on = picked.has(id)
          return (
            <li
              key={id}
              className="flex w-[min(74vw,260px)] shrink-0 snap-center flex-col overflow-hidden rounded-lg border-2 border-border bg-card transition-[translate,rotate,box-shadow] duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_14px_24px_-12px_rgb(15_61_46/0.35)] lg:w-auto lg:nth-[3n+1]:-rotate-[0.7deg] lg:nth-[3n+2]:translate-y-2.5 lg:nth-[3n]:rotate-[0.7deg]"
            >
              <div
                className="aspect-[4/3] w-full border-b-2 border-border dark:brightness-95 dark:saturate-[.92]"
                style={{ backgroundColor: tint }}
              >
                <Illustration />
              </div>
              <div className="grid flex-1 content-between gap-3 p-4">
                <div>
                  <h3 className="text-[1.0625rem] tracking-[-0.01em]">{name}</h3>
                  <p className="mt-0.5 text-label font-semibold text-muted-foreground">{meta}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={on ? 'go' : 'default'}
                  aria-pressed={on}
                  aria-label={`Add ${name}`}
                  onClick={() => toggle(id)}
                  className="justify-self-start"
                >
                  {on ? <Check strokeWidth={3} aria-hidden /> : <Plus strokeWidth={3} aria-hidden />}
                  {on ? 'Added' : 'Add'}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="font-bold text-muted-foreground">
          <b className="font-display text-foreground">{count}</b> {count === 1 ? 'habit' : 'habits'} picked
        </p>
        <Button asChild>
          <Link to="/auth?mode=register">{ctaLabel(count)}</Link>
        </Button>
      </div>
    </section>
  )
}
