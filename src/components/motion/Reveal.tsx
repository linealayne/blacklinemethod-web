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
  /** ScrollTrigger start; default "top 86%" */
  start?: string
}

/**
 * Calm fade-and-rise for body text and small groups.
 * Hidden pre-hydration via [data-reveal] (motion clients only), then GSAP
 * takes over inline. Reduced motion: nothing moves, nothing is hidden.
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
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: DUR.rise,
        ease: EASE.rise,
        delay,
        stagger: stagger ? DUR.riseStagger : 0,
        scrollTrigger: { trigger: el, start, once: true },
      })
    },
    { scope: ref }
  )

  return createElement(as, { ref, className, 'data-reveal': '' }, children)
}
