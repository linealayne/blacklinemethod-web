import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Magnetic } from '@/components/motion/Magnetic'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { Folio } from '@/components/layout/Folio'

export function ClosingSection() {
  return (
    <Folio label="by appointment" ariaLabel="Request a consult" innerClassName="pt-24 pb-28 md:pt-36 md:pb-44">
      <SplitReveal as="h2" className="bl-h1 max-w-[14ch]">
        engagements are limited. that is by design.
      </SplitReveal>
      <div className="mt-12 md:mt-16 grid gap-10 md:grid-cols-12 md:items-end">
        <Reveal as="p" delay={0.25} className="bl-body md:col-span-6">
          We take a small number of clients. The first step is a conversation.
        </Reveal>
        <Reveal delay={0.35} className="md:col-span-6 md:justify-self-end">
          <Magnetic>
            <Button asChild size="lg">
              <Link href="/contact">request a consult</Link>
            </Button>
          </Magnetic>
        </Reveal>
      </div>
    </Folio>
  )
}
