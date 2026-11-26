import { PagePlaceholder } from '@/components/PagePlaceholder'
import { LogoutButton } from '@/features/auth/components/LogoutButton'

export function Component() {
  return (
    <>
      <PagePlaceholder title='More' note='Mobile-only menu for everything not in the bottom tabs.' />
      <div className="mx-auto max-w-3xl px-6 pb-6 lg:px-10">
        <LogoutButton className="w-full" />
      </div>
    </>
  )
}
