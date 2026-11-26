import { useEffect, useState, type MouseEvent } from 'react'
import { GoogleLogo } from '@/components/brand/GoogleLogo'
import { googleLoginEnabled, googleStartUrl } from '../google'

type Props = { label: 'Continue with Google' | 'Sign up with Google'; next?: string | null }

export function GoogleSection({ label, next }: Props) {
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const restore = (event: PageTransitionEvent) => event.persisted && setBusy(false)
    window.addEventListener('pageshow', restore)
    return () => window.removeEventListener('pageshow', restore)
  }, [])

  if (!googleLoginEnabled()) return null

  function onClick(event: MouseEvent) {
    if (busy) event.preventDefault()
    else setBusy(true)
  }

  return (
    <div className="grid gap-4">
      <a
        href={googleStartUrl(next)}
        onClick={onClick}
        aria-busy={busy || undefined}
        aria-disabled={busy || undefined}
        className="relative inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-[#747775] bg-white px-4 font-extrabold text-[#1F1F1F] shadow-[0_4px_0_var(--control-edge)] transition-[translate,box-shadow] duration-100 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-0 before:transition-opacity hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:translate-y-[3px] active:shadow-[0_1px_0_var(--control-edge)] active:before:opacity-[0.12] aria-busy:cursor-progress dark:border-[#8E918F] dark:bg-[#131314] dark:text-[#E3E3E3] dark:shadow-[0_4px_0_#0A0A0B] dark:active:shadow-[0_1px_0_#0A0A0B]"
      >
        {busy ? (
          <span
            aria-hidden="true"
            className="size-[18px] animate-spin rounded-full border-[3px] border-current/25 border-t-current"
          />
        ) : (
          <GoogleLogo className="size-5 shrink-0" />
        )}
        {busy ? 'Opening Google…' : label}
      </a>
      <div className="flex items-center gap-3 font-semibold text-muted-foreground" aria-hidden="true">
        <hr className="flex-1 border-t-2 border-border" />
        or with email
        <hr className="flex-1 border-t-2 border-border" />
      </div>
    </div>
  )
}
