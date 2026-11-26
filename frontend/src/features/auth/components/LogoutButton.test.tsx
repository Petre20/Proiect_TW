import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, delay } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { toast } from 'sonner'
import { Providers } from '@/app/providers'
import { queryClient } from '@/app/query-client'
import { watchSession } from '@/app/session'
import { useAuthModal } from '@/stores/auth-modal'
import { server } from '@/test/server'
import { authKeys } from '../queries'
import { LogoutButton } from './LogoutButton'

const user = {
  id: 1, name: 'Ana', email: 'ana@mail.ro', role: 'user', is_active: true,
  email_verified: true, interests: [], created_at: '2026-01-01T00:00:00Z',
}

function renderButton() {
  return render(
    <Providers>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<LogoutButton />} />
          <Route path="/" element={<p>Landing page</p>} />
        </Routes>
      </MemoryRouter>
    </Providers>,
  )
}

const FAILED = 'Could not log out. Check your connection and try again.'
let errorToast: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  errorToast = vi.spyOn(toast, 'error')
  queryClient.clear()
  queryClient.setQueryData(authKeys.me(), user)
  useAuthModal.setState({ open: false, mode: 'login', next: undefined })
  watchSession()
})

afterEach(() => errorToast.mockRestore())

describe('LogoutButton', () => {
  it('logs out, clears the session and goes to the landing page', async () => {
    let calls = 0
    server.use(http.post('*/api/auth/logout', () => { calls++; return new HttpResponse(null, { status: 204 }) }))
    renderButton()
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }))
    expect(await screen.findByText('Landing page')).toBeInTheDocument()
    expect(calls).toBe(1)
    expect(queryClient.getQueryData(authKeys.me())).toBeNull()
  })

  it('sends one request on a double click', async () => {
    let calls = 0
    server.use(http.post('*/api/auth/logout', async () => { calls++; await delay(50); return new HttpResponse(null, { status: 204 }) }))
    renderButton()
    await userEvent.dblClick(screen.getByRole('button', { name: 'Log out' }))
    await screen.findByText('Landing page')
    expect(calls).toBe(1)
  })

  it('stays logged in and allows a retry when the server fails', async () => {
    server.use(http.post('*/api/auth/logout', () => HttpResponse.json({ detail: 'boom' }, { status: 500 })))
    renderButton()
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }))
    await waitFor(() => expect(errorToast).toHaveBeenCalledWith(FAILED))
    expect(screen.queryByText('Landing page')).not.toBeInTheDocument()
    expect(queryClient.getQueryData(authKeys.me())).toMatchObject({ id: 1 })
    expect(screen.getByRole('button', { name: 'Log out' })).toBeEnabled()

    server.use(http.post('*/api/auth/logout', () => new HttpResponse(null, { status: 204 })))
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }))
    expect(await screen.findByText('Landing page')).toBeInTheDocument()
    expect(queryClient.getQueryData(authKeys.me())).toBeNull()
  })

  it('stays logged in when the server is unreachable', async () => {
    server.use(http.post('*/api/auth/logout', () => HttpResponse.error()))
    renderButton()
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }))
    await waitFor(() => expect(errorToast).toHaveBeenCalledWith(FAILED))
    expect(queryClient.getQueryData(authKeys.me())).toMatchObject({ id: 1 })
  })

  it('treats a 401 as already logged out, without the session-expired modal', async () => {
    server.use(http.post('*/api/auth/logout', () => HttpResponse.json({ detail: 'Neautentificat.' }, { status: 401 })))
    renderButton()
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }))
    expect(await screen.findByText('Landing page')).toBeInTheDocument()
    expect(useAuthModal.getState().open).toBe(false)
    expect(errorToast).not.toHaveBeenCalled()
  })
})
