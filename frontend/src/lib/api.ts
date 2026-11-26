/**
 * Fetch wrapper for the FastAPI backend.
 * - same-origin in dev (Vite proxies /api), so the HttpOnly session cookie just works
 * - every mutating request needs `X-Requested-With: WellTrack` or the backend answers 403
 * - backend error messages (`detail`) are Romanian and are surfaced as-is
 */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  if (MUTATING.has(method)) headers.set('X-Requested-With', 'WellTrack')
  let body = init.body
  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(init.json)
  }
  const res = await fetch(`/api${path}`, { ...init, method, headers, body, credentials: 'include' })
  if (!res.ok) {
    let message = res.statusText
    try {
      const data = await res.json()
      message = typeof data.detail === 'string' ? data.detail : message
    } catch {
      /* body was not JSON */
    }
    throw new ApiError(res.status, message)
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}
