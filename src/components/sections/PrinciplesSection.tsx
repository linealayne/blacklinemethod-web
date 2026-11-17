'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useMotion } from '@/components/motion/MotionProvider'
import { Reveal } from '@/components/motion/Reveal'
import { motionFlags } from '@/lib/flags'
import { isPhone } from '@/lib/motion'
import { useFirstInteraction } from '@/lib/useFirstInteraction'
import { useGsapEffect } from '@/lib/useGsap'

export const TENETS = [
  {
    id: 'symptoms',
    index: '01',
    name: 'symptoms first.',
    description:
      'Bloodwork is read in context, against symptoms, history, and goals. Not against population reference ranges. A value in range is not the same as a value that is adequate for you.',
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

/** Pinned principles choreography */
const PRINCIPLES = {
  pinDesktop: '+=250%',
  pinPhone: '+=200%',
  scrub: 0.6,
  slideY: 36, // px of vertical slide during the swap
}

export function PrinciplesSection() {
  const { mounted, reduced } = useMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const isStatic = mounted && reduced
  const go = useFirstInteraction(mounted && !reduced)

  useGsapEffect(
    ({ gsap, ScrollTrigger }) => {
      const section = sectionRef.current
      if (!section || !go || motionFlags().reduced) return
      const ctx = gsap.context(() => {
        const slides = gsap.utils.toArray<HTMLElement>('[data-slide]', section)
        const bars = gsap.utils.toArray<HTMLElement>('[data-bar]', section)
        const marks = gsap.utils.toArray<HTMLElement>('[data-mark]', section)

        slides.forEach((s, i) =>
          gsap.set(s, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : PRINCIPLES.slideY, pointerEvents: i === 0 ? 'auto' : 'none' })
        )
        bars.forEach((b, i) => gsap.set(b, { scaleX: i === 0 ? 1 : 0 }))
        marks.forEach((m, i) => gsap.set(m, { color: i === 0 ? '#F2F1EC' : '#8C8A84' }))

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: isPhone() ? PRINCIPLES.pinPhone : PRINCIPLES.pinDesktop,
            pin: true,
            scrub: PRINCIPLES.scrub,
            anticipatePin: 1,
          },
        })

        const hold = 1
        const swap = 1
        let t = hold
        for (let i = 1; i < slides.length; i++) {
          tl.to(slides[i - 1], { opacity: 0, y: -PRINCIPLES.slideY, pointerEvents: 'none', duration: swap }, t)
          tl.fromTo(slides[i], { opacity: 0, y: PRINCIPLES.slideY }, { opacity: 1, y: 0, pointerEvents: 'auto', duration: swap }, t + swap * 0.25)
          tl.to(bars[i - 1], { scaleX: 0, transformOrigin: 'right center', duration: swap * 0.6 }, t)
          tl.to(bars[i], { scaleX: 1, transformOrigin: 'left center', duration: swap * 0.6 }, t + swap * 0.3)
          tl.to(marks[i - 1], { color: '#8C8A84', duration: swap * 0.5 }, t)
          tl.to(marks[i], { color: '#F2F1EC', duration: swap * 0.5 }, t + swap * 0.3)
          t += swap + hold
        }
        tl.to({}, { duration: hold * 0.4 })
        ScrollTrigger.refresh()
      }, section)
      return () => ctx.revert()
    },
    [go]
  )

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className={['bg-black', isStatic ? '' : 'bl-pinned min-h-[100svh] flex items-center'].join(' ')}
      aria-label="Philosophy"
    >
      <div className="bl-wrap w-full">
        <span className="bl-rule" aria-hidden="true" />
        <div className="bl-folio py-24 md:py-28">
          <div className="bl-margin">
            {!isStatic && (
              <div className="flex lg:flex-col gap-6 lg:gap-5" aria-hidden="true">
                {TENETS.map((t) => (
                  <div key={t.id} className="flex items-center gap-4">
                    <span data-mark className="font-sans text-[10.5px] font-medium tracking-[0.2em] text-label tabular-nums">
                      {t.index}
                    </span>
                    <span className="block w-8 lg:w-14 h-px bg-hairline relative overflow-hidden">
                      <span data-bar className="absolute inset-0 bg-amber origin-left" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className={isStatic ? 'space-y-24' : 'grid'}>
              {TENETS.map((tenet) => (
                <div key={tenet.id} data-slide className={isStatic ? '' : '[grid-area:1/1]'}>
                  <span className="block bl-label mb-8 tabular-nums">{tenet.index}</span>
                  <h2
                    className="font-serif font-light text-offwhite lowercase leading-[0.92] tracking-[-0.035em] mb-10 md:mb-12"
                    style={{ fontSize: 'clamp(3rem, 10vw, 10rem)' }}
                  >
                    {tenet.name}
                  </h2>
                  <div className="grid md:grid-cols-12">
                    <p className="bl-body md:col-start-6 md:col-span-7 lg:col-start-7 lg:col-span-6">{tenet.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 md:mt-14 grid md:grid-cols-12">
              <Reveal className="md:col-start-6 md:col-span-7 lg:col-start-7 lg:col-span-6">
                <Link href="/philosophy" className="group bl-link transition-opacity duration-600">
                  <span className="bl-underline">Read the full philosophy</span>
                  <span aria-hidden="true" className="bl-arrow" />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
