import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { Folio } from '@/components/layout/Folio'

export const PEOPLE = [
  {
    id: 'layne',
    name: 'Layne.',
    role: 'Training and programming.',
    line: 'Two years running private training taught me that the program is only as good as what you understand about the person.',
  },
  {
    id: 'spencer',
    name: 'Spencer.',
    role: 'Biology and health science.',
    line: 'The numbers on a panel are a starting point. The person they belong to is the point.',
  },
]

/**
 * Two cards, side by side on desktop, stacked on phones. No photos exist yet
 * (public/team/layne.jpg, public/team/spencer.jpg), so each card carries a
 * serif monogram; swap in a tall portrait when the files land.
 */
export function PracticeCards({ className = '' }: { className?: string }) {
  return (
    <Reveal stagger className={`grid md:grid-cols-2 border-t border-hairline ${className}`}>
      {PEOPLE.map((person, i) => (
        <article
          key={person.id}
          className={[
            'group relative pt-10 pb-12 md:pt-12 md:pb-4',
            i === 0 ? 'border-b border-hairline md:border-b-0 md:border-r md:pr-12' : 'md:pl-12',
          ].join(' ')}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="font-serif font-light text-offwhite lowercase tracking-[-0.02em] text-[2.25rem] md:text-[2.75rem] leading-none">
                {person.name.toLowerCase()}
              </h3>
              <p className="mt-4 bl-label">{person.role}</p>
            </div>
            <span
              data-parallax="-30"
              className="font-serif font-light text-offwhite/[0.14] text-[6.5rem] md:text-[8.5rem] leading-[0.75] tracking-[-0.04em] select-none transition-colors duration-800 ease-lux group-hover:text-offwhite/25"
              aria-hidden="true"
            >
              {person.name.charAt(0)}
            </span>
          </div>
          <p className="mt-10 md:mt-14 bl-lead text-offwhite/80 max-w-md">&ldquo;{person.line}&rdquo;</p>
        </article>
      ))}
    </Reveal>
  )
}

export function PracticeSection() {
  return (
    <Folio label="the practice" ariaLabel="The practice">
      <div className="max-w-4xl">
        <SplitReveal as="h2" className="bl-h2">
          the practice.
        </SplitReveal>
        <Reveal as="p" delay={0.2} className="mt-8 md:mt-10 bl-lead">
          two people. a small number of clients. by design.
        </Reveal>
      </div>
      <PracticeCards className="mt-14 md:mt-20" />
    </Folio>
  )
}
