import Link from 'next/link'
import { FadeInSection } from '@/components/FadeInSection'

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
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-44">
        <FadeInSection>
          <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
            the process
          </span>
          <h2 className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.75rem,5vw,5.5rem)] mb-6">
            what working with us looks like.
          </h2>
          <p className="font-sans text-sm text-offwhite/40 leading-relaxed tracking-wide max-w-md mb-20">
            Engagements are structured, not open-ended. The first ninety days establish the baseline.
            Everything after is calibration.
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {STEPS.map((step, i) => (
            <FadeInSection key={step.index} delay={0.1 * i}>
              <div>
                <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/15 mb-6">
                  {step.index}
                </span>
                <div className="w-8 h-px bg-amber/30 mb-6" aria-hidden="true" />
                <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-amber/50 mb-4">
                  {step.label}
                </p>
                <p className="font-sans text-sm text-offwhite/40 leading-relaxed tracking-wide">
                  {step.description}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>

        <FadeInSection delay={0.32}>
          <div className="mt-16">
            <Link
              href="/process"
              className="font-sans text-[11px] tracking-[0.2em] uppercase text-amber/60 transition-colors duration-600 hover:text-amber inline-flex items-center gap-3"
            >
              See the full process and engagement tiers
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
