import { useState } from 'react'
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
  const [sent, setSent] = useState(false)
  const [seen, setSeen] = useState({ mode, open })
  if (seen.mode !== mode || seen.open !== open) {
    setSeen({ mode, open })
    setSent(false)
  }
  const checkInbox = sent && mode === 'register'
  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader className={checkInbox ? 'sr-only' : undefined}>
          <DialogTitle>{checkInbox ? 'Check your inbox' : copy.title}</DialogTitle>
          <DialogDescription>{checkInbox ? 'Confirm your email to finish signing up.' : copy.body}</DialogDescription>
        </DialogHeader>
        {mode === 'register' ? <RegisterForm variant="modal" onSent={() => setSent(true)} /> : <LoginForm variant="modal" />}
      </DialogContent>
    </Dialog>
  )
}
