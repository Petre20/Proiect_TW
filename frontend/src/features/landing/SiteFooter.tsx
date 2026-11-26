import { Link } from 'react-router'
import { Logo } from '@/components/brand/Logo'

const LINKS = [
  { label: 'What to track', href: '#pick' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Log in', to: '/auth' },
  { label: 'Sign up', to: '/auth?mode=register' },
]

const linkClass =
  'rounded-md font-bold text-on-brand-muted underline-offset-4 hover:text-on-brand hover:underline'

export function SiteFooter() {
  return (
    <footer className="on-ink border-t border-white/10 bg-brand-ink text-on-brand-muted">
      <div className="mx-auto grid max-w-page gap-8 px-gutter py-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="grid gap-2">
            <Logo onDark className="text-on-brand" />
            <p>Track your habits, workouts and more. Everything in one place.</p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {LINKS.map(({ label, href, to }) => (
                <li key={label}>
                  {to ? (
                    <Link to={to} className={linkClass}>
                      {label}
                    </Link>
                  ) : (
                    <a href={href} className={linkClass}>
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="grid gap-1 border-t border-white/10 pt-6 text-caption">
          <p>© 2026 WellTrack</p>
        </div>
      </div>
    </footer>
  )
}
