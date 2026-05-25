import Link from 'next/link'
import { FadeInSection } from '@/components/FadeInSection'
import { MethodDiagram } from '@/components/MethodDiagram'

const PILLARS = [
  {
    id: 'hormones',
    label: 'Hormones',
    description:
      'Endocrine function sets the ceiling on everything else. We read panels in full context — markers, ratios, trends — and design protocols around how your system actually operates.',
  },
  {
    id: 'training',
    label: 'Training',
    description:
      'A program is a stimulus. What the body does with it depends on the system underneath. Training is built from first principles — biomechanics, progressive overload, measured intensity — against your biology.',
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    description:
      'Nutrition is the substrate the system runs on. We design approaches that support the actual demands of your protocol — not generic guidelines applied to a generic body.',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    description:
      'Sleep, stress, recovery, and the structure of how you live are not soft variables. They govern whether effort converts to adaptation. We build around how you actually live.',
  },
]

export function MethodSection() {
  return (
    <section className="bg-black border-t border-hairline" aria-label="The Method">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-44">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left: intro + pillars */}
          <div>
            <FadeInSection>
              <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
                the method
              </span>
              <h2 className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.75rem,5vw,5.5rem)] mb-12">
                four pillars. one system.
              </h2>
              <p className="font-sans text-sm text-offwhite/50 leading-relaxed tracking-wide mb-14 max-w-md">
                Hormones, training, nutrition, and lifestyle are not separate services. They are one
                circular system. Adjusting one without understanding the others produces incomplete
                results. The Blackline Method works across all four simultaneously.
              </p>
            </FadeInSection>

            <div className="space-y-10">
              {PILLARS.map((pillar, i) => (
                <FadeInSection key={pillar.id} delay={0.08 * i}>
                  <div className="flex gap-6">
                    <div className="pt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber/40 mt-1" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-amber/60 mb-2">
                        {pillar.label}
                      </p>
                      <p className="font-sans text-sm text-offwhite/45 leading-relaxed tracking-wide">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>

            <FadeInSection delay={0.36}>
              <div className="mt-14">
                <Link
                  href="/method"
                  className="font-sans text-[11px] tracking-[0.2em] uppercase text-amber/60 transition-colors duration-600 hover:text-amber inline-flex items-center gap-3"
                >
                  Explore the full method
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </FadeInSection>
          </div>

          {/* Right: diagram */}
          <FadeInSection delay={0.18}>
            <div className="flex items-center justify-center py-8">
              <MethodDiagram className="w-full max-w-[420px] h-auto opacity-80" />
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  )
}
