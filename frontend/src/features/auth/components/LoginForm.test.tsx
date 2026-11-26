import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, delay } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { Providers } from '@/app/providers'
import { queryClient } from '@/app/query-client'
import { server } from '@/test/server'
import { useAuthModal } from '@/stores/auth-modal'
import { LoginForm } from './AuthForms'

const user = {
  id: 1, name: 'Ana', email: 'ana@mail.ro', role: 'user', is_active: true,
  email_verified: true, interests: [], created_at: '2026-01-01T00:00:00Z',
}

function renderLogin(entry = '/auth', variant: 'page' | 'modal' = 'page') {
  return render(
    <Providers>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/auth" element={<LoginForm variant={variant} />} />
          <Route path="/dashboard" element={<p>Dashboard page</p>} />
          <Route path="/habits" element={<p>Habits page</p>} />
        </Routes>
      </MemoryRouter>
    </Providers>,
  )
}

async function fillAndSubmit(email = 'ana@mail.ro', password = 'correcthorse') {
  await userEvent.type(screen.getByLabelText('Email'), email)
  await userEvent.type(screen.getByLabelText('Password'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
}

beforeEach(() => {
  queryClient.clear()
  useAuthModal.setState({ open: false, mode: 'login', next: undefined })
})

describe('LoginForm', () => {
  it('shows validation messages and sends nothing when empty', async () => {
    let calls = 0
    server.use(http.post('*/api/auth/login', () => { calls++; return HttpResponse.json(user) }))
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Enter your email.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(calls).toBe(0)
  })

  it('goes to the next path after a successful login', async () => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.json(user)))
    renderLogin('/auth?next=/habits')
    await fillAndSubmit()
    expect(await screen.findByText('Habits page')).toBeInTheDocument()
  })

  it('ignores a next that points off-site', async () => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.json(user)))
    renderLogin('/auth?next=//evil.com')
    await fillAndSubmit()
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
  })

  it('shows the backend message for wrong credentials and re-enables the button', async () => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.json({ detail: 'Email sau parola incorecta.' }, { status: 401 })))
    renderLogin()
    await fillAndSubmit()
    expect(await screen.findByText('Email sau parola incorecta.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled()
  })

  it('offers a resend when the email is not verified', async () => {
    let resendBody: unknown
    server.use(
      http.post('*/api/auth/login', () =>
        HttpResponse.json({ detail: 'Verifica adresa de email inainte de autentificare.' }, { status: 403 })),
      http.post('*/api/auth/resend-verification', async ({ request }) => {
        resendBody = await request.json()
        return HttpResponse.json({ message: 'ok' }, { status: 202 })
      }),
    )
    renderLogin()
    await fillAndSubmit()
    await userEvent.click(await screen.findByRole('button', { name: 'Resend verification email' }))
    expect(await screen.findByRole('button', { name: /Resend in \d+s/ })).toBeDisabled()
    expect(resendBody).toEqual({ email: 'ana@mail.ro' })
  })

  it('does not offer a resend for other 403 errors', async () => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.json({ detail: 'Contul nu este activ.' }, { status: 403 })))
    renderLogin()
    await fillAndSubmit()
    expect(await screen.findByText('Contul nu este activ.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resend verification email' })).not.toBeInTheDocument()
  })

  it('reports an unreachable server and re-enables the button', async () => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.error()))
    renderLogin()
    await fillAndSubmit()
    expect(
      await screen.findByText('The server is not reachable. Check your connection and try again.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled()
  })

  it('sends one request on a double click', async () => {
    let calls = 0
    server.use(http.post('*/api/auth/login', async () => { calls++; await delay(50); return HttpResponse.json(user) }))
    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'ana@mail.ro')
    await userEvent.type(screen.getByLabelText('Password'), 'correcthorse')
    await userEvent.dblClick(screen.getByRole('button', { name: 'Log in' }))
    await screen.findByText('Dashboard page')
    expect(calls).toBe(1)
  })

  it('closes the modal and stays put after login in the modal', async () => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.json(user)))
    useAuthModal.setState({ open: true, mode: 'session-expired' })
    renderLogin('/auth', 'modal')
    await fillAndSubmit()
    await waitFor(() => expect(useAuthModal.getState().open).toBe(false))
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument()
  })

  describe('with Google login switched on', () => {
    beforeEach(() => vi.stubEnv('VITE_GOOGLE_LOGIN', 'true'))
    afterEach(() => vi.unstubAllEnvs())

    it('offers Google first, above the email field, and keeps the next path', () => {
      renderLogin('/auth?next=/habits')
      const google = screen.getByRole('link', { name: 'Continue with Google' })
      expect(google).toHaveAttribute('href', '/api/auth/google/start?next=%2Fhabits')
      expect(google.compareDocumentPosition(screen.getByLabelText('Email')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it('drops an unsafe next path', () => {
      renderLogin('/auth?next=//evil.com')
      expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute('href', '/api/auth/google/start')
    })

    it('sends the user back to the page they were on from the modal', () => {
      renderLogin('/auth', 'modal')
      expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute(
        'href',
        '/api/auth/google/start?next=%2Fauth',
      )
    })
  })

  it('shows no Google button by default', () => {
    renderLogin()
    expect(screen.queryByRole('link', { name: /Google/ })).not.toBeInTheDocument()
  })
})
