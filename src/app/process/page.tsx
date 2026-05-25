import type { Metadata } from 'next'
import Link from 'next/link'
import { FadeInSection } from '@/components/FadeInSection'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Process — Blackline Method',
  description:
    'What working with Blackline looks like. The first 90 days, engagement tiers, and what we do and don\'t do.',
}

const TIERS = [
  {
    id: 'foundation',
    name: 'Foundation',
    description:
      'For clients with clear goals and no significant hormonal or metabolic dysfunction.',
    includes: [
      'Intake consult and baseline panel review',
      'Custom training and nutrition program',
      'Monthly check-in and review',
      'Async support between sessions',
    ],
  },
  {
    id: 'optimization',
    name: 'Optimization',
    description:
      'For clients pursuing performance, body composition, or longevity outcomes beyond foundational fitness.',
    includes: [
      'Everything in Foundation',
      'Expanded hormone panel review',
      'Weekly check-ins and direct access between sessions',
      'Quarterly re-testing and protocol adjustment',
    ],
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    description:
      'For clients with significant hormonal dysfunction, complex symptoms, or those engaged in physician-coordinated protocols.',
    includes: [
      'Everything in Optimization',
      'Physician coordination for pharmaceutical intervention',
      'Condensed re-testing cadence',
      'Full protocol management across all four domains',
    ],
  },
]

const WE_DO = [
  'Interpret bloodwork in context against symptoms, history, and goals',
  'Design and adjust hormone optimization protocols',
  'Build training and nutrition programs from first principles',
  'Coordinate with licensed physicians for pharmaceutical intervention when appropriate',
  'Teach clients to read and understand their own data',
  'Hold clients accountable to the structure we build together',
]

const WE_DONT = [
  'Diagnose or treat disease',
  'Prescribe or dispense medication',
  'Replace your physician or primary care relationship',
  'Sell supplements with markup',
  'Promise outcomes we cannot measure',
  'Run cookie-cutter programs on people who don\'t fit the template',
]

export default function ProcessPage() {
  return (
    <div className="bg-black min-h-screen pt-40 pb-32">
      {/* Hero */}
      <section aria-label="Process introduction" className="px-6 md:px-12 max-w-7xl mx-auto mb-32 md:mb-44">
        <FadeInSection>
          <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
            the process
          </span>
          <h1 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(3rem,7vw,7rem)] mb-12 max-w-4xl">
            what working with us looks like.
          </h1>
          <p className="font-sans text-sm text-offwhite/45 leading-relaxed tracking-wide max-w-lg">
            Engagements are structured, not open-ended. The first ninety days establish the
            baseline. Everything after is calibration.
          </p>
        </FadeInSection>
      </section>

      {/* The first 90 days */}
      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
      <section aria-label="The first 90 days" className="px-6 md:px-12 max-w-7xl mx-auto py-32 md:py-44">
        <FadeInSection>
          <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
            the first 90 days
          </span>
          <h2 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.25rem,4vw,4rem)] mb-20">
            intake. protocol. recalibration.
          </h2>
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {[
            {
              index: '01',
              label: 'Intake',
              detail:
                'A 90-minute private consult. History, symptoms, goals, current protocols, and what has and hasn\'t worked. We read what you bring before we recommend anything. Nothing is prescribed in this session — this is about understanding.',
            },
            {
              index: '02',
              label: 'Protocol',
              detail:
                'A written protocol covering the relevant domains. Training, nutrition, hormone optimization guidance where indicated, and physician coordination if pharmaceutical intervention is appropriate. The protocol is specific to your biology, not adapted from a template.',
            },
            {
              index: '03',
              label: 'Recalibration',
              detail:
                'Protocols are living documents. Regular check-ins, re-testing at the appropriate cadence, and adjustment as the system responds. Nothing is set and forgotten. What we observe over time is as important as the initial read.',
            },
          ].map((step, i) => (
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
                  {step.detail}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Engagement tiers */}
      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
      <section aria-label="Engagement tiers" className="px-6 md:px-12 max-w-7xl mx-auto py-32 md:py-44">
        <FadeInSection>
          <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
            engagement tiers
          </span>
          <h2 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.25rem,4vw,4rem)] mb-6">
            three tiers. one conversation.
          </h2>
          <p className="font-sans text-sm text-offwhite/40 leading-relaxed tracking-wide max-w-lg mb-20">
            The right engagement is determined in the intake consult. Pricing is a conversation,
            not a line item on a webpage.
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-8">
          {TIERS.map((tier, i) => (
            <FadeInSection key={tier.id} delay={0.1 * i}>
              <div className="border border-hairline p-8 h-full">
                <p className="font-sans text-[11px] tracking-[0.22em] uppercase text-amber/60 mb-4">
                  {tier.name}
                </p>
                <p className="font-sans text-sm text-offwhite/40 leading-relaxed tracking-wide mb-8">
                  {tier.description}
                </p>
                <ul className="space-y-3">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex gap-3 font-sans text-[13px] text-offwhite/35 tracking-wide leading-relaxed">
                      <span className="text-amber/40 shrink-0 mt-0.5" aria-hidden="true">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* What we do / don't */}
      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
      <section aria-label="What we do and don't do" className="px-6 md:px-12 max-w-7xl mx-auto py-32 md:py-44">
        <FadeInSection>
          <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
            scope
          </span>
          <h2 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.25rem,4vw,4rem)] mb-20">
            what we do. what we don&apos;t.
          </h2>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          <FadeInSection>
            <p className="font-sans text-[11px] tracking-[0.22em] uppercase text-amber/60 mb-8">
              We do
            </p>
            <ul className="space-y-5">
              {WE_DO.map((item) => (
                <li key={item} className="flex gap-4 font-sans text-sm text-offwhite/45 tracking-wide leading-relaxed">
                  <span className="text-amber/40 shrink-0" aria-hidden="true">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </FadeInSection>

          <FadeInSection delay={0.14}>
            <p className="font-sans text-[11px] tracking-[0.22em] uppercase text-offwhite/25 mb-8">
              We don&apos;t
            </p>
            <ul className="space-y-5">
              {WE_DONT.map((item) => (
                <li key={item} className="flex gap-4 font-sans text-sm text-offwhite/30 tracking-wide leading-relaxed">
                  <span className="text-offwhite/15 shrink-0" aria-hidden="true">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </FadeInSection>
        </div>
      </section>

      {/* CTA */}
      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
      <section aria-label="Contact CTA" className="px-6 md:px-12 max-w-7xl mx-auto pt-20 pb-10">
        <FadeInSection>
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            <p className="font-serif text-xl text-offwhite/70 font-light tracking-wide">
              Engagements are limited. That is by design.
            </p>
            <Button asChild className="shrink-0">
              <Link href="/contact">request a consult</Link>
            </Button>
          </div>
        </FadeInSection>
      </section>
    </div>
  )
}
