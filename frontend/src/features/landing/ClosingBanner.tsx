import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function ClosingBanner() {
  return (
    <section className="on-ink mt-6 rounded-t-[38px] bg-brand-ink text-on-brand lg:rounded-t-[54px]">
      <div className="mx-auto max-w-page px-gutter py-section">
        <h2 className="text-title">Start with one habit.</h2>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to="/auth?mode=register">Create an account</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="text-on-brand ring-2 ring-inset ring-on-brand/30 hover:bg-brand-ink-2"
          >
            <Link to="/auth">I already have one</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
