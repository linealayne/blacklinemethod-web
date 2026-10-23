import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { Button } from '@/components/ui/button'
import { PracticeCards } from '@/components/sections/PracticeSection'

export const metadata: Metadata = {
  title: 'Philosophy | Blackline Method',
  description:
    'Why "in range" is a low bar. The thesis behind the Blackline Method: symptoms-first reading, individual optimization, and a system built for the space between "nothing is wrong" and performing at the level you should.',
}

const SECTIONS = [
  {
    index: '01',
    title: 'symptoms first.',
    paragraphs: [
      'A laboratory report is a snapshot. It shows you where a set of markers sat on the morning the blood was drawn. What it cannot show you is the person carrying those numbers — how they feel, how they recover, how they perform, what has changed over the past twelve months, and what they are trying to accomplish.',
      'The standard clinical read is to compare values against reference ranges and flag anything outside the boundaries. Values inside the range are deemed normal. The appointment ends.',
      'Symptoms are the first data. Before we look at a panel, we want to understand what the body is telling you in plain language — fatigue, recovery time, cognitive clarity, mood, body composition, sleep quality, drive. Symptoms are not subjective noise. They are signal. A panel read without them is a map read without knowing where you are.',
      'Bloodwork is read in context — against symptoms, history, and what the client is trying to do. Not against what is statistically common in the general population.',
    ],
  },
  {
    index: '02',
    title: 'optimal is individual.',
    paragraphs: [
      'Reference ranges are built from population data. They describe where the bulk of a large, diverse sample of people fall — across ages, health statuses, activity levels, metabolic histories, and life circumstances. They are useful for identifying disease. They are a poor tool for defining individual adequacy.',
      'A value at the lowest fifth of the reference range is, by definition, within normal limits. Clinically, there is nothing to act on. And yet that person may be experiencing symptoms that are consistent with functional insufficiency — fatigue, poor recovery, difficulty building or maintaining lean mass, mood instability — none of which will appear on a flagged lab report.',
      'The question is not whether a marker is within the population range. The question is whether it is adequate for this person, at this point in their life, given their history, their goals, and what their body is doing.',
      'That is an individual question. It requires an individual answer.',
    ],
  },
  {
    index: '03',
    title: 'not a provider. a relationship.',
    paragraphs: [
      'Most optimization practices operate by telling clients what to do. The goal at Blackline is different: to teach clients to understand and operate their own systems. To read their own data. To know what a shift in a marker means, why a protocol is structured the way it is, and how the system behaves.',
      'Dependence on a provider is not optimization. It is just a different kind of management. We are not trying to manage you. We are trying to give you the context and the tools to run your own biology.',
      'Blackline is not a gym. It is not a clinic. It does not prescribe or dispense medication. Pharmaceutical intervention, when indicated, is coordinated with a licensed physician — that relationship is maintained and respected. What we provide is the synthesis that connects the domains: the hormones, the training, the nutrition, and the structure of how you live.',
      'The critique here is not of medicine or of physicians. Most are skilled, principled, and operating under real constraints. The system they trained in was built for triage and disease management — and it is effective at both. It was simply never built for what we do.',
    ],
  },
]

export default function PhilosophyPage() {
  return (
    <div className="bg-black min-h-screen pt-36 md:pt-40 pb-24">
      {/* Hero */}
      <section aria-label="Philosophy introduction" className="px-6 md:px-12 max-w-7xl mx-auto mb-24 md:mb-32">
        <Reveal as="p" className="bl-label mb-8">
          philosophy
        </Reveal>
        <SplitReveal
          as="h1"
          className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(3rem,8vw,8rem)] mb-12 max-w-5xl"
        >
          the standard is too low.
        </SplitReveal>
        <Reveal stagger delay={0.3} className="space-y-5">
          <p className="font-serif italic text-body text-xl leading-relaxed max-w-xl">
            Standard primary care is built for triage. It is structured to identify disease, manage
            chronic conditions, and catch what is urgent. It does those things well.
          </p>
          <p className="font-serif italic text-body text-xl leading-relaxed max-w-xl">
            It was never built for optimization. Neither is &ldquo;in range.&rdquo;
          </p>
        </Reveal>
      </section>

      {SECTIONS.map((section, i) => (
        <div key={section.index}>
          <div className={`mx-6 md:mx-12 ${i === 0 ? 'hairline-amber' : 'h-px bg-hairline'}`} aria-hidden="true" />
          <section aria-label={section.title} className="px-6 md:px-12 max-w-7xl mx-auto py-24 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start">
              <div>
                <Reveal as="span" className="block bl-label mb-8">
                  {section.index}
                </Reveal>
                <SplitReveal
                  as="h2"
                  className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.5rem,5vw,5.5rem)]"
                >
                  {section.title}
                </SplitReveal>
              </div>
              <Reveal stagger delay={0.15} className="space-y-6 font-sans text-sm md:text-[15px] text-body leading-relaxed tracking-wide md:pt-20">
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </Reveal>
            </div>
          </section>
        </div>
      ))}

      {/* The practice */}
      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
      <section aria-label="The practice" className="px-6 md:px-12 max-w-7xl mx-auto py-24 md:py-32">
        <Reveal as="p" className="bl-label mb-8">
          the practice
        </Reveal>
        <SplitReveal
          as="h2"
          className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.5rem,5vw,5.5rem)]"
        >
          the practice.
        </SplitReveal>
        <Reveal as="p" delay={0.2} className="mt-8 font-serif italic text-body text-lg md:text-xl leading-relaxed max-w-xl">
          two people. a small number of clients. by design.
        </Reveal>
        <PracticeCards className="mt-14 md:mt-16" />
      </section>

      {/* CTA */}
      <section aria-label="Contact CTA" className="px-6 md:px-12 max-w-7xl mx-auto border-t border-hairline pt-16 pb-6">
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
