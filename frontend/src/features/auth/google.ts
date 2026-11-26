import { isLocalPath } from './redirect'

export const googleLoginEnabled = () => import.meta.env.VITE_GOOGLE_LOGIN === 'true'

export function googleStartUrl(next?: string | null): string {
  const base = '/api/auth/google/start'
  return isLocalPath(next) ? `${base}?next=${encodeURIComponent(next)}` : base
}
