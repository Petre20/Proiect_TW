import { http } from '@/lib/http'
import type { LoginInput, Message, RegisterInput, User } from './types'

export const authApi = {
  me: (signal?: AbortSignal) => http.get<User>('/auth/me', { signal }).then((r) => r.data),
  login: (input: LoginInput) => http.post<User>('/auth/login', input).then((r) => r.data),
  logout: () => http.post<void>('/auth/logout').then(() => undefined),
  register: (input: RegisterInput) => http.post<Message>('/auth/register', input).then((r) => r.data),
  verifyEmail: (token: string) => http.post<Message>('/auth/verify-email', { token }).then((r) => r.data),
  resendVerification: (email: string) =>
    http.post<Message>('/auth/resend-verification', { email }).then((r) => r.data),
}
