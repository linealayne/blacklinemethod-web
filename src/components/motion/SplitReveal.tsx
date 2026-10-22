'use client'

import { createElement, useRef, type ElementType, type ReactNode } from 'react'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { motionFlags } from '@/lib/flags'
import { DUR, EASE, REVEAL_START } from '@/lib/motion'
import { observeOnce } from './Reveal'

interface SplitRevealProps {
  children: ReactNode
  className?: string
  as?: ElementType
  delay?: number
  /** "scroll" reveals when in view; "immediate" reveals as soon as it is split */
  mode?: 'scroll' | 'immediate'
  start?: string
  style?: React.CSSProperties
}

/** How far below the viewport a headline gets split (share of viewport height). */
const SPLIT_AHEAD = '40% 0px'

/**
 * Line-by-line masked slide-up for headlines. The SplitText split is created
 * lazily, after fonts are ready and only once the headline approaches the
 * viewport, and the reveal is observed rather than scroll-triggered, so page
 * load pays nothing for headlines down the page. Reduced motion: plain text.
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

      let split: SplitText | null = null
      let cancelled = false
      let revealed = false
      let lines: Element[] = []
      let stopReveal: (() => void) | null = null
      gsap.set(el, { opacity: 0 })

      const reveal = () => {
        if (revealed) return
        revealed = true
        gsap.to(lines, {
          yPercent: 0,
          duration: DUR.line,
          ease: EASE.reveal,
          stagger: DUR.lineStagger,
          delay,
          overwrite: true,
        })
      }

      const create = () => {
        if (cancelled || split) return
        split = SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'bl-line',
          autoSplit: true,
          onSplit(self) {
            lines = self.lines
            gsap.set(lines, { yPercent: revealed ? 0 : 110 })
          },
        })
        // Lines are now hidden by transform; the wrapper can show.
        gsap.set(el, { opacity: 1 })
        if (mode === 'immediate') reveal()
        else stopReveal = observeOnce(el, start, reveal)
      }

      const fontsReady: Promise<unknown> = document.fonts?.ready ?? Promise.resolve()
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting && entry.boundingClientRect.bottom >= 0) return
          io.disconnect()
          fontsReady.then(create)
        },
        { rootMargin: SPLIT_AHEAD }
      )
      io.observe(el)

      return () => {
        cancelled = true
        io.disconnect()
        stopReveal?.()
        split?.revert()
      }
    },
    { scope: ref }
  )

  return createElement(as, { ref, className, style, 'data-reveal': '' }, children)
}
