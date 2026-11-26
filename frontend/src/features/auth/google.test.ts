import { googleLoginEnabled, googleStartUrl } from './google'

describe('googleStartUrl', () => {
  it('points at the backend start endpoint', () => {
    expect(googleStartUrl()).toBe('/api/auth/google/start')
  })

  it('carries a local next path', () => {
    expect(googleStartUrl('/habits?week=2')).toBe('/api/auth/google/start?next=%2Fhabits%3Fweek%3D2')
  })

  it.each([null, undefined, '', '//evil.com', 'https://evil.com', '/\\evil.com', 'habits'])(
    'drops an unsafe next (%j)',
    (next) => {
      expect(googleStartUrl(next)).toBe('/api/auth/google/start')
    },
  )
})

describe('googleLoginEnabled', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('is off unless VITE_GOOGLE_LOGIN is "true"', () => {
    vi.stubEnv('VITE_GOOGLE_LOGIN', 'false')
    expect(googleLoginEnabled()).toBe(false)
    vi.stubEnv('VITE_GOOGLE_LOGIN', '')
    expect(googleLoginEnabled()).toBe(false)
  })

  it('is on when VITE_GOOGLE_LOGIN is "true"', () => {
    vi.stubEnv('VITE_GOOGLE_LOGIN', 'true')
    expect(googleLoginEnabled()).toBe(true)
  })
})
