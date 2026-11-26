import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { ApiError } from './http'

export function applyServerErrors<T extends FieldValues>(form: UseFormReturn<T>, error: unknown): string | null {
  if (!(error instanceof ApiError)) return 'Something went wrong.'
  const fields = Object.keys(form.getValues())
  let matched = false
  for (const [name, message] of Object.entries(error.fieldErrors)) {
    if (!fields.includes(name)) continue
    form.setError(name as Path<T>, { type: 'server', message })
    matched = true
  }
  return matched ? null : error.message
}
