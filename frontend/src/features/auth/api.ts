import { queryOptions } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'

export type User = {
  id: number
  email: string
  name: string
  role: 'user' | 'admin'
  interests: string[]
}

export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: async (): Promise<User | null> => {
    try {
      return await api<User>('/auth/me')
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null
      throw e
    }
  },
  staleTime: 60_000,
  retry: false,
})
