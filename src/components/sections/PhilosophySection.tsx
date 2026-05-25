import Link from 'next/link'
import { FadeInSection } from '@/components/FadeInSection'

const TENETS = [
  {
    id: 'symptoms',
    index: '01',
    name: 'symptoms first.',
    description:
      'Bloodwork is read in context — against symptoms, history, and goals. Not against population reference ranges. A value in range is not the same as a value that is adequate for you.',
  },
  {
    id: 'individual',
    index: '02',
    name: 'optimal is individual.',
    description:
      'Standard primary care is structured for triage and disease management. It was never built to optimize. We operate in the space between "nothing is wrong" and "performing at the level you should."',
  },
  {
    id: 'system',
    index: '03',
    name: 'one system.',
    description:
      'Hormones, training, nutrition, and the structure of how you live are not separate domains. They are one system. Adjusting one without understanding the others produces incomplete results.',
  },
]

export function PhilosophySection() {
  return (
    <section id="philosophy" className="bg-black border-t border-hairline" aria-label="Philosophy">
      {TENETS.map((tenet, i) => (
        <div key={tenet.id}>
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-44">
            <FadeInSection>
              <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
                {tenet.index}
              </span>

              <h2
                className="font-serif font-light text-offwhite lowercase leading-none tracking-wider mb-14"
                style={{ fontSize: 'clamp(3rem, 10vw, 9rem)' }}
              >
                {tenet.name}
              </h2>

              <p className="font-sans text-sm text-offwhite/50 leading-relaxed tracking-wide max-w-md">
                {tenet.description}
              </p>
            </FadeInSection>
          </div>

          {i < TENETS.length - 1 && (
            <div className="mx-6 md:mx-12 hairline-amber" aria-hidden="true" />
          )}
        </div>
      ))}

      {/* Link to full philosophy page */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
        <FadeInSection>
          <Link
            href="/philosophy"
            className="font-sans text-[11px] tracking-[0.2em] uppercase text-amber/60 transition-colors duration-600 hover:text-amber inline-flex items-center gap-3"
          >
            Read the full philosophy
            <span aria-hidden="true">→</span>
          </Link>
        </FadeInSection>
      </div>
    </section>
  )
}
