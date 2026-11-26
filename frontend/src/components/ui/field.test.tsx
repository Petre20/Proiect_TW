import { render, screen } from '@testing-library/react'
import { Field, FieldError, FieldLabel } from './field'
import { Input } from './input'

describe('Field', () => {
  it('links the label to an invalid input and announces the error', () => {
    render(
      <Field>
        <FieldLabel htmlFor="a">Email</FieldLabel>
        <Input id="a" aria-invalid />
        <FieldError>Required</FieldError>
      </Field>,
    )
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('renders no alert when there is no error', () => {
    render(<FieldError>{undefined}</FieldError>)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
