import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, delay } from 'msw'
import { StrictMode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { Providers } from '@/app/providers'
import { queryClient } from '@/app/query-client'
import { server } from '@/test/server'
import { Component as VerifyEmailPage } from './VerifyEmailPage'

function renderPage(search: string) {
  return render(
    <StrictMode>
      <Providers>
        <MemoryRouter initialEntries={[`/auth/verify-email${search}`]}>
          <Routes>
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </MemoryRouter>
      </Providers>
    </StrictMode>,
  )
}

const token = (n: string) => `${n}`.padEnd(24, 'x')

beforeEach(() => queryClient.clear())

describe('VerifyEmailPage', () => {
  it('verifies the token exactly once, even under StrictMode', async () => {
    const bodies: unknown[] = []
    server.use(http.post('*/api/auth/verify-email', async ({ request }) => {
      bodies.push(await request.json())
      return HttpResponse.json({ message: 'ok' })
    }))
    renderPage(`?token=${token('ok')}`)
    expect(await screen.findByText('Email verified')).toBeInTheDocument()
    expect(bodies).toEqual([{ token: token('ok') }])
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/auth')
  })

  it('shows a progress message while verifying', async () => {
    server.use(http.post('*/api/auth/verify-email', async () => { await delay(100); return HttpResponse.json({ message: 'ok' }) }))
    renderPage(`?token=${token('slow')}`)
    expect(screen.getByText('Verifying your email…')).toBeInTheDocument()
    expect(await screen.findByText('Email verified')).toBeInTheDocument()
  })

  it('shows the backend message and a resend form for an invalid token', async () => {
    server.use(http.post('*/api/auth/verify-email', () =>
      HttpResponse.json({ detail: 'Tokenul de verificare nu este valid sau a expirat.' }, { status: 400 })))
    renderPage(`?token=${token('bad')}`)
    expect(await screen.findByText('Tokenul de verificare nu este valid sau a expirat.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('sends nothing and explains when the token is missing', async () => {
    let calls = 0
    server.use(http.post('*/api/auth/verify-email', () => { calls++; return HttpResponse.json({ message: 'ok' }) }))
    renderPage('')
    expect(screen.getByText('This link is missing its token.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(calls).toBe(0)
  })

  it('requests a new link for the typed address and starts a cooldown', async () => {
    let body: unknown
    server.use(http.post('*/api/auth/resend-verification', async ({ request }) => {
      body = await request.json()
      return HttpResponse.json({ message: 'ok' }, { status: 202 })
    }))
    renderPage('')
    await userEvent.type(screen.getByLabelText('Email'), ' Ana@Mail.ro ')
    await userEvent.click(screen.getByRole('button', { name: 'Send a new link' }))
    expect(await screen.findByRole('button', { name: /Resend in \d+s/ })).toBeDisabled()
    expect(body).toEqual({ email: 'ana@mail.ro' })
  })

  it('validates the email before requesting a new link', async () => {
    renderPage('')
    await userEvent.click(screen.getByRole('button', { name: 'Send a new link' }))
    expect(await screen.findByText('Enter your email.')).toBeInTheDocument()
  })
})
