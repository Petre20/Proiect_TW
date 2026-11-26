import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { ProgressRing } from '@/components/brand/ProgressRing'
import { StreakFlame } from '@/components/brand/StreakFlame'
import { ThemeToggle } from '@/components/brand/ThemeToggle'
import { Tick } from '@/components/brand/Tick'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthModal } from '@/stores/auth-modal'

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-xl">{title}</h2>
        {note && <p className="mt-1 max-w-prose text-sm text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  )
}

const SWATCHES: [string, string][] = [
  ['background', 'bg-background'], ['card', 'bg-card'], ['muted', 'bg-muted'], ['border', 'bg-border'],
  ['brand-ink', 'bg-brand-ink'], ['volt', 'bg-volt'], ['go', 'bg-go'], ['ember', 'bg-ember'], ['sun', 'bg-sun'],
  ['destructive', 'bg-destructive'], ['control', 'bg-control'], ['warm-soft', 'bg-warm-soft'],
]

const TYPE_TOKENS: [string, string, string][] = [
  ['text-display', 'text-display', 'Hero headline. Fluid, 2.7 to 5.1 rem.'],
  ['text-title', 'text-title', 'Section headings. Fluid, 1.7 to 2.7 rem.'],
  ['text-lede', 'text-lede', 'Intro paragraph under a headline. Fluid, 1.125 to 1.25 rem.'],
  ['text-label', 'text-label', 'Labels, small buttons, form text. 15 px.'],
  ['text-caption', 'text-caption', 'Chips and fine print. 13 px.'],
]

const LAYOUT_TOKENS: [string, string][] = [
  ['max-w-page', 'Page container, 72 rem.'],
  ['max-w-form', 'Auth and form card, 30 rem.'],
  ['px-gutter', 'Page side padding: 16 px, 32 px from the lg breakpoint.'],
  ['py-section', 'Vertical space of a page section: 56 px, 88 px from the lg breakpoint.'],
  ['rounded-field', 'Radius of inputs and small tiles, 14 px. Cards use rounded-lg.'],
]

const HABITS = ['Morning run', 'Read 10 pages', 'Cook a proper meal']

export function Component() {
  const [done, setDone] = useState<boolean[]>([true, false, false])
  const count = done.filter(Boolean).length
  const show = useAuthModal((s) => s.show)

  return (
    <main className="mx-auto grid max-w-4xl gap-12 p-4 py-10 lg:p-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl">Styleguide</h1>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Every building block, in the active theme. Flip the theme to check dark mode. Nothing here is a screen.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Colour" note="Tokens, not hex. Green means done or go, volt means the main action, ember is a warm highlight and never goes on a clickable control.">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {SWATCHES.map(([name, cls]) => (
            <div key={name} className="grid gap-1.5">
              <div className={`h-14 rounded-2xl border-2 border-border ${cls}`} />
              <span className="text-xs font-bold text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type, layout and radii" note="Use these instead of one-off sizes. Spacing between elements stays on Tailwind's own scale (gap-2, gap-4, p-6).">
        <ul className="grid gap-3">
          {TYPE_TOKENS.map(([token, cls, note]) => (
            <li key={token} className="grid gap-0.5">
              <span className={`${cls} font-display font-extrabold`}>Build habits</span>
              <span className="text-sm text-muted-foreground"><code>{token}</code>. {note}</span>
            </li>
          ))}
        </ul>
        <ul className="grid gap-1.5 text-sm text-muted-foreground">
          {LAYOUT_TOKENS.map(([token, note]) => (
            <li key={token}><code>{token}</code>. {note}</li>
          ))}
        </ul>
      </Section>

      <Section title="Buttons" note="Keycaps. They lift on hover and press down on click. Destructive stays neutral until hovered, so it never reads as the main action.">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Start building</Button>
          <Button variant="go">Mark done</Button>
          <Button variant="ink">Dark</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Habit ticks" note="The daily loop. Tap to complete; the ring follows.">
        <Card className="grid gap-1 rounded-3xl border-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="grid">
            {HABITS.map((h, i) => (
              <div key={h} className="flex items-center gap-4 border-t-2 border-muted py-3 first:border-t-0">
                <Tick
                  aria-label={h}
                  aria-pressed={done[i]}
                  onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
                />
                <span className={done[i] ? 'font-bold text-muted-foreground line-through' : 'font-bold'}>{h}</span>
              </div>
            ))}
          </div>
          <div className="grid justify-items-center gap-3 p-2">
            <ProgressRing value={(count / HABITS.length) * 100} label="Today" />
            <StreakFlame days={4} />
          </div>
        </Card>
      </Section>

      <Section title="Forms">
        <Card className="grid gap-4 rounded-3xl border-2 p-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="sg-email">Email</Label>
            <Input id="sg-email" type="email" placeholder="ana.popescu@student.ro" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sg-bad">Password</Label>
            <Input id="sg-bad" type="password" aria-invalid defaultValue="short" />
            <p className="text-sm font-bold text-destructive">Use at least 8 characters.</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="sg-sw" defaultChecked />
            <Label htmlFor="sg-sw">Keep me logged in</Label>
          </div>
          <Tabs defaultValue="week">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>
      </Section>

      <Section title="Surfaces and status">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Run</Badge>
          <Badge variant="secondary">Yoga</Badge>
          <Badge variant="outline">Draft</Badge>
          <StreakFlame days={12} />
        </div>
        <Card className="grid gap-3 rounded-3xl border-2 p-5">
          <p className="font-bold">Weekly goal: 3 runs</p>
          <Progress value={66} />
          <p className="text-sm text-muted-foreground">2 of 3 done. One more and you are there.</p>
        </Card>
        <div className="rounded-2xl bg-warm-soft p-4 text-warm-soft-text">
          <p className="font-display font-extrabold text-warm-soft-strong">Welcome back, Ana.</p>
          <p>Wednesday was a quiet one. Pick up with one small tick today.</p>
        </div>
      </Section>

      <Section title="Feedback and overlays">
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={() => toast.success('Run logged. Your week just moved.')}>Success toast</Button>
          <Button variant="outline" onClick={() => toast.error('Could not save. Try again.')}>Error toast</Button>
          <Button variant="outline" onClick={() => show('login')}>Open login modal</Button>
          <Button variant="outline" onClick={() => show('register')}>Open sign-up modal</Button>
          <Button variant="outline" onClick={() => show('session-expired')}>Session expired</Button>
        </div>
      </Section>
    </main>
  )
}
