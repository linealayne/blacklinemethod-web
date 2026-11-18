import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/Reveal'
import { Folio } from '@/components/layout/Folio'

export function ClosingSection() {
  return (
    <Folio label="by appointment" ariaLabel="Request a consult" innerClassName="pt-24 pb-28 md:pt-32 md:pb-40">
      <Reveal as="h2" className="bl-h1 max-w-[18ch]">
        engagements are limited. that is by design.
      </Reveal>
      <div className="mt-12 md:mt-16 grid gap-10 md:grid-cols-12 md:items-end">
        <Reveal as="p" delay={0.08} className="bl-body md:col-span-6">
          We take a small number of clients. The first step is a conversation.
        </Reveal>
        <Reveal delay={0.12} className="md:col-span-6 md:justify-self-end">
          <Button asChild size="lg">
            <Link href="/contact">request a consult</Link>
          </Button>
        </Reveal>
      </div>
    </Folio>
  )
}
