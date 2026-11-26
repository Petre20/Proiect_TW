import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { HabitPicker } from './HabitPicker'

function renderPicker() {
  return render(
    <MemoryRouter>
      <HabitPicker />
    </MemoryRouter>,
  )
}

const NAMES = [
  'Morning run',
  'Cook a proper meal',
  'Read 10 pages',
  'Stretch and breathe',
  'Weekend ride',
  'Lights out by 23:00',
]

const add = (name: string) => userEvent.click(screen.getByRole('button', { name: `Add ${name}` }))
const count = () => screen.getByRole('status')
const cta = () => screen.getByRole('link', { name: /^Start with / })

describe('HabitPicker', () => {
  it('renders the six habit cards, each with an illustration', () => {
    renderPicker()
    const cards = screen.getAllByRole('listitem')
    expect(cards).toHaveLength(6)
    expect(cards.map((c) => within(c).getByRole('heading', { level: 3 }).textContent)).toEqual(NAMES)
    for (const card of cards) expect(within(card).getByRole('img')).toBeInTheDocument()
  })

  it('is the target of the hero link', () => {
    const { container } = renderPicker()
    expect(container.querySelector('#pick')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('What are you building?')
  })

  it('starts with nothing picked and a blank-slate call to action', () => {
    renderPicker()
    expect(count()).toHaveTextContent('0 habits picked')
    expect(cta()).toHaveTextContent('Start with a blank slate')
  })

  it('counts one pick in the singular', async () => {
    renderPicker()
    await add('Morning run')
    expect(count()).toHaveTextContent('1 habit picked')
    expect(cta()).toHaveTextContent('Start with this one')
    expect(screen.getByRole('button', { name: 'Add Morning run' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('counts several picks in the plural', async () => {
    renderPicker()
    await add('Morning run')
    await add('Read 10 pages')
    expect(count()).toHaveTextContent('2 habits picked')
    expect(cta()).toHaveTextContent('Start with these 2')
  })

  it('goes back to the blank slate when the picks are removed', async () => {
    renderPicker()
    await add('Weekend ride')
    await add('Weekend ride')
    expect(count()).toHaveTextContent('0 habits picked')
    expect(cta()).toHaveTextContent('Start with a blank slate')
    expect(screen.getByRole('button', { name: 'Add Weekend ride' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('links the call to action to sign-up', () => {
    renderPicker()
    expect(cta()).toHaveAttribute('href', '/auth?mode=register')
  })
})
