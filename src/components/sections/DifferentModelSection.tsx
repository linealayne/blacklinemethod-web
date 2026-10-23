'use client'

import { useRef } from 'react'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { Reveal, observeOnce } from '@/components/motion/Reveal'
import { motionFlags } from '@/lib/flags'
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
        tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, at + 0.15)
        tl.fromTo(bl, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: MODEL.systemIn }, at + MODEL.blacklineDelay)
        tl.to(sys, { opacity: MODEL.systemDim, duration: 1.1 }, at + MODEL.blacklineDelay + 0.2)
      })
      observeOnce(root, 'top 78%', () => tl.play())
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="bg-black border-t border-hairline" aria-label="A different model of care">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-3xl">
          <Reveal as="p" className="bl-label mb-8">
            a different model of care
          </Reveal>
          <SplitReveal
            as="h2"
            className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.08] text-[clamp(2.25rem,4.6vw,4.75rem)]"
          >
            the office visit and the prescription were never the whole answer.
          </SplitReveal>
          <Reveal as="p" delay={0.25} className="mt-8 font-serif italic text-body text-lg md:text-xl leading-relaxed max-w-xl">
            we work in the space conventional care was never built for.
          </Reveal>
        </div>

        <div ref={rootRef} className="mt-16 md:mt-24">
          <div className="hidden md:grid md:grid-cols-[1fr_5rem_1fr] md:items-end mb-8">
            <span className="bl-label">the system</span>
            <span />
            <span className="bl-label bl-label-amber">blackline</span>
          </div>

          <div className="divide-y divide-hairline border-y border-hairline">
            {PAIRS.map((pair) => (
              <div
                key={pair.system}
                data-row
                className="grid gap-y-3 py-7 md:py-9 md:grid-cols-[1fr_5rem_1fr] md:items-center"
              >
                <span className="md:hidden bl-label text-[10px]">the system</span>
                <p
                  data-system
                  className="font-serif font-light text-offwhite text-[1.6rem] md:text-[2.1rem] leading-[1.15] tracking-wide lowercase -mt-1 md:mt-0"
                  style={{ opacity: 0.85 }}
                >
                  {pair.system}
                </p>
                <span className="hidden md:block h-px bg-amber/40 origin-left mx-4" data-rule aria-hidden="true" />
                <span className="md:hidden bl-label bl-label-amber text-[10px] mt-3">blackline</span>
                <p
                  data-blackline
                  className="font-serif font-light text-offwhite text-[1.6rem] md:text-[2.1rem] leading-[1.15] tracking-wide lowercase -mt-1 md:mt-0"
                >
                  {pair.blackline}
                </p>
              </div>
            ))}
          </div>

          <Reveal as="p" className="mt-10 font-sans text-sm text-body-dim leading-relaxed tracking-wide max-w-lg">
            Not a replacement for your physician. Coordination with one when prescription intervention
            is truly appropriate.
          </Reveal>
        </div>
      </div>
    </section>
  )
}
