'use client'

import { createElement, useRef, type ElementType, type ReactNode } from 'react'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { motionFlags } from '@/lib/flags'
import { DUR, EASE, REVEAL_START } from '@/lib/motion'

interface SplitRevealProps {
  children: ReactNode
  className?: string
  as?: ElementType
  delay?: number
  /** "scroll" reveals when in view; "immediate" reveals on mount */
  mode?: 'scroll' | 'immediate'
  start?: string
  style?: React.CSSProperties
}

/**
 * Line-by-line masked slide-up for headlines. Lines are split with
 * SplitText (autoSplit re-splits after font load or resize), each wrapped
 * in an overflow-clipped mask. Reduced motion: plain text, untouched.
 */
export function SplitReveal({
  children,
  className,
  as = 'h2',
  delay = 0,
  mode = 'scroll',
  start = REVEAL_START,
  style,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || motionFlags().reduced) return

      const split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'bl-line',
        autoSplit: true,
        onSplit(self) {
          gsap.set(self.lines, { yPercent: 110 })
          const vars = {
            yPercent: 0,
            duration: DUR.line,
            ease: EASE.reveal,
            stagger: DUR.lineStagger,
            delay,
          }
          if (mode === 'immediate') return gsap.to(self.lines, vars)
          return gsap.to(self.lines, {
            ...vars,
            scrollTrigger: { trigger: el, start, once: true },
          })
        },
      })
      // Lines are now hidden by transform; the wrapper can show.
      gsap.set(el, { opacity: 1 })
      return () => split.revert()
    },
    { scope: ref }
  )

  return createElement(as, { ref, className, style, 'data-reveal': '' }, children)
}
