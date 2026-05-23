import { FadeInSection } from '@/components/FadeInSection'

const ACTS = [
  {
    id: 'train',
    index: '01',
    name: 'train',
    description:
      'biomechanics, progressive overload, measured intensity. every session built around your bloodwork and goals.',
  },
  {
    id: 'recover',
    index: '02',
    name: 'recover',
    description:
      "cold plunge, sauna, steam, deliberate cooldown. recovery is not optional — it's the work between the work.",
  },
  {
    id: 'heal',
    index: '03',
    name: 'heal',
    description:
      'in-house clinic, bloodwork analysis, hormone optimization, IV therapy. training informed by your biology.',
  },
]

export function PhilosophySection() {
  return (
    <section id="philosophy" className="bg-black" aria-label="Philosophy">
      {ACTS.map((act, i) => (
        <div key={act.id}>
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-44">
            <FadeInSection>
              <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
                {act.index}
              </span>

              <h2
                className="font-serif font-light text-offwhite lowercase leading-none tracking-wider mb-14"
                style={{ fontSize: 'clamp(4rem, 14vw, 13rem)' }}
              >
                {act.name}
              </h2>

              <p className="font-sans text-sm text-offwhite/50 leading-relaxed tracking-wide max-w-md">
                {act.description}
              </p>
            </FadeInSection>
          </div>

          {/* Amber hairline divider between acts */}
          {i < ACTS.length - 1 && (
            <div className="mx-6 md:mx-12 hairline-amber" aria-hidden="true" />
          )}
        </div>
      ))}
    </section>
  )
}
