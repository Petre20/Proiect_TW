import { useSearchParams } from 'react-router'
import { LoginForm, RegisterForm } from './components/AuthForms'

const COPY = {
  login: { title: 'Welcome back', body: 'Log in to pick up where you left off.', switchText: 'New to WellTrack?', switchLabel: 'Create an account' },
  register: { title: 'Start building habits', body: 'Create an account. It takes a minute.', switchText: 'Already have an account?', switchLabel: 'Log in' },
} as const

export function Component() {
  const [params, setParams] = useSearchParams()
  const mode = params.get('mode') === 'register' ? 'register' : 'login'
  const copy = COPY[mode]

  function switchMode() {
    const next = new URLSearchParams(params)
    if (mode === 'login') next.set('mode', 'register')
    else next.delete('mode')
    setParams(next)
  }

  return (
    <>
      <h1 className="mb-1 text-2xl">{copy.title}</h1>
      <p className="mb-5 text-muted-foreground">{copy.body}</p>
      {mode === 'register' ? <RegisterForm variant="page" /> : <LoginForm variant="page" />}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        {copy.switchText}{' '}
        <button type="button" className="cursor-pointer font-bold text-foreground underline" onClick={switchMode}>
          {copy.switchLabel}
        </button>
      </p>
    </>
  )
}
