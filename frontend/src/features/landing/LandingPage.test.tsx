import { render, screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { Providers } from '@/app/providers'
import { queryClient } from '@/app/query-client'
import { server } from '@/test/server'
import { Component as LandingPage } from './LandingPage'

function renderPage() {
  return render(
    <Providers>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </Providers>,
  )
}

beforeEach(() => {
  queryClient.clear()
  server.use(http.get('*/api/auth/me', () => HttpResponse.json({ detail: 'x' }, { status: 401 })))
})

describe('LandingPage', () => {
  it('has one h1 and the sections in order', () => {
    renderPage()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Today, Thursday',
      'What are you building?',
      'Well, track it.',
      'How it works: one daily loop, everything else follows.',
      'Start with one habit.',
    ])
  })

  it('has no streak wording anywhere', () => {
    const { container } = renderPage()
    expect(container.textContent).not.toMatch(/streak|Missed a day/i)
  })

  it('ends with sign-up and log-in links', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/auth?mode=register')
    expect(screen.getByRole('link', { name: 'I already have one' })).toHaveAttribute('href', '/auth')
  })

  it('has a footer with the tagline, working links and the copyright', () => {
    renderPage()
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByText('Track your habits, workouts and more. Everything in one place.')).toBeInTheDocument()
    const nav = within(footer).getByRole('navigation', { name: 'Footer' })
    const hrefs = Object.fromEntries(within(nav).getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')]))
    expect(hrefs).toEqual({
      'What to track': '#pick',
      'How it works': '#how-it-works',
      'Log in': '/auth',
      'Sign up': '/auth?mode=register',
    })
    expect(within(footer).getByText('© 2026 WellTrack')).toBeInTheDocument()
  })

  it('has anchor targets for the footer links', () => {
    const { container } = renderPage()
    expect(container.querySelector('#pick')).not.toBeNull()
    expect(container.querySelector('#how-it-works')).not.toBeNull()
  })
})
