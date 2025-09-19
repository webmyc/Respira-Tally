import { Hero } from "./_sections/hero"
import { FeaturesGrid } from "./_sections/features/features-grid"
import { Pricing } from "./_sections/pricing"
import { Testimonials } from "./_sections/testimonials"
import { FAQ } from "./_sections/faq"

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturesGrid />
      <Pricing />
      <Testimonials />
      <FAQ />
    </>
  )
}
