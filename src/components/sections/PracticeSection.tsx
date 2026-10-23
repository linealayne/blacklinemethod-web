import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'

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
    <Reveal stagger className={`grid gap-6 md:grid-cols-2 md:gap-8 ${className}`}>
      {PEOPLE.map((person) => (
        <article key={person.id} className="border border-hairline p-8 md:p-10 transition-colors duration-600 hover:border-amber/40">
          <div
            className="flex h-24 w-24 items-end justify-start border-b border-amber/40 font-serif font-light text-offwhite text-[4.5rem] leading-none"
            aria-hidden="true"
          >
            {person.name.charAt(0)}
          </div>
          <h3 className="mt-8 font-serif font-light text-offwhite lowercase tracking-wider text-2xl md:text-[1.75rem] leading-tight">
            {person.name.toLowerCase()}
          </h3>
          <p className="mt-2 bl-label bl-label-amber">{person.role}</p>
          <p className="mt-6 font-serif italic text-body text-lg leading-relaxed max-w-md">
            &ldquo;{person.line}&rdquo;
          </p>
        </article>
      ))}
    </Reveal>
  )
}

export function PracticeSection() {
  return (
    <section className="bg-black border-t border-hairline" aria-label="The practice">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-3xl">
          <Reveal as="p" className="bl-label mb-8">
            the practice
          </Reveal>
          <SplitReveal
            as="h2"
            className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.5rem,4.8vw,5rem)]"
          >
            the practice.
          </SplitReveal>
          <Reveal as="p" delay={0.2} className="mt-8 font-serif italic text-body text-lg md:text-xl leading-relaxed max-w-xl">
            two people. a small number of clients. by design.
          </Reveal>
        </div>
        <PracticeCards className="mt-14 md:mt-16" />
      </div>
    </section>
  )
}
