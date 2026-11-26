import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('keeps the browser focus outline so keyboard users can see where they are', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' }).className).not.toMatch(/(^|\s)outline-none(\s|$)/)
  })
})
