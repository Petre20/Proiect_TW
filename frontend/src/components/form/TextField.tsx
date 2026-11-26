import { useId, type ComponentProps, type ReactNode } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type TextFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: string
  description?: string
  endSlot?: ReactNode
} & Omit<ComponentProps<'input'>, 'name' | 'defaultValue' | 'value'>

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  endSlot,
  className,
  ...inputProps
}: TextFieldProps<T>) {
  const id = useId()
  const errorId = `${id}-error`
  const descriptionId = `${id}-description`

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const describedBy = [description && descriptionId, fieldState.error && errorId].filter(Boolean).join(' ')
        return (
          <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <div className="relative">
              <Input
                {...inputProps}
                {...field}
                id={id}
                aria-invalid={fieldState.invalid || undefined}
                aria-describedby={describedBy || undefined}
                className={cn(endSlot && 'pr-14', className)}
              />
              {endSlot}
            </div>
            {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
            <FieldError id={errorId}>{fieldState.error?.message}</FieldError>
          </Field>
        )
      }}
    />
  )
}
