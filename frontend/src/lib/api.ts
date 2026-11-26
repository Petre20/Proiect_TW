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
  // the backend answers 403 to mutating requests without this header
  if (MUTATING.has(method)) headers.set('X-Requested-With', 'WellTrack')
  let body = init.body
  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(init.json)
  }
  const res = await fetch(`/api${path}`, { ...init, method, headers, body, credentials: 'include' })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new ApiError(res.status, typeof data?.detail === 'string' ? data.detail : res.statusText)
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}
