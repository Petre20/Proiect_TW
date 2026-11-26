import { create } from 'zustand'

export type AuthMode = 'login' | 'register' | 'session-expired'

type AuthModalState = {
  open: boolean
  mode: AuthMode
  next?: string
  show: (mode: AuthMode, next?: string) => void
  setMode: (mode: AuthMode) => void
  close: () => void
}

export const useAuthModal = create<AuthModalState>((set) => ({
  open: false,
  mode: 'login',
  show: (mode, next) => set({ open: true, mode, next }),
  setMode: (mode) => set({ mode }),
  close: () => set({ open: false, next: undefined }),
}))
