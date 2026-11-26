import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import { TextField, type TextFieldProps } from './TextField'

export function PasswordField<T extends FieldValues>(props: Omit<TextFieldProps<T>, 'type' | 'endSlot'>) {
  const [visible, setVisible] = useState(false)
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      endSlot={
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-xl text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </button>
      }
    />
  )
}
