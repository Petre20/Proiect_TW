import { About } from './About'
import { ClosingBanner } from './ClosingBanner'
import { HabitPicker } from './HabitPicker'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'
import { SiteFooter } from './SiteFooter'

export function Component() {
  return (
    <>
      <main id="main">
        <Hero />
        <HabitPicker />
        <About />
        <HowItWorks />
        <ClosingBanner />
      </main>
      <SiteFooter />
    </>
  )
}
