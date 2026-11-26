import { createBrowserRouter, redirect } from 'react-router'
import { requireAdmin, requireAuth, requireGuest } from './guards'
import { AppLayout, AuthLayout, RootLayout } from './layouts'

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { index: true, lazy: () => import('@/features/landing/LandingPage') },
      { path: 'styleguide', lazy: () => import('@/features/styleguide/StyleguidePage') },

      {
        path: 'auth',
        Component: AuthLayout,
        children: [
          { index: true, loader: requireGuest, lazy: () => import('@/features/auth/AuthPage') },
          { path: 'verify-email', lazy: () => import('@/features/auth/VerifyEmailPage') },
        ],
      },
      // the backend email still links to /verify-email until it is updated
      { path: 'verify-email', loader: ({ request }) => redirect(`/auth/verify-email${new URL(request.url).search}`) },

      { path: 'onboarding', loader: requireAuth, lazy: () => import('@/features/onboarding/OnboardingPage') },

      {
        Component: AppLayout,
        loader: requireAuth,
        children: [
          { path: 'dashboard', lazy: () => import('@/features/dashboard/DashboardPage') },
          { path: 'activities', lazy: () => import('@/features/activities/ActivitiesPage') },
          { path: 'habits', lazy: () => import('@/features/habits/HabitsPage') },
          { path: 'goals', lazy: () => import('@/features/goals/GoalsPage') },
          { path: 'statistics', lazy: () => import('@/features/statistics/StatisticsPage') },
          { path: 'learn', lazy: () => import('@/features/learn/LearnPage') },
          { path: 'learn/:slug', lazy: () => import('@/features/learn/ArticlePage') },
          { path: 'import-export', lazy: () => import('@/features/import-export/ImportExportPage') },
          { path: 'profile', lazy: () => import('@/features/profile/ProfilePage') },
          { path: 'more', lazy: () => import('@/features/more/MorePage') },
          {
            path: 'admin',
            loader: requireAdmin,
            children: [
              { path: 'users', lazy: () => import('@/features/admin/AdminUsersPage') },
              { path: 'articles', lazy: () => import('@/features/admin/AdminArticlesPage') },
            ],
          },
        ],
      },

      { path: '*', lazy: () => import('@/features/not-found/NotFoundPage') },
    ],
  },
])
