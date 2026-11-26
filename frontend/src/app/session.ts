import { authKeys } from '@/features/auth/queries'
import { setUnauthorizedHandler } from '@/lib/http'
import { useAuthModal } from '@/stores/auth-modal'
import { queryClient } from './query-client'

export function watchSession() {
  setUnauthorizedHandler(() => {
    queryClient.setQueryData(authKeys.me(), null)
    if (!useAuthModal.getState().open) useAuthModal.getState().show('session-expired')
  })
}
