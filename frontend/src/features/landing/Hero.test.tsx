import { render, screen } from '@testing-library/react'
import confetti from 'canvas-confetti'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { Providers } from '@/app/providers'
import { queryClient } from '@/app/query-client'
import { server } from '@/test/server'
import { Hero } from './Hero'

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

function renderHero() {
  return render(
    <Providers>
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    </Providers>,
  )
}

const tick = (name: string) => userEvent.click(screen.getByRole('button', { name }))
const DONE = 'Day cleared. That is the whole trick.'

beforeEach(() => {
  vi.mocked(confetti).mockClear()
  queryClient.clear()
  server.use(http.get('*/api/auth/me', () => HttpResponse.json({ detail: 'x' }, { status: 401 })))
})

describe('Hero', () => {
  it('has one headline and the two calls to action', () => {
    renderHero()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Build habits that stick.')
    expect(screen.getByRole('link', { name: 'Start building' })).toHaveAttribute('href', '/auth?mode=register')
    expect(screen.getByRole('link', { name: 'See what people track' })).toHaveAttribute('href', '#pick')
  })

  it('starts with one of three habits ticked', () => {
    renderHero()
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33')
    expect(screen.getByRole('button', { name: 'Morning run' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Nice. Keep going.')).toBeInTheDocument()
    expect(screen.queryByText(DONE)).not.toBeInTheDocument()
  })

  it('encourages after another tick', async () => {
    renderHero()
    await tick('Read 10 pages')
    expect(screen.getByText('2 of 3')).toBeInTheDocument()
    expect(screen.getByText('Nice. Keep going.')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67')
  })

  it('clears the day when all three are ticked, and takes it back when one is unticked', async () => {
    renderHero()
    await tick('Read 10 pages')
    await tick('Cook a proper meal')
    expect(screen.getByText('3 of 3')).toBeInTheDocument()
    expect(screen.getByText(DONE)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')

    await tick('Morning run')
    expect(screen.getByText('2 of 3')).toBeInTheDocument()
    expect(screen.queryByText(DONE)).not.toBeInTheDocument()
  })

  it('shows 0 of 3 and an empty message when everything is unticked', async () => {
    renderHero()
    await tick('Morning run')
    expect(screen.getByText('0 of 3')).toBeInTheDocument()
    expect(screen.queryByText('Nice. Keep going.')).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('shows Monday, Tuesday and Wednesday as completed in the week strip', () => {
    renderHero()
    const dots = Array.from(screen.getByLabelText('This week').querySelectorAll('i'))
    expect(dots.slice(0, 4).map((d) => d.getAttribute('data-state'))).toEqual(['done', 'done', 'done', 'today'])
  })

  it('lights today in the week strip only when the day is cleared', async () => {
    renderHero()
    const strip = screen.getByLabelText('This week')
    expect(strip.querySelector('[data-state="today"]')).not.toBeNull()
    await tick('Read 10 pages')
    await tick('Cook a proper meal')
    expect(strip.querySelector('[data-state="today-done"]')).not.toBeNull()
  })

  it('celebrates from today\'s dot only when the day gets cleared', async () => {
    renderHero()
    await tick('Read 10 pages')
    expect(confetti).not.toHaveBeenCalled()
    await tick('Cook a proper meal')
    expect(confetti).toHaveBeenCalledTimes(1)
    expect(confetti).toHaveBeenCalledWith(expect.objectContaining({ origin: expect.any(Object), disableForReducedMotion: true }))

    await tick('Morning run')
    expect(confetti).toHaveBeenCalledTimes(1)
    await tick('Morning run')
    expect(confetti).toHaveBeenCalledTimes(2)
  })

  it('adds a ring pulse on today\'s dot once the day is cleared', async () => {
    renderHero()
    const strip = screen.getByLabelText('This week')
    expect(strip.querySelector('[data-effect="ring"]')).toBeNull()
    await tick('Read 10 pages')
    await tick('Cook a proper meal')
    expect(strip.querySelector('[data-effect="ring"]')).not.toBeNull()
  })
})
