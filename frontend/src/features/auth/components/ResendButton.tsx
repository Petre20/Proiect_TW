import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useCooldown } from '@/hooks/use-cooldown'
import { useResendVerification } from '../mutations'

export function ResendButton({ email, startCooldown = false }: { email: string; startCooldown?: boolean }) {
  const resend = useResendVerification()
  const { remaining, active, start } = useCooldown(60)

  useEffect(() => {
    if (startCooldown) start()
  }, [startCooldown, start])

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={active || resend.isPending}
        onClick={() => resend.mutate(email, { onSuccess: start })}
      >
        {active ? `Resend in ${remaining}s` : 'Resend verification email'}
      </Button>
      {resend.isSuccess && <p className="text-sm text-muted-foreground">If the account exists, a new link is on its way.</p>}
      {resend.isError && <p role="alert" className="text-sm font-semibold text-destructive-text">{resend.error.message}</p>}
    </div>
  )
}
