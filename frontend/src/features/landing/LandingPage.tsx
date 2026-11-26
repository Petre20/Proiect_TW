import { Link } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/brand/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuthModal } from '@/stores/auth-modal'

export function Component() {
  const show = useAuthModal((s) => s.show)
  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => show('login')}>Log in</Button>
          <Button size="sm" onClick={() => show('register')}>Sign up</Button>
        </div>
      </header>
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-16">
        <h1 className="text-5xl">Build habits that stick.</h1>
        <p className="max-w-prose text-lg text-muted-foreground">
          Landing skeleton. Log in and Sign up open a modal; the full pages live at <Link className="underline" to="/login">/login</Link> and{' '}
          <Link className="underline" to="/register">/register</Link>. See <Link className="underline" to="/styleguide">/styleguide</Link> for the design system.
        </p>
      </section>
    </main>
  )
}
