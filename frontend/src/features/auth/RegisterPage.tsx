import { Link } from 'react-router'
import { RegisterForm } from './components/AuthForms'

export function Component() {
  return (
    <>
      <h1 className="mb-1 text-2xl">Start building habits</h1>
      <p className="mb-5 text-muted-foreground">Create an account. It takes a minute.</p>
      <RegisterForm variant="page" />
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account? <Link className="font-bold text-foreground underline" to="/login">Log in</Link>
      </p>
    </>
  )
}
