'use client'

import { useRef } from 'react'
import { motionFlags } from '@/lib/flags'
import { useGsapEffect } from '@/lib/useGsap'

export interface TimelineStep {
  index: string
  label: string
  description: string
}

/** Scroll-drawn timeline: horizontal on desktop, vertical on phones. */
const TIMELINE = {
  start: 'top 72%',
  end: 'bottom 78%',
  scrub: 0.6,
  bracketAt: 0.1, // when the "first ninety days" marker appears
}

export function ProcessTimeline({ steps, bracket = true }: { steps: TimelineStep[]; bracket?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useGsapEffect(
    ({ gsap, ScrollTrigger }) => {
      const root = rootRef.current
      if (!root || motionFlags().reduced) return
      const ctx = gsap.context(() => {
        const fill = root.querySelector<HTMLElement>('[data-rail-fill]')
        const dots = gsap.utils.toArray<HTMLElement>('[data-dot]', root)
        const bodies = gsap.utils.toArray<HTMLElement>('[data-step-body]', root)
        const bracketEl = root.querySelector<HTMLElement>('[data-bracket]')

        const mm = gsap.matchMedia()
        mm.add({ desktop: '(min-width: 768px)', phone: '(max-width: 767px)' }, (mctx) => {
          const { desktop } = mctx.conditions as { desktop: boolean }
          gsap.set(fill, desktop ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 })
          gsap.set(bodies, { opacity: 0, y: 10 })
          gsap.set(dots, { borderColor: '#2A2A2A', backgroundColor: '#0A0A0A', boxShadow: '0 0 0 rgba(0,0,0,0)' })
          if (bracketEl) gsap.set(bracketEl, { opacity: 0 })

          const tl = gsap.timeline({
            scrollTrigger: { trigger: root, start: TIMELINE.start, end: TIMELINE.end, scrub: TIMELINE.scrub },
            defaults: { ease: 'none' },
          })
          tl.to(fill, desktop ? { scaleX: 1, duration: 1 } : { scaleY: 1, duration: 1 }, 0)
          const n = steps.length
          steps.forEach((_, i) => {
            const reach = desktop ? (i / n) * 0.98 + 0.01 : (i / n) * 0.9 + 0.03
            tl.to(
              dots[i],
              { borderColor: '#C8965A', backgroundColor: '#C8965A', boxShadow: '0 0 16px rgba(200,150,90,0.55)', duration: 0.05, ease: 'power2.out' },
              reach
            )
            tl.to(bodies[i], { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, reach + 0.01)
          })
          if (bracketEl) tl.to(bracketEl, { opacity: 1, duration: 0.1, ease: 'power2.out' }, TIMELINE.bracketAt)
        })
        ScrollTrigger.refresh()
      }, root)
      return () => ctx.revert()
    },
    [steps.length]
  )

  return (
    <div ref={rootRef} className="relative md:pt-14">
      {/* rail */}
      <div
        className="absolute left-[5px] top-0 bottom-0 w-px bg-hairline md:left-0 md:right-0 md:top-[19px] md:bottom-auto md:h-px md:w-auto md:translate-y-14"
        aria-hidden="true"
      />
      <div
        data-rail-fill
        className="absolute left-[5px] top-0 bottom-0 w-px bg-amber origin-top md:left-0 md:right-0 md:top-[19px] md:bottom-auto md:h-px md:w-auto md:origin-left md:translate-y-14"
        aria-hidden="true"
      />

      {/* first ninety days: spans Intake to Protocol */}
      {bracket && (
        <div
          data-bracket
          className="hidden md:block absolute top-0 left-0"
          style={{ width: 'calc((100% - 4rem) / 3 + 2rem)' }}
          aria-hidden="true"
        >
          <span className="bl-label bl-label-amber text-[10px]">the first ninety days</span>
          <div className="mt-2 h-px bg-amber/30 relative">
            <span className="absolute left-0 -top-[3px] h-[7px] w-px bg-amber/60" />
            <span className="absolute right-0 -top-[3px] h-[7px] w-px bg-amber/60" />
          </div>
        </div>
      )}

      <ol className="grid gap-12 pl-9 md:pl-0 md:grid-cols-3 md:gap-8 md:pt-14">
        {steps.map((step) => (
          <li key={step.index} className="relative">
            <span
              data-dot
              className="absolute -left-9 top-[3px] block w-[11px] h-[11px] rounded-full border border-hairline bg-black md:static md:mb-7"
              aria-hidden="true"
            />
            <div data-step-body>
              <span className="block bl-label mb-3">{step.index}</span>
              <p className="bl-label bl-label-amber mb-4">{step.label}</p>
              <p className="font-sans text-sm md:text-[15px] text-body leading-relaxed tracking-wide max-w-sm">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
