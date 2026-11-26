import * as React from 'react'
import { cn } from '@/lib/utils'

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field-group" className={cn('grid gap-4', className)} {...props} />
}

function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field" className={cn('grid gap-1.5', className)} {...props} />
}

function FieldLabel({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="field-label"
      className={cn('text-label font-bold text-foreground', className)}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="field-description" className={cn('text-sm text-muted-foreground', className)} {...props} />
}

function FieldError({ className, children, ...props }: React.ComponentProps<'p'>) {
  if (!children) return null
  return (
    <p
      role="alert"
      data-slot="field-error"
      className={cn('text-sm font-semibold text-destructive-text', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel }
