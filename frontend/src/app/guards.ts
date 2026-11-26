import { redirect } from 'react-router'
import { meQuery } from '@/features/auth/api'
import { queryClient } from './query-client'

/** Dev only: skip login checks so the shell can be explored without the backend running. */
const bypass = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export async function requireAuth({ request }: { request: Request }) {
  if (bypass) return null
  const me = await queryClient.ensureQueryData(meQuery)
  if (!me) {
    const url = new URL(request.url)
    throw redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`)
  }
  // TODO(F1.5): if onboarding is not finished, redirect to /onboarding (needs the backend flag).
  return null
}

export async function requireAdmin(args: { request: Request }) {
  await requireAuth(args)
  if (bypass) return null
  const me = await queryClient.ensureQueryData(meQuery)
  if (me?.role !== 'admin') throw redirect('/dashboard')
  return null
}

export async function requireGuest() {
  if (bypass) return null
  const me = await queryClient.ensureQueryData(meQuery)
  if (me) throw redirect('/dashboard')
  return null
}
