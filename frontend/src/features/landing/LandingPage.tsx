import { About } from './About'
import { HabitPicker } from './HabitPicker'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'

export function Component() {
  return (
    <main id="main">
      <Hero />
      <HabitPicker />
      <About />
      <HowItWorks />
    </main>
  )
}
