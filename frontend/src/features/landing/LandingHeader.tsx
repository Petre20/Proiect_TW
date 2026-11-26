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
    <nav aria-label="Site" className="mx-auto flex max-w-page items-center justify-between px-gutter py-4">
      <Link to="/" aria-label="WellTrack home" className="shrink-0">
        <Logo onDark className="text-on-brand" wordmarkClassName="max-[360px]:sr-only" />
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle className="text-on-brand hover:bg-brand-ink-2 max-[420px]:hidden" />
        {!isPending && me && (
          <Button asChild size="sm" className="px-3 sm:px-4">
            <Link to="/dashboard">Open dashboard</Link>
          </Button>
        )}
        {!isPending && !me && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="px-3 text-on-brand ring-2 ring-inset ring-on-brand/30 hover:bg-brand-ink-2 sm:px-4"
              onClick={() => show('login')}
            >
              Log in
            </Button>
            <Button size="sm" className="px-3 sm:px-4" onClick={() => show('register')}>Sign up</Button>
          </>
        )}
      </div>
    </nav>
  )
}
