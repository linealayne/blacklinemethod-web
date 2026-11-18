'use client'

import { createElement, useEffect, useRef, type ElementType, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  /** seconds; keep small (the entrance must never hold content back) */
  delay?: number
  /** px of rise */
  y?: number
  as?: ElementType
  /** animate each direct child in sequence instead of the wrapper */
  stagger?: boolean
  style?: React.CSSProperties
  id?: string
}

/**
 * Observe once; fire as soon as any part of the element enters the viewport,
 * or at once when the page loaded already scrolled past it. No layout reads.
 */
export function observeOnce(el: Element, onReveal: () => void, rootMargin = '0px 0px -6% 0px'): () => void {
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
        io.disconnect()
        onReveal()
      }
    },
    { rootMargin, threshold: 0 }
  )
  io.observe(el)
  return () => io.disconnect()
}

/**
 * The site's only scroll-related motion: a one-time fade and short rise
 * (0.5s) when the element first enters view. CSS-driven (globals.css,
 * "Entrances"); reduced motion never hides anything; content shows after
 * 2.5s if JavaScript never arrives.
 */
export function Reveal({ children, className, delay = 0, y = 12, as = 'div', stagger = false, style, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return observeOnce(el, () => el.classList.add('bl-in'))
  }, [])

  const vars = {
    '--bl-delay': `${delay}s`,
    '--bl-rise': `${y}px`,
    ...style,
  } as React.CSSProperties

  return createElement(
    as,
    { ref, id, className, style: vars, 'data-reveal': stagger ? 'stagger' : '' },
    children
  )
}
