import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { authApi } from './api'
import { ResendForm } from './components/ResendForm'

export function Component() {
  const token = useSearchParams()[0].get('token') ?? ''

  // a query rather than a mutation: the token is single-use and a query is deduplicated under StrictMode
  const verify = useQuery({
    queryKey: ['auth', 'verify', token],
    queryFn: () => authApi.verifyEmail(token),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  if (verify.isSuccess) {
    return (
      <div className="grid gap-4">
        <h1 className="text-2xl">Email verified</h1>
        <p className="text-muted-foreground">Your account is ready. Log in to get started.</p>
        <Button asChild>
          <Link to="/auth">Log in</Link>
        </Button>
      </div>
    )
  }

  if (!token || verify.isError) {
    return (
      <div>
        <h1 className="mb-1 text-2xl">Verification failed</h1>
        <p role="alert" className="text-muted-foreground">
          {token ? verify.error?.message : 'This link is missing its token.'}
        </p>
        <ResendForm />
      </div>
    )
  }

  return (
    <div aria-live="polite">
      <h1 className="mb-1 text-2xl">Verifying your email…</h1>
      <p className="text-muted-foreground">This takes a moment.</p>
    </div>
  )
}
