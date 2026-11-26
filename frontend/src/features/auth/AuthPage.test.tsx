import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Providers } from '@/app/providers'
import { Component as AuthPage } from './AuthPage'

function renderPage(entry: string) {
  return render(
    <Providers>
      <MemoryRouter initialEntries={[entry]}>
        <AuthPage />
      </MemoryRouter>
    </Providers>,
  )
}

describe('AuthPage Google errors', () => {
  it('explains a Google sign-in that did not finish', () => {
    renderPage('/auth?error=google_failed')
    expect(screen.getByRole('alert')).toHaveTextContent('Google sign-in did not finish. Try again, or use your email.')
  })

  it('explains an email that already belongs to a password account', () => {
    renderPage('/auth?error=google_email_in_use')
    expect(screen.getByRole('alert')).toHaveTextContent(
      "That Google account's email is already used by a password account. Log in with your password.",
    )
  })

  it('shows the same message in the sign-up mode', () => {
    renderPage('/auth?mode=register&error=google_failed')
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('ignores an error code it does not know', () => {
    renderPage('/auth?error=something_else')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('clears the message when switching between log in and sign up', async () => {
    renderPage('/auth?error=google_failed')
    await userEvent.click(screen.getByRole('button', { name: 'Create an account' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
