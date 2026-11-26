import { safeNext } from './redirect'

describe('safeNext', () => {
  it('keeps a local path with its query', () => {
    expect(safeNext('/habits?x=1')).toBe('/habits?x=1')
  })

  it.each([null, undefined, '', '//evil.com', 'https://evil.com', '/\\evil.com', 'habits'])(
    'falls back to the dashboard for %j',
    (value) => {
      expect(safeNext(value)).toBe('/dashboard')
    },
  )
})
