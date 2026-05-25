import type { Metadata } from 'next'
import Link from 'next/link'
import { FadeInSection } from '@/components/FadeInSection'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Philosophy — Blackline Method',
  description:
    'Why "in range" is a low bar. The thesis behind the Blackline Method: symptoms-first reading, individual optimization, and a system built for the space between "nothing is wrong" and performing at the level you should.',
}

export default function PhilosophyPage() {
  return (
    <div className="bg-black min-h-screen pt-40 pb-32">
      {/* Hero */}
      <section aria-label="Philosophy introduction" className="px-6 md:px-12 max-w-7xl mx-auto mb-32 md:mb-44">
        <FadeInSection>
          <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
            philosophy
          </span>
          <h1 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(3rem,8vw,8rem)] mb-16 max-w-5xl">
            the standard is too low.
          </h1>
          <p className="font-serif italic text-offwhite/40 text-xl leading-relaxed max-w-xl">
            Standard primary care is built for triage. It is structured to identify disease,
            manage chronic conditions, and catch what is urgent. It does those things well.
          </p>
          <p className="font-serif italic text-offwhite/40 text-xl leading-relaxed max-w-xl mt-5">
            It was never built for optimization. Neither is &ldquo;in range.&rdquo;
          </p>
        </FadeInSection>
      </section>

      <div className="mx-6 md:mx-12 hairline-amber" aria-hidden="true" />

      {/* Section 1: Symptoms first */}
      <section aria-label="Symptoms first" className="px-6 md:px-12 max-w-7xl mx-auto py-32 md:py-44">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          <FadeInSection>
            <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
              01
            </span>
            <h2 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.75rem,5vw,5.5rem)] mb-12">
              symptoms first.
            </h2>
          </FadeInSection>
          <FadeInSection delay={0.14}>
            <div className="space-y-6 font-sans text-sm text-offwhite/50 leading-relaxed tracking-wide pt-4 md:pt-24">
              <p>
                A laboratory report is a snapshot. It shows you where a set of markers sat on the
                morning the blood was drawn. What it cannot show you is the person carrying those
                numbers — how they feel, how they recover, how they perform, what has changed over
                the past twelve months, and what they are trying to accomplish.
              </p>
              <p>
                The standard clinical read is to compare values against reference ranges and flag
                anything outside the boundaries. Values inside the range are deemed normal. The
                appointment ends.
              </p>
              <p>
                Symptoms are the first data. Before we look at a panel, we want to understand what
                the body is telling you in plain language — fatigue, recovery time, cognitive
                clarity, mood, body composition, sleep quality, drive. Symptoms are not subjective
                noise. They are signal. A panel read without them is a map read without knowing
                where you are.
              </p>
              <p>
                Bloodwork is read in context — against symptoms, history, and what the client is
                trying to do. Not against what is statistically common in the general population.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />

      {/* Section 2: Reference ranges */}
      <section aria-label="Reference ranges" className="px-6 md:px-12 max-w-7xl mx-auto py-32 md:py-44">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          <FadeInSection>
            <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
              02
            </span>
            <h2 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.75rem,5vw,5.5rem)] mb-12">
              optimal is individual.
            </h2>
          </FadeInSection>
          <FadeInSection delay={0.14}>
            <div className="space-y-6 font-sans text-sm text-offwhite/50 leading-relaxed tracking-wide pt-4 md:pt-24">
              <p>
                Reference ranges are built from population data. They describe where the bulk of a
                large, diverse sample of people fall — across ages, health statuses, activity
                levels, metabolic histories, and life circumstances. They are useful for identifying
                disease. They are a poor tool for defining individual adequacy.
              </p>
              <p>
                A value at the lowest fifth of the reference range is, by definition, within normal
                limits. Clinically, there is nothing to act on. And yet that person may be
                experiencing symptoms that are consistent with functional insufficiency — fatigue,
                poor recovery, difficulty building or maintaining lean mass, mood instability — none
                of which will appear on a flagged lab report.
              </p>
              <p>
                The question is not whether a marker is within the population range. The question
                is whether it is adequate for this person, at this point in their life, given their
                history, their goals, and what their body is doing.
              </p>
              <p>
                That is an individual question. It requires an individual answer.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />

      {/* Section 3: The system */}
      <section aria-label="The system" className="px-6 md:px-12 max-w-7xl mx-auto py-32 md:py-44">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          <FadeInSection>
            <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
              03
            </span>
            <h2 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.75rem,5vw,5.5rem)] mb-12">
              not a provider. a relationship.
            </h2>
          </FadeInSection>
          <FadeInSection delay={0.14}>
            <div className="space-y-6 font-sans text-sm text-offwhite/50 leading-relaxed tracking-wide pt-4 md:pt-24">
              <p>
                Most optimization practices operate by telling clients what to do. The goal at
                Blackline is different: to teach clients to understand and operate their own
                systems. To read their own data. To know what a shift in a marker means, why a
                protocol is structured the way it is, and how the system behaves.
              </p>
              <p>
                Dependence on a provider is not optimization. It is just a different kind of
                management. We are not trying to manage you. We are trying to give you the context
                and the tools to run your own biology.
              </p>
              <p>
                Blackline is not a gym. It is not a clinic. It does not prescribe or dispense
                medication. Pharmaceutical intervention, when indicated, is coordinated with a
                licensed physician — that relationship is maintained and respected. What we provide
                is the synthesis that connects the domains: the hormones, the training, the
                nutrition, and the structure of how you live.
              </p>
              <p>
                The critique here is not of medicine or of physicians. Most are skilled,
                principled, and operating under real constraints. The system they trained in was
                built for triage and disease management — and it is effective at both. It was
                simply never built for what we do.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* CTA */}
      <section aria-label="Contact CTA" className="px-6 md:px-12 max-w-7xl mx-auto border-t border-hairline pt-20 pb-10">
        <FadeInSection>
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            <div>
              <p className="font-serif text-xl text-offwhite/70 font-light tracking-wide">
                Engagements are limited. That is by design.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/contact">request a consult</Link>
            </Button>
          </div>
        </FadeInSection>
      </section>
    </div>
  )
}
