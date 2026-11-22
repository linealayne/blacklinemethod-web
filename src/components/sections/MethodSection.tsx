import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { PillarStrand } from '@/components/PillarStrand'
import { PillarGene } from '@/components/pillars/PillarGene'

export const PILLARS = [
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

/**
 * Four pillars, one system. The statement on the left; on the right the
 * rotating gene (PillarGene) with one pillar's text beside it at a time.
 * From 1024px the whole section is exactly one screen below the header.
 * Below that it stacks: statement, gene, the active pillar, the index.
 *
 * Reduced motion, no WebGL, or no JavaScript: the static strand with all
 * four pillars listed in full (PillarStrand) shows in the gene's place.
 * The switch is CSS only (globals.css, "The rotating gene").
 *
 * PROTECTED: a staple of the site. Do not change unless Layne asks.
 */
export function MethodSection() {
  return (
    <section className="bl-method bg-black" aria-label="The Method">
      <div className="bl-wrap bl-method-wrap">
        <div className="relative">
          <span className="bl-rule" aria-hidden="true" />
          <span className="bl-cross -left-1 -top-1" aria-hidden="true" />
          <span className="bl-cross -right-1 -top-1" aria-hidden="true" />
        </div>
        <div className="bl-method-grid">
          <div className="bl-method-head">
            <Reveal as="p" className="bl-label bl-tick mb-4 lg:mb-8">
              the method
            </Reveal>
            <Reveal as="h2" className="bl-h2 max-w-[16ch]">
              four pillars. one system.
            </Reveal>
            <Reveal as="p" delay={0.08} className="mt-4 lg:mt-7 bl-body max-w-md">
              Hormones, training, nutrition, and lifestyle are not separate services. They are one
              circular system. The Blackline Method works across all four simultaneously.
            </Reveal>
          </div>

          <PillarGene pillars={PILLARS} />
          <PillarStrand pillars={PILLARS} origin="you" className="bl-rotor-static" />

          <div className="bl-method-foot">
            <Reveal delay={0.12} className="pt-4 lg:pt-8 border-t border-hairline max-w-md">
              <p className="bl-label bl-label-strong mb-2">One system</p>
              <p className="bl-body text-body-dim">
                Adjusting one without understanding the others produces incomplete results. The
                four are read together, around you.
              </p>
            </Reveal>

            <Reveal className="mt-3 lg:mt-10">
              <Link href="/method" className="group bl-link">
                <span className="bl-underline">Explore the full method</span>
                <span aria-hidden="true" className="bl-arrow" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
