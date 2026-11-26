import axios, { isAxiosError } from 'axios'

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

type ValidationIssue = { loc: (string | number)[]; msg: string }

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (!isAxiosError(error)) return new ApiError(0, 'Something went wrong.')
  if (!error.response) return new ApiError(0, 'The server is not reachable. Check your connection and try again.')

  const { status, data } = error.response
  const detail = (data as { detail?: unknown } | undefined)?.detail
  if (typeof detail === 'string') return new ApiError(status, detail)
  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of detail as ValidationIssue[]) {
      const field = String(issue.loc.at(-1))
      fieldErrors[field] ??= issue.msg
    }
    return new ApiError(status, 'Some fields need attention.', fieldErrors)
  }
  return new ApiError(status, error.message)
}

export const http = axios.create({
  baseURL: '/api',
  withCredentials: true,
  // the backend answers 403 to mutating requests without this header
  headers: { 'X-Requested-With': 'WellTrack' },
})

let onUnauthorized: (() => void) | undefined
const SESSION_PROBES = ['/auth/me', '/auth/login']

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

http.interceptors.response.use(undefined, (error) => {
  const apiError = toApiError(error)
  const url = isAxiosError(error) ? (error.config?.url ?? '') : ''
  if (apiError.status === 401 && !SESSION_PROBES.includes(url)) onUnauthorized?.()
  return Promise.reject(apiError)
})
