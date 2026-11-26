import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { TextField } from '@/components/form/TextField'
import { Button } from '@/components/ui/button'
import { useCooldown } from '@/hooks/use-cooldown'
import { useResendVerification } from '../mutations'
import { loginSchema } from '../schemas'

const schema = loginSchema.pick({ email: true })

export function ResendForm() {
  const resend = useResendVerification()
  const { remaining, active, start } = useCooldown(60)
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  return (
    <form
      noValidate
      className="mt-5 grid gap-3"
      onSubmit={form.handleSubmit(({ email }) => resend.mutate(email, { onSuccess: start }))}
    >
      <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
      <Button type="submit" variant="outline" disabled={active || resend.isPending}>
        {active ? `Resend in ${remaining}s` : 'Send a new link'}
      </Button>
      {resend.isSuccess && <p className="text-sm text-muted-foreground">If the account exists, a new link is on its way.</p>}
      {resend.isError && <p role="alert" className="text-sm font-semibold text-destructive-text">{resend.error.message}</p>}
    </form>
  )
}
