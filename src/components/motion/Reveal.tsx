'use client'

import { createElement, useRef, type ElementType, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { motionFlags } from '@/lib/flags'
import { DUR, EASE, REVEAL_START } from '@/lib/motion'

interface RevealProps {
  children: ReactNode
  className?: string
  /** seconds */
  delay?: number
  /** px of rise */
  y?: number
  as?: ElementType
  /** animate each direct child in sequence instead of the wrapper */
  stagger?: boolean
  /** viewport line the element must cross, as "top NN%"; default "top 86%" */
  start?: string
}

/** Convert a ScrollTrigger-style "top 86%" into an IntersectionObserver rootMargin. */
export function revealRootMargin(start: string): string {
  const pct = parseInt(start.split(' ')[1] ?? '86', 10)
  return `0px 0px -${Math.max(0, 100 - pct)}% 0px`
}

/**
 * Observe once; reveal when the element crosses the line, or at once when the
 * page loaded already scrolled past it. IntersectionObserver keeps hydration
 * free of layout reads.
 */
export function observeOnce(el: Element, start: string, onReveal: () => void): () => void {
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
        io.disconnect()
        onReveal()
      }
    },
    { rootMargin: revealRootMargin(start), threshold: 0 }
  )
  io.observe(el)
  return () => io.disconnect()
}

/**
 * Calm fade-and-rise for body text and small groups.
 * Hidden pre-hydration via [data-reveal] (returning motion clients only),
 * then GSAP takes over inline. Reduced motion: nothing moves, nothing is hidden.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = 'div',
  stagger = false,
  start = REVEAL_START,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || motionFlags().reduced) return
      const targets = stagger ? Array.from(el.children) : [el]
      if (stagger) gsap.set(el, { opacity: 1 })
      gsap.set(targets, { opacity: 0, y })
      return observeOnce(el, start, () => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: DUR.rise,
          ease: EASE.rise,
          delay,
          stagger: stagger ? DUR.riseStagger : 0,
          overwrite: true,
        })
      })
    },
    { scope: ref }
  )

  return createElement(as, { ref, className, 'data-reveal': '' }, children)
}
