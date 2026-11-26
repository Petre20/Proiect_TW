import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { Providers } from '@/app/providers'
import { queryClient } from '@/app/query-client'
import { server } from '@/test/server'
import { useAuthModal } from '@/stores/auth-modal'
import { RegisterForm } from './AuthForms'

function renderRegister(variant: 'page' | 'modal' = 'page', onSent?: () => void) {
  return render(
    <Providers>
      <MemoryRouter>
        <RegisterForm variant={variant} onSent={onSent} />
      </MemoryRouter>
    </Providers>,
  )
}

async function fill(name = 'Ana', email = 'ana@mail.ro', password = 'correcthorse', confirm = password) {
  if (name) await userEvent.type(screen.getByLabelText('Name'), name)
  await userEvent.type(screen.getByLabelText('Email'), email)
  await userEvent.type(screen.getByLabelText('Password'), password)
  await userEvent.type(screen.getByLabelText('Confirm password'), confirm)
}

const submit = () => userEvent.click(screen.getByRole('button', { name: 'Create account' }))

beforeEach(() => {
  queryClient.clear()
  useAuthModal.setState({ open: true, mode: 'register', next: undefined })
})

describe('RegisterForm', () => {
  it('shows validation messages for an empty form', async () => {
    renderRegister()
    await submit()
    expect(await screen.findByText('Enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Enter your email.')).toBeInTheDocument()
    expect(screen.getByText('Use at least 8 characters.', { selector: '[role=alert]' })).toBeInTheDocument()
  })

  it('does not send a 7-character password', async () => {
    let calls = 0
    server.use(http.post('*/api/auth/register', () => { calls++; return HttpResponse.json({ message: 'ok' }, { status: 201 }) }))
    renderRegister()
    await fill('Ana', 'ana@mail.ro', '1234567')
    await submit()
    expect(await screen.findByText('Use at least 8 characters.', { selector: '[role=alert]' })).toBeInTheDocument()
    expect(calls).toBe(0)
  })

  it('does not send when the confirmation differs', async () => {
    let calls = 0
    server.use(http.post('*/api/auth/register', () => { calls++; return HttpResponse.json({ message: 'ok' }, { status: 201 }) }))
    renderRegister()
    await fill('Ana', 'ana@mail.ro', 'correcthorse', 'correcthorsf')
    await submit()
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toHaveAttribute('aria-invalid', 'true')
    expect(calls).toBe(0)
  })

  it('rejects a name made only of spaces', async () => {
    renderRegister()
    await fill('   ')
    await submit()
    expect(await screen.findByText('Enter your name.')).toBeInTheDocument()
  })

  it('swaps to check-inbox after success, with the resend already cooling down', async () => {
    let body: unknown
    const onSent = vi.fn()
    server.use(http.post('*/api/auth/register', async ({ request }) => {
      body = await request.json()
      return HttpResponse.json({ message: 'ok' }, { status: 201 })
    }))
    renderRegister('page', onSent)
    await fill('  Ana ', ' ANA@Mail.ro ')
    await submit()
    expect(await screen.findByText('Check your inbox')).toBeInTheDocument()
    expect(screen.getByText('ana@mail.ro')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Resend in \d+s/ })).toBeDisabled()
    expect(body).toEqual({ name: 'Ana', email: 'ana@mail.ro', password: 'correcthorse' })
    expect(onSent).toHaveBeenCalledOnce()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
  })

  it('puts an already-used email on the email field only', async () => {
    server.use(http.post('*/api/auth/register', () => HttpResponse.json({ detail: 'Adresa de email este deja folosita.' }, { status: 409 })))
    renderRegister()
    await fill()
    await submit()
    expect(await screen.findByText('Adresa de email este deja folosita.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Password')).not.toHaveAttribute('aria-invalid', 'true')
    expect(screen.getAllByRole('alert')).toHaveLength(1)
  })

  it('shows a server validation error on the password field', async () => {
    server.use(http.post('*/api/auth/register', () =>
      HttpResponse.json({ detail: [{ loc: ['body', 'password'], msg: 'Too weak' }] }, { status: 422 })))
    renderRegister()
    await fill()
    await submit()
    expect(await screen.findByText('Too weak')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true')
  })

  it('switches the modal back to login from check-inbox', async () => {
    server.use(http.post('*/api/auth/register', () => HttpResponse.json({ message: 'ok' }, { status: 201 })))
    renderRegister('modal')
    await fill()
    await submit()
    await userEvent.click(await screen.findByRole('button', { name: 'Back to log in' }))
    expect(useAuthModal.getState().mode).toBe('login')
  })

  it('links back to the login form on the page', async () => {
    server.use(http.post('*/api/auth/register', () => HttpResponse.json({ message: 'ok' }, { status: 201 })))
    renderRegister('page')
    await fill()
    await submit()
    expect(await screen.findByRole('link', { name: 'Back to log in' })).toHaveAttribute('href', '/auth')
  })
})
