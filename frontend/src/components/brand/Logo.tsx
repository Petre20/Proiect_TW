import markDark from '@/assets/brand/logo-mark-dark.png'
import mark from '@/assets/brand/logo-mark.png'
import { cn } from '@/lib/utils'

type Props = { className?: string; size?: number; onDark?: boolean }

export function LogoMark({ className, size = 28, onDark = false }: Props) {
  const height = { height: size }
  if (onDark) return <img src={markDark} alt="" style={height} className={cn('w-auto', className)} />
  return (
    <>
      <img src={mark} alt="" style={height} className={cn('w-auto dark:hidden', className)} />
      <img src={markDark} alt="" style={height} className={cn('hidden w-auto dark:block', className)} />
    </>
  )
}

export function Logo({ className, size, onDark }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight', className)}>
      <LogoMark size={size} onDark={onDark} />
      WellTrack
    </span>
  )
}
