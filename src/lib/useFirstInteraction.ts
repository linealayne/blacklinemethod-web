'use client'

import { useEffect, useState } from 'react'

const EVENTS: (keyof WindowEventMap)[] = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll']

/** ms of quiet after which set-up proceeds even with no interaction at all */
export const IDLE_FALLBACK_MS = 12000

let gate: Promise<void> | null = null

/**
 * Resolves on the visitor's first move, scroll, touch, or key press, or after
 * IDLE_FALLBACK_MS of quiet, whichever comes first. One shared promise for the
 * whole page: every expensive set-up (GSAP, WebGL, pinned choreography) waits
 * on it, so the page is readable and interactive before any of it loads.
 */
export function whenInteracted(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (!gate) {
    gate = new Promise<void>((resolve) => {
      let done = false
      const start = () => {
        if (done) return
        done = true
        EVENTS.forEach((e) => window.removeEventListener(e, start))
        window.clearTimeout(timer)
        resolve()
      }
      EVENTS.forEach((e) => window.addEventListener(e, start, { passive: true }))
      const timer = window.setTimeout(start, IDLE_FALLBACK_MS)
    })
  }
  return gate
}

/** React view of whenInteracted(): false until the visitor has interacted (or the fallback fired). */
export function useFirstInteraction(enabled = true): boolean {
  const [go, setGo] = useState(false)

  useEffect(() => {
    if (!enabled || go) return
    let cancelled = false
    whenInteracted().then(() => {
      if (!cancelled) setGo(true)
    })
    return () => {
      cancelled = true
    }
  }, [enabled, go])

  return go
}
