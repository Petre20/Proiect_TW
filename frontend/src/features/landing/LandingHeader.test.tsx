import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, delay } from 'msw'
import { MemoryRouter } from 'react-router'
import { Providers } from '@/app/providers'
import { queryClient } from '@/app/query-client'
import { useAuthModal } from '@/stores/auth-modal'
import { server } from '@/test/server'
import { LandingHeader } from './LandingHeader'

const user = {
  id: 1, name: 'Ana', email: 'ana@mail.ro', role: 'user', is_active: true,
  email_verified: true, interests: [], created_at: '2026-01-01T00:00:00Z',
}

function renderHeader() {
  return render(
    <Providers>
      <MemoryRouter>
        <LandingHeader />
      </MemoryRouter>
    </Providers>,
  )
}

beforeEach(() => {
  queryClient.clear()
  useAuthModal.setState({ open: false, mode: 'login', next: undefined })
})

describe('LandingHeader', () => {
  it('opens the auth modal from the Log in and Sign up buttons', async () => {
    server.use(http.get('*/api/auth/me', () => HttpResponse.json({ detail: 'x' }, { status: 401 })))
    renderHeader()
    await userEvent.click(await screen.findByRole('button', { name: 'Sign up' }))
    expect(useAuthModal.getState()).toMatchObject({ open: true, mode: 'register' })
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(useAuthModal.getState()).toMatchObject({ open: true, mode: 'login' })
  })

  it('shows a dashboard link instead of the auth buttons when logged in', async () => {
    server.use(http.get('*/api/auth/me', () => HttpResponse.json(user)))
    renderHeader()
    expect(await screen.findByRole('link', { name: 'Open dashboard' })).toHaveAttribute('href', '/dashboard')
    expect(screen.queryByRole('button', { name: 'Log in' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign up' })).not.toBeInTheDocument()
  })

  it('shows no auth controls while the session is loading', async () => {
    server.use(http.get('*/api/auth/me', async () => { await delay(80); return HttpResponse.json(user) }))
    renderHeader()
    expect(screen.queryByRole('button', { name: 'Log in' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign up' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Open dashboard' })).not.toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Open dashboard' })).toBeInTheDocument()
  })
})
