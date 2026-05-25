import type { Metadata } from 'next'
import Link from 'next/link'
import { FadeInSection } from '@/components/FadeInSection'
import { MethodDiagram } from '@/components/MethodDiagram'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'The Method — Blackline Method',
  description:
    'Hormones, training, nutrition, and lifestyle as four interconnected pillars of one system. The Blackline Method works across all four simultaneously.',
}

const PILLARS = [
  {
    id: 'hormones',
    index: '01',
    label: 'Hormones',
    headline: 'the endocrine system sets the ceiling.',
    body: [
      'Hormones are not one variable. They are a network of interdependent signals that govern how the body builds, burns, recovers, thinks, and ages. Testosterone, estradiol, LH, FSH, SHBG, thyroid markers, cortisol, insulin — each interacts with the others, and no single marker tells you what the system is doing.',
      'We read panels in full — not against population reference ranges, but against the individual. Symptoms are mapped against markers. Trends across time are tracked. Ratios and interactions are considered alongside absolute values.',
      'Hormone optimization guidance is provided by Spencer. When pharmaceutical intervention is clinically appropriate, it is coordinated with a licensed physician — that relationship is maintained and respected. Blackline does not prescribe or dispense medication.',
    ],
  },
  {
    id: 'training',
    index: '02',
    label: 'Training',
    headline: 'a program is a stimulus.',
    body: [
      'What the body does with a training stimulus depends almost entirely on the system underneath it — the hormonal environment, the nutritional substrate, the quality of recovery. The best program in the world on a broken substrate produces mediocre results. We design training that accounts for that reality.',
      'Programs are built from first principles: biomechanics, progressive overload, measured intensity. They are structured around your current physiological state — not generic templates applied generically. Frequency, volume, and load are calibrated to what the system can actually recover from.',
      'Training is one component. It is built in the context of everything else we know about your biology.',
    ],
  },
  {
    id: 'nutrition',
    index: '03',
    label: 'Nutrition',
    headline: 'the substrate the system runs on.',
    body: [
      'Nutrition is not a diet. It is the supply chain that determines whether training converts to adaptation, whether the endocrine system has what it needs to function, and whether the body has the caloric and macronutrient availability to do the work it is being asked to do.',
      'We design nutritional approaches from first principles — around actual energy demands, body composition goals, hormone and metabolic considerations, and how the client realistically lives and eats. Generic protocols applied to people who don\'t fit the generic model produce inconsistent results.',
      'The goal is not adherence to a rigid plan. It is an approach the person can sustain — because sustainability is where results actually compound.',
    ],
  },
  {
    id: 'lifestyle',
    index: '04',
    label: 'Lifestyle',
    headline: 'the structure of how you live.',
    body: [
      'Sleep, stress, recovery practices, and the consistency of daily structure are not soft variables. They are inputs into the system with measurable effects on hormonal function, training adaptation, metabolic health, and cognitive performance.',
      'Insufficient sleep does not slightly reduce results. It systematically prevents the conversion of effort into outcome. Chronic stress load does not merely affect mood — it has direct effects on the hormonal environment that governs everything else.',
      'We do not design protocols for ideal circumstances. We build approaches that account for how clients actually live, then work to optimize the variables within that context. The goal is a system the client can operate consistently — because consistency is what produces lasting change.',
    ],
  },
]

export default function MethodPage() {
  return (
    <div className="bg-black min-h-screen pt-40 pb-32">
      {/* Hero */}
      <section aria-label="Method introduction" className="px-6 md:px-12 max-w-7xl mx-auto mb-24">
        <FadeInSection>
          <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
            the method
          </span>
          <h1 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(3rem,8vw,8rem)] mb-12 max-w-5xl">
            four pillars. one system.
          </h1>
          <p className="font-sans text-sm text-offwhite/45 leading-relaxed tracking-wide max-w-lg">
            Hormones, training, nutrition, and lifestyle are not four separate services. They are
            one circular system. Adjusting one without understanding the others produces incomplete
            results. The Blackline Method addresses all four simultaneously — because that is what
            it takes to actually move the system.
          </p>
        </FadeInSection>
      </section>

      {/* Diagram */}
      <section aria-label="System diagram" className="px-6 md:px-12 max-w-7xl mx-auto mb-32">
        <FadeInSection delay={0.12}>
          <div className="flex items-center justify-center py-16 border border-hairline">
            <MethodDiagram className="w-full max-w-[560px] h-auto" />
          </div>
        </FadeInSection>
      </section>

      {/* Pillars */}
      {PILLARS.map((pillar, i) => (
        <div key={pillar.id}>
          <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
          <section
            aria-label={pillar.label}
            className="px-6 md:px-12 max-w-7xl mx-auto py-32 md:py-44"
          >
            <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
              <FadeInSection>
                <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-6">
                  {pillar.index}
                </span>
                <span className="block font-sans text-[11px] tracking-[0.22em] uppercase text-amber/60 mb-8">
                  {pillar.label}
                </span>
                <h2 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.25rem,4vw,4rem)]">
                  {pillar.headline}
                </h2>
              </FadeInSection>
              <FadeInSection delay={0.14}>
                <div className="space-y-6 font-sans text-sm text-offwhite/50 leading-relaxed tracking-wide pt-4 md:pt-20">
                  {pillar.body.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </FadeInSection>
            </div>
          </section>
        </div>
      ))}

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
