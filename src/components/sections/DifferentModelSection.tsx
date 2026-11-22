import { Reveal } from '@/components/motion/Reveal'
import { Folio } from '@/components/layout/Folio'

const PAIRS = [
  { system: 'built around the clock.', blackline: 'built around you.' },
  { system: 'the population average.', blackline: 'your biology.' },
  { system: 'one protocol for everyone.', blackline: 'a protocol built for you.' },
]

/**
 * The contrast table: the system on the left, set back; Blackline on the
 * right, at full strength. On hover a row's Blackline side picks up the
 * tan reading point.
 */
export function DifferentModelSection() {
  return (
    <Folio label="a different model of care" ariaLabel="A different model of care">
      <div className="max-w-4xl">
        <Reveal as="h2" className="bl-h2">
          the office visit and the prescription were never the whole answer.
        </Reveal>
        <Reveal as="p" delay={0.08} className="mt-7 md:mt-8 bl-lead">
          We work in the space conventional care was never built for.
        </Reveal>
      </div>

      <div className="mt-16 md:mt-20">
        <div className="hidden md:grid md:grid-cols-[1fr_6rem_1fr] md:items-end mb-5">
          <span className="bl-label">the system</span>
          <span />
          <span className="bl-label bl-label-strong">blackline</span>
        </div>

        <Reveal stagger className="border-t border-hairline">
          {PAIRS.map((pair) => (
            <div
              key={pair.system}
              className="group grid gap-y-2 py-7 md:py-9 border-b border-hairline md:grid-cols-[1fr_6rem_1fr] md:items-center"
            >
              <span className="md:hidden bl-label text-[10px]">the system</span>
              <p className="bl-serif-caps text-[1.05rem] md:text-[1.4rem] leading-[1.25] tracking-[0.08em] text-offwhite/40">
                {pair.system}
              </p>
              <span className="hidden md:flex items-center mx-5" aria-hidden="true">
                <span className="h-px flex-1 bg-offwhite/25 transition-colors duration-500 group-hover:bg-tan/60" />
                <span className="ml-[-1px] h-[5px] w-[5px] rounded-full border border-offwhite/50 transition-colors duration-500 group-hover:border-tan group-hover:bg-tan" />
              </span>
              <span className="md:hidden bl-label bl-label-strong text-[10px] mt-4">blackline</span>
              <p className="bl-serif-caps text-[1.05rem] md:text-[1.4rem] leading-[1.25] tracking-[0.08em]">
                {pair.blackline}
              </p>
            </div>
          ))}
        </Reveal>

        <Reveal as="p" className="mt-10 bl-body text-body-dim max-w-lg">
          Not a replacement for your physician. Coordination with one when prescription intervention
          is truly appropriate.
        </Reveal>
      </div>
    </Folio>
  )
}
