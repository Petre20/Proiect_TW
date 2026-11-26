import { queryOptions } from '@tanstack/react-query'
import { ApiError } from '@/lib/http'
import { authApi } from './api'

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}

export const meQuery = queryOptions({
  queryKey: authKeys.me(),
  queryFn: async ({ signal }) => {
    try {
      return await authApi.me(signal)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null
      throw e
    }
  },
  staleTime: 60_000,
  retry: false,
})
