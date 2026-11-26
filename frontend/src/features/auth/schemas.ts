import { z } from 'zod'

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Enter your email.')
  .max(255, 'Enter a valid email.')
  .pipe(z.email('Enter a valid email.'))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.').max(128, 'Use at most 128 characters.'),
})

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(100, 'Name is too long.'),
  email,
  password: z.string().min(8, 'Use at least 8 characters.').max(128, 'Use at most 128 characters.'),
})

export type LoginValues = z.input<typeof loginSchema>
export type RegisterValues = z.input<typeof registerSchema>
