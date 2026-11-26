import { render, screen, within } from '@testing-library/react'
import { About } from './About'
import { HowItWorks } from './HowItWorks'

describe('About', () => {
  it('explains the idea behind the name and what can be tracked', () => {
    render(<About />)
    expect(screen.getByRole('heading', { level: 2, name: 'Well, track it.' })).toBeInTheDocument()
    expect(screen.getByText(/you can't improve what you don't track/i)).toBeInTheDocument()
    const chips = within(screen.getByRole('list', { name: 'What you can track' })).getAllByRole('listitem')
    expect(chips.map((c) => c.textContent)).toEqual(['Habits', 'Workouts', 'Goals'])
    expect(screen.getByText('And more: short articles matched to what you care about.')).toBeInTheDocument()
  })
})

describe('HowItWorks', () => {
  it('shows the three steps in order', () => {
    render(<HowItWorks />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'How it works: one daily loop, everything else follows.',
    )
    const steps = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(steps).toHaveLength(3)
    expect(steps.map((s) => within(s).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Tick or log',
      'It all adds up',
      'See your week improve',
    ])
    expect(screen.getByRole('list').tagName).toBe('OL')
  })
})
