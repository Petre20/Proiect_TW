import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoogleSection } from './GoogleButton'

let clicks: { prevented: boolean }[] = []
const swallowNavigation = (e: MouseEvent) => {
  clicks.push({ prevented: e.defaultPrevented })
  e.preventDefault()
}

beforeEach(() => {
  clicks = []
  vi.stubEnv('VITE_GOOGLE_LOGIN', 'true')
  document.addEventListener('click', swallowNavigation)
})
afterEach(() => {
  document.removeEventListener('click', swallowNavigation)
  vi.unstubAllEnvs()
})

describe('GoogleSection', () => {
  it('renders a link to the backend, the divider and the given label', () => {
    render(<GoogleSection label="Continue with Google" />)
    expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute('href', '/api/auth/google/start')
    expect(screen.getByText('or with email')).toBeInTheDocument()
  })

  it('uses the sign-up wording when asked', () => {
    render(<GoogleSection label="Sign up with Google" />)
    expect(screen.getByRole('link', { name: 'Sign up with Google' })).toBeInTheDocument()
  })

  it('passes a safe next path to the backend', () => {
    render(<GoogleSection label="Continue with Google" next="/habits" />)
    expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute(
      'href',
      '/api/auth/google/start?next=%2Fhabits',
    )
  })

  it('renders nothing when Google login is switched off', () => {
    vi.stubEnv('VITE_GOOGLE_LOGIN', 'false')
    const { container } = render(<GoogleSection label="Continue with Google" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows a busy state after the click and blocks a second click', async () => {
    render(<GoogleSection label="Continue with Google" />)
    const link = screen.getByRole('link', { name: 'Continue with Google' })
    await userEvent.click(link)
    expect(clicks[0].prevented).toBe(false)
    const busy = screen.getByRole('link', { name: 'Opening Google…' })
    expect(busy).toHaveAttribute('aria-busy', 'true')
    expect(busy).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(busy)
    expect(clicks[1].prevented).toBe(true)
  })

  it('goes back to normal when the page is restored from the back/forward cache', async () => {
    render(<GoogleSection label="Continue with Google" />)
    await userEvent.click(screen.getByRole('link', { name: 'Continue with Google' }))
    expect(screen.getByRole('link', { name: 'Opening Google…' })).toBeInTheDocument()
    act(() => {
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    })
    expect(screen.getByRole('link', { name: 'Continue with Google' })).not.toHaveAttribute('aria-busy')
  })
})
