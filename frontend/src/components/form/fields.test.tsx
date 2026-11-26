import { useEffect } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { PasswordField } from './PasswordField'
import { TextField } from './TextField'

let form: UseFormReturn<{ email: string; password: string }>

function Harness() {
  const current = useForm({ defaultValues: { email: '', password: '' } })
  useEffect(() => {
    form = current
  })
  return (
    <>
      <TextField control={current.control} name="email" label="Email" type="email" />
      <PasswordField control={current.control} name="password" label="Password" />
    </>
  )
}

describe('TextField', () => {
  it('links label, input and error', () => {
    render(<Harness />)
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid', 'true')
    act(() => form.setError('email', { message: 'Enter a valid email.' }))
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent('Enter a valid email.')
    expect(input.getAttribute('aria-describedby')).toContain(error.id)
  })
})

describe('PasswordField', () => {
  it('toggles the input type and its button label', async () => {
    render(<Harness />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true')
  })
})
