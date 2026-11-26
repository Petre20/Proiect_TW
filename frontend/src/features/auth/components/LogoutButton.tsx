import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/http'
import { useLogout } from '../mutations'

type Props = { className?: string; variant?: React.ComponentProps<typeof Button>['variant']; showLabel?: boolean }

export function LogoutButton({ className, variant = 'outline', showLabel = true }: Props) {
  const navigate = useNavigate()
  const logout = useLogout()

  function onClick() {
    logout.mutate(undefined, {
      onError: (error) => {
        if (error instanceof ApiError && (error.status === 0 || error.status >= 500)) {
          toast.error('Could not reach the server. You were logged out on this device.')
        }
      },
      onSettled: () => navigate('/', { replace: true }),
    })
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={showLabel ? 'default' : 'icon'}
      className={className}
      aria-label={showLabel ? undefined : 'Log out'}
      disabled={logout.isPending}
      onClick={onClick}
    >
      <LogOut aria-hidden />
      {showLabel && 'Log out'}
    </Button>
  )
}
