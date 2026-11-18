'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { MethodWheel } from '@/components/MethodWheel'

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
 * Four pillars, one system. The wheel turns on its own (time-based, never
 * scroll-based); the panel beside it crossfades to whichever pillar is at
 * the front marker, or to the one being hovered, focused, or tapped.
 */
export function MethodSection() {
  const [active, setActive] = useState(0)
  const onActive = useCallback((i: number) => setActive(i), [])

  return (
    <section className="bg-black" aria-label="The Method">
      <div className="bl-wrap">
        <div className="relative">
          <span className="bl-rule" aria-hidden="true" />
          <span className="bl-cross -left-1 -top-1" aria-hidden="true" />
          <span className="bl-cross -right-1 -top-1" aria-hidden="true" />
        </div>
        <div className="py-24 md:py-32 grid gap-12 md:grid-cols-2 md:gap-x-16 lg:gap-x-24 md:gap-y-0">
          <div className="md:col-start-1 md:row-start-1 md:self-end">
            <Reveal as="p" className="bl-label bl-tick mb-8">
              the method
            </Reveal>
            <Reveal as="h2" className="bl-h2 max-w-[16ch]">
              four pillars. one system.
            </Reveal>
            <Reveal as="p" delay={0.08} className="mt-7 bl-body max-w-md">
              Hormones, training, nutrition, and lifestyle are not separate services. They are one
              circular system. The Blackline Method works across all four simultaneously.
            </Reveal>
          </div>

          <Reveal delay={0.1} className="md:col-start-2 md:row-start-1 md:row-span-2 md:self-center">
            <MethodWheel pillars={PILLARS} onActive={onActive} className="mx-auto max-w-[380px] md:max-w-[560px]" />
          </Reveal>

          <div className="md:col-start-1 md:row-start-2">
            {/* The panel: every pillar is in the DOM; the active one is shown */}
            <Reveal delay={0.12} className="md:mt-12 pt-8 border-t border-hairline">
              <div className="grid min-h-[13rem] md:min-h-[12rem]">
                {PILLARS.map((pillar, i) => (
                  <div
                    key={pillar.id}
                    className={[
                      '[grid-area:1/1] transition-[opacity,transform] duration-500 ease-lux',
                      i === active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <span className="bl-label text-amber tabular-nums">0{i + 1}</span>
                      <span className="h-px w-8 bg-teal/60" aria-hidden="true" />
                    </div>
                    <h3 className="bl-h3 mb-4">{pillar.label}</h3>
                    <p className="bl-body max-w-md">{pillar.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <p className="bl-label bl-label-strong mb-2">One system</p>
                <p className="bl-body text-body-dim max-w-md">
                  Adjusting one without understanding the others produces incomplete results. The
                  four are read together, around you.
                </p>
              </div>
            </Reveal>

            <Reveal className="mt-10">
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
