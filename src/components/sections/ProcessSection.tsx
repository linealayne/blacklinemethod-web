import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { ProcessTimeline } from '@/components/ProcessTimeline'
import { Folio } from '@/components/layout/Folio'

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
    <Folio label="the process" ariaLabel="The process">
      <div className="max-w-4xl">
        <Reveal as="h2" className="bl-h2">
          what working with us looks like.
        </Reveal>
        <Reveal as="p" delay={0.08} className="mt-7 md:mt-8 bl-body">
          Engagements are structured, not open-ended. The first ninety days establish the baseline.
          Everything after is calibration.
        </Reveal>
      </div>

      <div className="mt-16 md:mt-24">
        <ProcessTimeline steps={STEPS} />
      </div>

      <Reveal className="mt-16">
        <Link href="/process" className="group bl-link">
          <span className="bl-underline">See the full process and engagement tiers</span>
          <span aria-hidden="true" className="bl-arrow" />
        </Link>
      </Reveal>
    </Folio>
  )
}
