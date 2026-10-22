import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { ProcessTimeline } from '@/components/ProcessTimeline'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Process | Blackline Method',
  description:
    'What working with Blackline looks like. The first 90 days, engagement tiers, and what we do and don\'t do.',
}

const STEPS = [
  {
    index: '01',
    label: 'Intake',
    description:
      'A 90-minute private consult. History, symptoms, goals, current protocols, and what has and hasn\'t worked. We read what you bring before we recommend anything. Nothing is prescribed in this session — this is about understanding.',
  },
  {
    index: '02',
    label: 'Protocol',
    description:
      'A written protocol covering the relevant domains. Training, nutrition, hormone optimization guidance where indicated, and physician coordination if pharmaceutical intervention is appropriate. The protocol is specific to your biology, not adapted from a template.',
  },
  {
    index: '03',
    label: 'Recalibration',
    description:
      'Protocols are living documents. Regular check-ins, re-testing at the appropriate cadence, and adjustment as the system responds. Nothing is set and forgotten. What we observe over time is as important as the initial read.',
  },
]

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
    <div className="bg-black min-h-screen pt-36 md:pt-40 pb-24">
      {/* Hero */}
      <section aria-label="Process introduction" className="px-6 md:px-12 max-w-7xl mx-auto mb-24 md:mb-32">
        <Reveal as="p" className="bl-label mb-8">
          the process
        </Reveal>
        <SplitReveal
          as="h1"
          className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(3rem,7vw,7rem)] mb-10 max-w-4xl"
        >
          what working with us looks like.
        </SplitReveal>
        <Reveal as="p" delay={0.3} className="font-sans text-sm md:text-[15px] text-body leading-relaxed tracking-wide max-w-lg">
          Engagements are structured, not open-ended. The first ninety days establish the baseline.
          Everything after is calibration.
        </Reveal>
      </section>

      {/* The first 90 days */}
      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
      <section aria-label="The first 90 days" className="px-6 md:px-12 max-w-7xl mx-auto py-24 md:py-32">
        <Reveal as="p" className="bl-label mb-8">
          the first 90 days
        </Reveal>
        <SplitReveal
          as="h2"
          className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.25rem,4vw,4rem)] mb-16 md:mb-20"
        >
          intake. protocol. recalibration.
        </SplitReveal>
        <ProcessTimeline steps={STEPS} />
      </section>

      {/* Engagement tiers */}
      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
      <section aria-label="Engagement tiers" className="px-6 md:px-12 max-w-7xl mx-auto py-24 md:py-32">
        <Reveal as="p" className="bl-label mb-8">
          engagement tiers
        </Reveal>
        <SplitReveal
          as="h2"
          className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.25rem,4vw,4rem)] mb-6"
        >
          three tiers. one conversation.
        </SplitReveal>
        <Reveal as="p" delay={0.2} className="font-sans text-sm md:text-[15px] text-body leading-relaxed tracking-wide max-w-lg mb-16 md:mb-20">
          The right engagement is determined in the intake consult. Pricing is a conversation, not a
          line item on a webpage.
        </Reveal>

        <Reveal stagger className="grid md:grid-cols-3 gap-6 md:gap-8">
          {TIERS.map((tier) => (
            <div key={tier.id} className="border border-hairline p-8 h-full transition-colors duration-600 hover:border-amber/40">
              <p className="bl-label bl-label-amber mb-4">{tier.name}</p>
              <p className="font-sans text-sm text-body leading-relaxed tracking-wide mb-8">
                {tier.description}
              </p>
              <ul className="space-y-3">
                {tier.includes.map((item) => (
                  <li key={item} className="flex gap-3 font-sans text-[13px] text-body-dim tracking-wide leading-relaxed">
                    <span className="text-amber-muted shrink-0 mt-0.5" aria-hidden="true">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </section>

      {/* What we do / don't */}
      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
      <section aria-label="What we do and don't do" className="px-6 md:px-12 max-w-7xl mx-auto py-24 md:py-32">
        <Reveal as="p" className="bl-label mb-8">
          scope
        </Reveal>
        <SplitReveal
          as="h2"
          className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.25rem,4vw,4rem)] mb-16 md:mb-20"
        >
          what we do. what we don&apos;t.
        </SplitReveal>

        <div className="grid md:grid-cols-2 gap-14 md:gap-24">
          <Reveal>
            <p className="bl-label bl-label-amber mb-8">We do</p>
            <ul className="space-y-5">
              {WE_DO.map((item) => (
                <li key={item} className="flex gap-4 font-sans text-sm md:text-[15px] text-body tracking-wide leading-relaxed">
                  <span className="text-amber-muted shrink-0" aria-hidden="true">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="bl-label mb-8">We don&apos;t</p>
            <ul className="space-y-5">
              {WE_DONT.map((item) => (
                <li key={item} className="flex gap-4 font-sans text-sm md:text-[15px] text-body-dim tracking-wide leading-relaxed">
                  <span className="text-label shrink-0" aria-hidden="true">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
      <section aria-label="Contact CTA" className="px-6 md:px-12 max-w-7xl mx-auto pt-16 pb-6">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            <p className="font-serif text-xl text-offwhite/80 font-light tracking-wide">
              Engagements are limited. That is by design.
            </p>
            <Button asChild className="shrink-0" glow>
              <Link href="/contact">request a consult</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
