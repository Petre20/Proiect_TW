import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from './query-client'

export function Providers({ children }: { children: ReactNode }) {
  return (
    // .dark goes on <html>, which is what the tokens and the Tailwind `dark:` variant expect.
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="wt-theme">
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
