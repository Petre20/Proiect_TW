import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Providers } from '@/app/providers'
import { AuthModal } from '@/features/auth/components/AuthModal'
import { useAuthModal } from '@/stores/auth-modal'
import { Component as Styleguide } from './StyleguidePage'

function setup() {
  return render(
    <Providers>
      <MemoryRouter>
        <Styleguide />
        <AuthModal />
      </MemoryRouter>
    </Providers>,
  )
}

describe('styleguide', () => {
  beforeEach(() => useAuthModal.setState({ open: false, mode: 'login', next: undefined }))

  it('moves the progress ring when a habit is ticked', async () => {
    setup()
    expect(screen.getByRole('img', { name: 'Today: 33%' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Read 10 pages' }))
    expect(screen.getByRole('img', { name: 'Today: 67%' })).toBeInTheDocument()
  })

  it('opens the auth modal and switches between login and sign-up', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Open login modal' }))
    expect(await screen.findByRole('dialog', { name: 'Welcome back' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /create an account/i }))
    expect(await screen.findByRole('dialog', { name: 'Start building habits' })).toBeInTheDocument()
  })

  it('documents the type, layout and radius tokens', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Type, layout and radii' })).toBeInTheDocument()
    for (const token of ['text-display', 'text-title', 'text-lede', 'text-label', 'text-caption', 'max-w-page', 'max-w-form', 'px-gutter', 'py-section', 'rounded-field']) {
      expect(screen.getByText(token)).toBeInTheDocument()
    }
  })
})
