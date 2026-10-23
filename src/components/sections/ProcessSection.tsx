import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { ProcessTimeline } from '@/components/ProcessTimeline'

const STEPS = [
  {
    index: '01',
    label: 'Intake',
    description:
      'A 90-minute private consult. History, symptoms, goals, current protocols. We read what you bring before we recommend anything.',
  },
  {
    index: '02',
    label: 'Protocol',
    description:
      'A written protocol covering the relevant domains. Training, nutrition, hormone optimization guidance where indicated, and physician coordination if pharmaceutical intervention is appropriate.',
  },
  {
    index: '03',
    label: 'Recalibration',
    description:
      'Protocols are living documents. Regular check-ins, re-testing, and adjustment as the system responds. Nothing is set and forgotten.',
  },
]

export function ProcessSection() {
  return (
    <section className="bg-black border-t border-hairline" aria-label="The process">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-3xl">
          <Reveal as="p" className="bl-label mb-8">
            the process
          </Reveal>
          <SplitReveal
            as="h2"
            className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.5rem,4.8vw,5rem)]"
          >
            what working with us looks like.
          </SplitReveal>
          <Reveal as="p" delay={0.2} className="mt-8 font-sans text-sm md:text-[15px] text-body leading-relaxed tracking-wide max-w-md">
            Engagements are structured, not open-ended. The first ninety days establish the baseline.
            Everything after is calibration.
          </Reveal>
        </div>

        <div className="mt-16 md:mt-20">
          <ProcessTimeline steps={STEPS} />
        </div>

        <Reveal className="mt-16">
          <Link
            href="/process"
            className="group inline-flex items-center gap-3 min-h-[44px] font-sans text-[11px] tracking-[0.2em] uppercase text-amber-muted transition-colors duration-600 hover:text-amber"
          >
            <span className="bl-underline">See the full process and engagement tiers</span>
            <span aria-hidden="true" className="transition-transform duration-600 ease-lux group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
