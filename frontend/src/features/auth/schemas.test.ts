import { loginSchema, registerSchema } from './schemas'

const valid = { name: 'Ana', email: 'ana@mail.ro', password: 'correcthorse' }

function firstMessage(result: ReturnType<typeof registerSchema.safeParse>, field: string) {
  if (result.success) return undefined
  return result.error.issues.find((i) => i.path[0] === field)?.message
}

describe('registerSchema', () => {
  it('trims the name', () => {
    expect(registerSchema.parse({ ...valid, name: '  Ana  ' }).name).toBe('Ana')
  })

  it('rejects a name of only spaces', () => {
    expect(firstMessage(registerSchema.safeParse({ ...valid, name: '   ' }), 'name')).toBe('Enter your name.')
  })

  it('rejects a name over 100 characters', () => {
    expect(firstMessage(registerSchema.safeParse({ ...valid, name: 'a'.repeat(101) }), 'name')).toBe('Name is too long.')
  })

  it('trims and lower-cases the email', () => {
    expect(registerSchema.parse({ ...valid, email: ' ANA@Mail.RO ' }).email).toBe('ana@mail.ro')
  })

  it('rejects an empty or malformed email', () => {
    expect(firstMessage(registerSchema.safeParse({ ...valid, email: '' }), 'email')).toBe('Enter your email.')
    expect(firstMessage(registerSchema.safeParse({ ...valid, email: 'ana@' }), 'email')).toBe('Enter a valid email.')
  })

  it('rejects an email over 255 characters', () => {
    const email = `${'a'.repeat(250)}@mail.ro`
    expect(firstMessage(registerSchema.safeParse({ ...valid, email }), 'email')).toBe('Enter a valid email.')
  })

  it('enforces password length 8 to 128', () => {
    expect(firstMessage(registerSchema.safeParse({ ...valid, password: '1234567' }), 'password')).toBe(
      'Use at least 8 characters.',
    )
    expect(firstMessage(registerSchema.safeParse({ ...valid, password: 'a'.repeat(129) }), 'password')).toBe(
      'Use at most 128 characters.',
    )
    expect(registerSchema.safeParse({ ...valid, password: 'a'.repeat(128) }).success).toBe(true)
  })
})

describe('loginSchema', () => {
  it('accepts a one-character password', () => {
    expect(loginSchema.safeParse({ email: 'ana@mail.ro', password: 'x' }).success).toBe(true)
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'ana@mail.ro', password: '' })
    expect(result.success).toBe(false)
    expect(!result.success && result.error.issues[0].message).toBe('Enter your password.')
  })

  it('lower-cases the email', () => {
    expect(loginSchema.parse({ email: 'ANA@mail.ro', password: 'x' }).email).toBe('ana@mail.ro')
  })
})
