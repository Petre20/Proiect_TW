import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from './api'
import { authKeys } from './queries'

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => queryClient.setQueryData(authKeys.me(), user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear()
      queryClient.setQueryData(authKeys.me(), null)
    },
  })
}

export function useRegister() {
  return useMutation({ mutationFn: authApi.register })
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: authApi.verifyEmail })
}

export function useResendVerification() {
  return useMutation({ mutationFn: authApi.resendVerification })
}
