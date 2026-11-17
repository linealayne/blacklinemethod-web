'use client'

import { useRef } from 'react'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { Reveal, observeOnce } from '@/components/motion/Reveal'
import { motionFlags } from '@/lib/flags'
import { Folio } from '@/components/layout/Folio'
import { useGsapEffect } from '@/lib/useGsap'

const PAIRS = [
  { system: 'built around the clock.', blackline: 'built around you.' },
  { system: 'the population average.', blackline: 'your biology.' },
  { system: 'one protocol for everyone.', blackline: 'a protocol built for you.' },
]

/** Reveal choreography for the contrast rows */
const MODEL = {
  rowStagger: 0.42,
  systemIn: 0.9,
  systemDim: 0.42, // resting opacity of the system side once blackline brightens
  blacklineDelay: 0.3,
}

export function DifferentModelSection() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGsapEffect(({ gsap }) => {
    const root = rootRef.current
    if (!root || motionFlags().reduced) return
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-row]'))
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      rows.forEach((row, i) => {
        const sys = row.querySelector('[data-system]')
        const bl = row.querySelector('[data-blackline]')
        const rule = row.querySelector('[data-rule]')
        const at = i * MODEL.rowStagger
        tl.fromTo(sys, { opacity: 0, y: 14 }, { opacity: 0.85, y: 0, duration: MODEL.systemIn }, at)
        tl.fromTo(rule, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, at + 0.15)
        tl.fromTo(bl, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: MODEL.systemIn }, at + MODEL.blacklineDelay)
        tl.to(sys, { opacity: MODEL.systemDim, duration: 1.1 }, at + MODEL.blacklineDelay + 0.2)
      })
      observeOnce(root, 'top 78%', () => tl.play())
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <Folio label="a different model of care" ariaLabel="A different model of care">
      <div className="max-w-4xl">
        <SplitReveal as="h2" className="bl-h2">
          the office visit and the prescription were never the whole answer.
        </SplitReveal>
        <Reveal as="p" delay={0.25} className="mt-8 md:mt-10 bl-lead">
          we work in the space conventional care was never built for.
        </Reveal>
      </div>

      <div ref={rootRef} className="mt-16 md:mt-24">
        <div className="hidden md:grid md:grid-cols-[1fr_6rem_1fr] md:items-end mb-6">
          <span className="bl-label">the system</span>
          <span />
          <span className="bl-label bl-label-strong">blackline</span>
        </div>

        <div className="border-t border-hairline">
          {PAIRS.map((pair) => (
            <div
              key={pair.system}
              data-row
              className="grid gap-y-2 py-7 md:py-10 border-b border-hairline md:grid-cols-[1fr_6rem_1fr] md:items-center"
            >
              <span className="md:hidden bl-label text-[10px]">the system</span>
              <p
                data-system
                className="font-serif font-light text-offwhite text-[1.6rem] md:text-[2.2rem] leading-[1.1] tracking-[-0.015em] lowercase"
                style={{ opacity: 0.42 }}
              >
                {pair.system}
              </p>
              <span className="hidden md:flex items-center mx-5" data-rule aria-hidden="true">
                <span className="h-px flex-1 bg-offwhite/30" />
                <span className="ml-[-1px] h-[5px] w-[5px] rounded-full border border-offwhite/50" />
              </span>
              <span className="md:hidden bl-label bl-label-strong text-[10px] mt-4">blackline</span>
              <p
                data-blackline
                className="font-serif font-light text-offwhite text-[1.6rem] md:text-[2.2rem] leading-[1.1] tracking-[-0.015em] lowercase"
              >
                {pair.blackline}
              </p>
            </div>
          ))}
        </div>

        <Reveal as="p" className="mt-10 bl-body text-body-dim max-w-lg">
          Not a replacement for your physician. Coordination with one when prescription intervention
          is truly appropriate.
        </Reveal>
      </div>
    </Folio>
  )
}
