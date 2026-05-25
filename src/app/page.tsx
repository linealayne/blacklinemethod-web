import Link from 'next/link'
import { HeroSection } from '@/components/sections/HeroSection'
import { PhilosophySection } from '@/components/sections/PhilosophySection'
import { MethodSection } from '@/components/sections/MethodSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { InsightsTeaserSection } from '@/components/sections/InsightsTeaserSection'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PhilosophySection />
      <MethodSection />
      <ProcessSection />
      <InsightsTeaserSection />

      {/* Closing CTA */}
      <section className="bg-black border-t border-hairline" aria-label="Request a consult">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-44 text-center">
          <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
            by appointment
          </span>
          <h2 className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.75rem,5vw,5.5rem)] mb-8 max-w-2xl mx-auto">
            engagements are limited. that is by design.
          </h2>
          <p className="font-sans text-sm text-offwhite/40 leading-relaxed tracking-wide max-w-md mx-auto mb-12">
            We take a small number of clients. The first step is a conversation.
          </p>
          <Button asChild size="lg">
            <Link href="/contact">request a consult</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
