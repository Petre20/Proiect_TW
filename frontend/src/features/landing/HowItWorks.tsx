const STEPS = [
  { title: 'Tick or log', body: "Tick today's habits, or log a run, a ride or a gym session in a few seconds." },
  { title: 'It all adds up', body: 'A ticked habit and a logged workout both move your goals and your week.' },
  {
    title: 'See your week improve',
    body: 'Statistics and goals show where you are, with short articles matched to what you care about.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-page scroll-mt-4 px-gutter py-section">
      <h2 className="max-w-[24ch] text-title text-foreground">How it works: one daily loop, everything else follows.</h2>
      <ol className="mt-6 grid gap-4 lg:grid-cols-3">
        {STEPS.map(({ title, body }, i) => (
          <li
            key={title}
            className="flex items-start gap-4 rounded-lg border-2 border-border bg-card p-4 lg:flex-col"
          >
            <span
              aria-hidden="true"
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-ink font-display text-lg font-extrabold text-volt shadow-[0_4px_0_#06241A] dark:bg-volt dark:text-brand-ink dark:shadow-[0_4px_0_var(--volt-edge)]"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="mb-1 text-xl">{title}</h3>
              <p className="text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
