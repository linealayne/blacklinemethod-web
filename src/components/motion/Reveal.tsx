'use client'

import { createElement, useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { REVEAL_START } from '@/lib/motion'

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
  style?: React.CSSProperties
}

/** Convert a ScrollTrigger-style "top 86%" into an IntersectionObserver rootMargin. */
export function revealRootMargin(start: string): string {
  const pct = parseInt(start.split(' ')[1] ?? '86', 10)
  return `0px 0px -${Math.max(0, 100 - pct)}% 0px`
}

/**
 * Observe once; fire when the element crosses the line, or at once when the
 * page loaded already scrolled past it. No layout reads, no library.
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
 * Calm fade-and-rise for body text and small groups, driven by CSS
 * transitions (see globals.css, "Reveal choreography"). Motion clients hide
 * [data-reveal] until `.bl-in` is added; reduced motion never hides anything.
 * No GSAP in the critical path.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = 'div',
  stagger = false,
  start = REVEAL_START,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return observeOnce(el, start, () => el.classList.add('bl-in'))
  }, [start])

  const vars = {
    '--bl-delay': `${delay}s`,
    '--bl-rise': `${y}px`,
    ...style,
  } as React.CSSProperties

  return createElement(
    as,
    {
      ref,
      className,
      style: vars,
      'data-reveal': stagger ? 'stagger' : '',
    },
    children
  )
}
