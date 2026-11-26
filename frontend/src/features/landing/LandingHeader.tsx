import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/brand/ThemeToggle'
import { Button } from '@/components/ui/button'
import { meQuery } from '@/features/auth/queries'
import { useAuthModal } from '@/stores/auth-modal'

export function LandingHeader() {
  const show = useAuthModal((s) => s.show)
  const { data: me, isPending } = useQuery(meQuery)

  return (
    <nav aria-label="Site" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
      <Link to="/" aria-label="WellTrack home">
        <Logo onDark className="text-on-brand" />
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle className="text-on-brand hover:bg-brand-ink-2" />
        {!isPending && me && (
          <Button asChild size="sm">
            <Link to="/dashboard">Open dashboard</Link>
          </Button>
        )}
        {!isPending && !me && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-on-brand ring-2 ring-inset ring-on-brand/30 hover:bg-brand-ink-2"
              onClick={() => show('login')}
            >
              Log in
            </Button>
            <Button size="sm" onClick={() => show('register')}>Sign up</Button>
          </>
        )}
      </div>
    </nav>
  )
}
