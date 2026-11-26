import { Link } from 'react-router'
import { LoginForm } from './components/AuthForms'

export function Component() {
  return (
    <>
      <h1 className="mb-1 text-2xl">Welcome back</h1>
      <p className="mb-5 text-muted-foreground">Log in to pick up where you left off.</p>
      <LoginForm variant="page" />
      <p className="mt-5 text-center text-sm text-muted-foreground">
        New to WellTrack? <Link className="font-bold text-foreground underline" to="/register">Create an account</Link>
      </p>
    </>
  )
}
