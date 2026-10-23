'use client'

import { createElement, useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { motionFlags } from '@/lib/flags'
import { DUR, EASE, REVEAL_START } from '@/lib/motion'
import { observeOnce } from './Reveal'
import { whenInteracted } from '@/lib/useFirstInteraction'

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
 * Line-by-line masked slide-up for headlines. Nothing loads until the
 * headline approaches the viewport: then GSAP and SplitText are fetched,
 * the lines are split (after fonts), hidden inside masks, and revealed once
 * the headline crosses the line. Headlines carry data-reveal so they stay
 * hidden until then on motion clients; reduced motion: plain text.
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

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (motionFlags().reduced) return

    let cancelled = false
    let revert: (() => void) | null = null
    let stopReveal: (() => void) | null = null

    const create = async () => {
      await whenInteracted()
      if (cancelled) return
      const [{ gsap, loadSplitText }, SplitText] = await Promise.all([
        import('@/lib/gsap'),
        import('@/lib/gsap').then((m) => m.loadSplitText()),
      ])
      if (cancelled) return
      if (document.fonts?.ready) await document.fonts.ready
      if (cancelled) return

      let revealed = false
      let lines: Element[] = []
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

      // The CSS reveal must not fight the masks: take the element out of the
      // CSS choreography and let the lines carry the motion.
      el.style.transition = 'none'
      const split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'bl-line',
        autoSplit: true,
        onSplit(self) {
          lines = self.lines
          gsap.set(lines, { yPercent: revealed ? 0 : 110 })
        },
      })
      el.classList.add('bl-in')
      revert = () => split.revert()
      if (mode === 'immediate') reveal()
      else stopReveal = observeOnce(el, start, reveal)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.bottom >= 0) return
        io.disconnect()
        create()
      },
      { rootMargin: SPLIT_AHEAD }
    )
    io.observe(el)

    return () => {
      cancelled = true
      io.disconnect()
      stopReveal?.()
      revert?.()
    }
  }, [delay, mode, start])

  return createElement(as, { ref, className, style, 'data-reveal': '' }, children)
}
