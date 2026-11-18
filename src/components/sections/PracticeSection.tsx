import { Reveal } from '@/components/motion/Reveal'
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
 * display-caps monogram; swap in a tall portrait when the files land.
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
              <h3 className="bl-h3">{person.name}</h3>
              <p className="mt-4 bl-label">{person.role}</p>
            </div>
            <span
              className="bl-serif-caps text-offwhite/[0.12] text-[6rem] md:text-[8rem] leading-[0.75] select-none transition-colors duration-600 ease-lux group-hover:text-amber/35"
              aria-hidden="true"
            >
              {person.name.charAt(0)}
            </span>
          </div>
          <p className="mt-10 md:mt-14 bl-lead text-offwhite/75 max-w-md">&ldquo;{person.line}&rdquo;</p>
        </article>
      ))}
    </Reveal>
  )
}

export function PracticeSection() {
  return (
    <Folio label="the practice" ariaLabel="The practice">
      <div className="max-w-4xl">
        <Reveal as="h2" className="bl-h2">
          the practice.
        </Reveal>
        <Reveal as="p" delay={0.08} className="mt-7 md:mt-8 bl-lead">
          Two people. A small number of clients. By design.
        </Reveal>
      </div>
      <PracticeCards className="mt-14 md:mt-20" />
    </Folio>
  )
}
