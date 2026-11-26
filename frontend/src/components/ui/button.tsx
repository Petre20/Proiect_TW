import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "keycap inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl font-extrabold whitespace-nowrap disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: '[--fill:var(--volt)] [--edge:var(--volt-edge)] [--fg:var(--brand-ink)]',
        go: '[--fill:var(--go)] [--edge:var(--go-edge)] [--fg:#fff]',
        ink: '[--fill:var(--brand-ink)] [--edge:var(--brand-ink-edge)] [--fg:var(--on-brand)]',
        outline:
          '[--fill:var(--control)] [--edge:var(--control-edge)] [--fg:var(--foreground)] ring-2 ring-inset ring-border',
        destructive:
          '[--fill:var(--control)] [--edge:var(--destructive-edge)] [--fg:var(--destructive)] ring-2 ring-inset ring-destructive-line hover:[--fill:var(--destructive)] hover:[--fg:#fff]',
        ghost:
          'bg-transparent text-foreground shadow-none hover:translate-y-0 hover:bg-muted hover:shadow-none active:translate-y-0 active:shadow-none',
        link: 'bg-transparent text-foreground shadow-none underline underline-offset-4 hover:translate-y-0 hover:shadow-none active:translate-y-0 active:shadow-none',
      },
      size: {
        default: 'min-h-12 px-5 text-base',
        sm: 'min-h-11 rounded-xl px-4 text-label',
        lg: 'min-h-14 px-7 text-lg',
        icon: 'size-12',
        'icon-sm': 'size-11 rounded-xl',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
