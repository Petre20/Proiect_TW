import { create } from 'zustand'

export type AuthMode = 'login' | 'register' | 'session-expired'

type AuthModalState = {
  open: boolean
  mode: AuthMode
  /** where to go after a successful login; undefined = stay on the current page */
  next?: string
  show: (mode: AuthMode, next?: string) => void
  setMode: (mode: AuthMode) => void
  close: () => void
}

/** UI state only. The modal and the /login and /register pages render the same forms. */
export const useAuthModal = create<AuthModalState>((set) => ({
  open: false,
  mode: 'login',
  show: (mode, next) => set({ open: true, mode, next }),
  setMode: (mode) => set({ mode }),
  close: () => set({ open: false, next: undefined }),
}))
