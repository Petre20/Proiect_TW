import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuthModal } from '@/stores/auth-modal'
import { LoginForm, RegisterForm } from './AuthForms'

const COPY = {
  login: { title: 'Welcome back', body: 'Log in to pick up where you left off.' },
  register: { title: 'Start building habits', body: 'Create an account. It takes a minute.' },
  'session-expired': { title: 'Your session ended', body: 'Log in again and carry on. Nothing you typed is lost.' },
} as const

export function AuthModal() {
  const { open, mode, close } = useAuthModal()
  const copy = COPY[mode]
  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.body}</DialogDescription>
        </DialogHeader>
        {mode === 'register' ? <RegisterForm variant="modal" /> : <LoginForm variant="modal" />}
      </DialogContent>
    </Dialog>
  )
}
