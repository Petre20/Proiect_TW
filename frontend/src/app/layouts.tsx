import { BarChart3, BookOpen, Goal, LayoutDashboard, ListChecks, MoreHorizontal, Plus, Activity, ArrowLeftRight, Users, FileText } from 'lucide-react'
import { NavLink, Outlet, ScrollRestoration } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/brand/ThemeToggle'
import { AuthModal } from '@/features/auth/components/AuthModal'
import { cn } from '@/lib/utils'

export function RootLayout() {
  return (
    <>
      <Outlet />
      <AuthModal />
      <ScrollRestoration />
    </>
  )
}

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/activities', label: 'Activities', icon: Activity },
  { to: '/habits', label: 'Habits', icon: ListChecks },
  { to: '/goals', label: 'Goals', icon: Goal },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/import-export', label: 'Import / Export', icon: ArrowLeftRight },
]
const ADMIN = [
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/articles', label: 'Articles', icon: FileText },
]
const TABS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/habits', label: 'Habits', icon: ListChecks },
  null,
  { to: '/goals', label: 'Goals', icon: Goal },
  { to: '/more', label: 'More', icon: MoreHorizontal },
]

const railLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex min-h-12 items-center gap-3 rounded-2xl px-3.5 font-bold text-on-brand-muted hover:bg-brand-ink-2',
    isActive && 'bg-volt text-brand-ink shadow-[0_4px_0_var(--volt-edge)] hover:bg-volt',
  )

export function AppLayout() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-1 bg-brand-ink p-4 text-on-brand lg:flex" aria-label="Sidebar">
        <Logo className="mb-6 px-2 text-on-brand" />
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={railLink}><Icon className="size-5" />{label}</NavLink>
        ))}
        <p className="mt-4 px-3.5 text-xs font-bold uppercase tracking-wide text-on-brand-muted/70">Admin</p>
        {ADMIN.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={railLink}><Icon className="size-5" />{label}</NavLink>
        ))}
        <div className="mt-auto flex items-center justify-between rounded-2xl bg-brand-ink-2 p-3">
          <NavLink to="/profile" className="font-bold">Profile</NavLink>
          <ThemeToggle className="text-on-brand hover:bg-brand-ink" />
        </div>
      </aside>

      <div className="pb-28 lg:pb-0">
        <header className="flex items-center justify-between px-4 pt-3 lg:hidden">
          <Logo />
          <ThemeToggle />
        </header>
        <Outlet />
      </div>

      <nav
        aria-label="Main"
        className="fixed inset-x-2.5 bottom-2.5 z-20 grid grid-cols-5 items-center rounded-[30px] border border-white/15 bg-brand-ink/80 px-1 backdrop-blur-xl lg:hidden"
      >
        {TABS.map((t, i) =>
          t ? (
            <NavLink
              key={t.to} to={t.to}
              className={({ isActive }) => cn('grid min-h-14 justify-items-center gap-0.5 py-2 text-xs font-bold text-on-brand-muted', isActive && 'text-volt')}
            >
              <t.icon className="size-5" />{t.label}
            </NavLink>
          ) : (
            <NavLink
              key={i} to="/activities" aria-label="Log activity"
              className="keycap -mt-7 grid size-16 place-items-center justify-self-center rounded-[20px] [--edge:var(--volt-edge)] [--fg:var(--brand-ink)] [--fill:var(--volt)]"
            >
              <Plus className="size-7" strokeWidth={3} />
            </NavLink>
          ),
        )}
      </nav>
    </div>
  )
}

export function AuthLayout() {
  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-6">
        <Logo className="mb-6" />
        <Outlet />
      </div>
    </div>
  )
}
