import { Button } from '@/components/ui/button'
import { useAuthModal } from '@/stores/auth-modal'

type Props = { variant: 'page' | 'modal' }

export function LoginForm({ variant }: Props) {
  const { setMode } = useAuthModal()
  return (
    <div className="grid gap-3 text-sm text-muted-foreground">
      <p>Login form goes here (F1). Rendered as: {variant}.</p>
      {variant === 'modal' && (
        <Button variant="ghost" size="sm" onClick={() => setMode('register')}>
          New to WellTrack? Create an account
        </Button>
      )}
    </div>
  )
}

export function RegisterForm({ variant }: Props) {
  const { setMode } = useAuthModal()
  return (
    <div className="grid gap-3 text-sm text-muted-foreground">
      <p>Register form goes here (F1). After submit it shows "Check your inbox". Rendered as: {variant}.</p>
      {variant === 'modal' && (
        <Button variant="ghost" size="sm" onClick={() => setMode('login')}>
          Already have an account? Log in
        </Button>
      )}
    </div>
  )
}
