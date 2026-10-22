'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useMotion } from '@/components/motion/MotionProvider'
import { Reveal } from '@/components/motion/Reveal'
import { gsap, useGSAP } from '@/lib/gsap'
import { motionFlags } from '@/lib/flags'
import { isPhone } from '@/lib/motion'
import { useFirstInteraction } from '@/lib/useFirstInteraction'

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

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section || !go || motionFlags().reduced) return
      const slides = gsap.utils.toArray<HTMLElement>('[data-slide]', section)
      const bars = gsap.utils.toArray<HTMLElement>('[data-bar]', section)
      const marks = gsap.utils.toArray<HTMLElement>('[data-mark]', section)

      // Initial state: first slide visible, others hidden below
      slides.forEach((s, i) => gsap.set(s, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : PRINCIPLES.slideY, pointerEvents: i === 0 ? 'auto' : 'none' }))
      bars.forEach((b, i) => gsap.set(b, { scaleX: i === 0 ? 1 : 0 }))
      marks.forEach((m, i) => gsap.set(m, { color: i === 0 ? '#C8965A' : '#8C8A84' }))

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

      // Hold, swap, hold, swap, hold. Each swap is a crossfade with a slide.
      const hold = 1
      const swap = 1
      let t = hold
      for (let i = 1; i < slides.length; i++) {
        tl.to(slides[i - 1], { opacity: 0, y: -PRINCIPLES.slideY, pointerEvents: 'none', duration: swap }, t)
        tl.fromTo(slides[i], { opacity: 0, y: PRINCIPLES.slideY }, { opacity: 1, y: 0, pointerEvents: 'auto', duration: swap }, t + swap * 0.25)
        tl.to(bars[i - 1], { scaleX: 0, transformOrigin: 'right center', duration: swap * 0.6 }, t)
        tl.to(bars[i], { scaleX: 1, transformOrigin: 'left center', duration: swap * 0.6 }, t + swap * 0.3)
        tl.to(marks[i - 1], { color: '#8C8A84', duration: swap * 0.5 }, t)
        tl.to(marks[i], { color: '#C8965A', duration: swap * 0.5 }, t + swap * 0.3)
        t += swap + hold
      }
      tl.to({}, { duration: hold * 0.4 })
    },
    { scope: sectionRef, dependencies: [go], revertOnUpdate: true }
  )

  return (
    <>
      <section
        id="philosophy"
        ref={sectionRef}
        className={[
          'bg-black border-t border-hairline',
          isStatic ? '' : 'bl-pinned min-h-[100svh] flex items-center',
        ].join(' ')}
        aria-label="Philosophy"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full py-24 md:py-28">
          <div className={isStatic ? 'space-y-24' : 'grid gap-10 md:grid-cols-[6rem_1fr] md:gap-16 items-start'}>
            {/* progress: 01 02 03 */}
            {!isStatic && (
              <div className="flex md:flex-col gap-6 md:gap-7 md:pt-3" aria-hidden="true">
                {TENETS.map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <span data-mark className="font-sans text-[11px] tracking-[0.3em] text-label">
                      {t.index}
                    </span>
                    <span className="block w-8 h-px bg-hairline relative overflow-hidden">
                      <span data-bar className="absolute inset-0 bg-amber origin-left" />
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className={isStatic ? 'space-y-24' : 'grid'}>
              {TENETS.map((tenet) => (
                <div
                  key={tenet.id}
                  data-slide
                  className={isStatic ? '' : '[grid-area:1/1]'}
                >
                  <span className="block bl-label mb-8">{tenet.index}</span>
                  <h2
                    className="font-serif font-light text-offwhite lowercase leading-[0.98] tracking-wider mb-10"
                    style={{ fontSize: 'clamp(2.9rem, 9vw, 8.5rem)' }}
                  >
                    {tenet.name}
                  </h2>
                  <p className="font-sans text-sm md:text-[15px] text-body leading-relaxed tracking-wide max-w-md">
                    {tenet.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={isStatic ? 'mt-20' : 'mt-14 md:mt-16 md:ml-[10rem]'}>
            <Reveal>
              <Link
                href="/philosophy"
                className="group inline-flex items-center gap-3 min-h-[44px] font-sans text-[11px] tracking-[0.2em] uppercase text-amber-muted transition-colors duration-600 hover:text-amber"
              >
                <span className="bl-underline">Read the full philosophy</span>
                <span aria-hidden="true" className="transition-transform duration-600 ease-lux group-hover:translate-x-1">→</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
