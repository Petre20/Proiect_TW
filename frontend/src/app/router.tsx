import { createBrowserRouter } from 'react-router'
import { requireAdmin, requireAuth, requireGuest } from './guards'
import { AppLayout, AuthLayout, RootLayout } from './layouts'

/**
 * The whole page map in one place. Every page is lazy-loaded and exports `Component`.
 * Loaders are used only as guards; data fetching belongs to TanStack Query.
 */
export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { index: true, lazy: () => import('@/features/landing/LandingPage') },
      { path: 'styleguide', lazy: () => import('@/features/styleguide/StyleguidePage') },

      // public auth pages (the same forms also open in a modal from anywhere)
      {
        Component: AuthLayout,
        loader: requireGuest,
        children: [
          { path: 'login', lazy: () => import('@/features/auth/LoginPage') },
          { path: 'register', lazy: () => import('@/features/auth/RegisterPage') },
        ],
      },
      // reached from the email link, whether or not a session exists
      { Component: AuthLayout, children: [{ path: 'verify-email', lazy: () => import('@/features/auth/VerifyEmailPage') }] },

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
