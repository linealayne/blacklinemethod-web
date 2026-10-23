import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Magnetic } from '@/components/motion/Magnetic'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'

export function ClosingSection() {
  return (
    <section className="bg-black border-t border-hairline" aria-label="Request a consult">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-28 md:py-40 text-center">
        <Reveal as="p" className="bl-label mb-8">
          by appointment
        </Reveal>
        <SplitReveal
          as="h2"
          className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.5rem,5vw,5.5rem)] mb-8 max-w-3xl mx-auto"
        >
          engagements are limited. that is by design.
        </SplitReveal>
        <Reveal as="p" delay={0.25} className="font-sans text-sm md:text-[15px] text-body leading-relaxed tracking-wide max-w-md mx-auto mb-12">
          We take a small number of clients. The first step is a conversation.
        </Reveal>
        <Reveal delay={0.35}>
          <Magnetic>
            <Button asChild size="lg" glow>
              <Link href="/contact">request a consult</Link>
            </Button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  )
}
