import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { queryClient } from '@/app/query-client'
import { FormError } from '@/components/form/FormError'
import { PasswordField } from '@/components/form/PasswordField'
import { TextField } from '@/components/form/TextField'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { ApiError } from '@/lib/http'
import { applyServerErrors } from '@/lib/forms'
import { useAuthModal } from '@/stores/auth-modal'
import { useLogin, useRegister } from '../mutations'
import { safeNext } from '../redirect'
import { loginSchema, registerSchema, type LoginValues, type RegisterValues } from '../schemas'
import { ResendButton } from './ResendButton'

type Props = { variant: 'page' | 'modal' }

// the backend sends no error code for an unverified account, only this message
const NOT_VERIFIED_PREFIX = 'Verifica adresa de email'

export function LoginForm({ variant }: Props) {
  const { setMode, close } = useAuthModal()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const login = useLogin()
  const [formError, setFormError] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginValues) {
    setFormError(null)
    setUnverifiedEmail(null)
    try {
      await login.mutateAsync(values)
    } catch (error) {
      setFormError(applyServerErrors(form, error))
      if (error instanceof ApiError && error.status === 403 && error.message.startsWith(NOT_VERIFIED_PREFIX)) {
        setUnverifiedEmail(values.email.trim().toLowerCase())
      }
      return
    }
    if (variant === 'modal') {
      close()
      await queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'auth' })
    } else {
      navigate(safeNext(params.get('next')), { replace: true })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <FormError message={formError}>
        {unverifiedEmail && <ResendButton email={unverifiedEmail} />}
      </FormError>
      <FieldGroup>
        <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
        <PasswordField control={form.control} name="password" label="Password" autoComplete="current-password" />
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Logging in…' : 'Log in'}
      </Button>
      {variant === 'modal' && (
        <Button type="button" variant="ghost" size="sm" onClick={() => setMode('register')}>
          New to WellTrack? Create an account
        </Button>
      )}
    </form>
  )
}

export function RegisterForm({ variant, onSent }: Props & { onSent?: () => void }) {
  const { setMode } = useAuthModal()
  const register = useRegister()
  const [formError, setFormError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  async function onSubmit(values: RegisterValues) {
    setFormError(null)
    try {
      await register.mutateAsync(values)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        form.setError('email', { type: 'server', message: error.message })
      } else {
        setFormError(applyServerErrors(form, error))
      }
      return
    }
    setSentTo(values.email)
    onSent?.()
  }

  if (sentTo) return <CheckInbox email={sentTo} variant={variant} />

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <FormError message={formError} />
      <FieldGroup>
        <TextField control={form.control} name="name" label="Name" autoComplete="name" />
        <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          autoComplete="new-password"
          description="At least 8 characters."
        />
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
      {variant === 'modal' && (
        <Button type="button" variant="ghost" size="sm" onClick={() => setMode('login')}>
          Already have an account? Log in
        </Button>
      )}
    </form>
  )
}

function CheckInbox({ email, variant }: { email: string; variant: Props['variant'] }) {
  const { setMode } = useAuthModal()
  return (
    <div className="grid gap-4">
      <h2 className="text-2xl">Check your inbox</h2>
      <p className="text-muted-foreground">
        We sent a link to <strong className="text-foreground">{email}</strong>. Open it to activate your account. It
        expires in 60 minutes.
      </p>
      <ResendButton email={email} startCooldown />
      {variant === 'modal' ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => setMode('login')}>
          Back to log in
        </Button>
      ) : (
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">Back to log in</Link>
        </Button>
      )}
    </div>
  )
}
