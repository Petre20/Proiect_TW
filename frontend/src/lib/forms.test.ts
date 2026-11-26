import { renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { ApiError } from './http'
import { applyServerErrors } from './forms'

function setup() {
  return renderHook(() => useForm({ defaultValues: { email: '', password: '' } })).result.current
}

describe('applyServerErrors', () => {
  it('puts field errors on matching fields and returns null', () => {
    const form = setup()
    const rest = applyServerErrors(form, new ApiError(422, 'Some fields need attention.', { email: 'Invalid' }))
    expect(rest).toBeNull()
    expect(form.getFieldState('email').error?.message).toBe('Invalid')
  })

  it('returns the message when no field error matches a form field', () => {
    const form = setup()
    const rest = applyServerErrors(form, new ApiError(422, 'Some fields need attention.', { other: 'Nope' }))
    expect(rest).toBe('Some fields need attention.')
    expect(form.getFieldState('email').error).toBeUndefined()
    expect(form.getFieldState('password').error).toBeUndefined()
  })

  it('returns the message of an error without field errors', () => {
    const form = setup()
    expect(applyServerErrors(form, new ApiError(409, 'Adresa de email este deja folosita.'))).toBe(
      'Adresa de email este deja folosita.',
    )
  })

  it('returns a generic message for an unknown error', () => {
    expect(applyServerErrors(setup(), new Error('boom'))).toBe('Something went wrong.')
  })
})
