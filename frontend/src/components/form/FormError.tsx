import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'

export function FormError({ message, children }: { message?: string | null; children?: ReactNode }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="grid gap-2 rounded-2xl border-2 border-destructive-line bg-destructive-soft p-3.5 text-sm font-semibold text-destructive-text"
    >
      <p className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
        {message}
      </p>
      {children}
    </div>
  )
}
