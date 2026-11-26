export type User = {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  is_active: boolean
  email_verified: boolean
  interests: string[]
  created_at: string
}

export type LoginInput = { email: string; password: string }
export type RegisterInput = { name: string; email: string; password: string }
export type Message = { message: string }
