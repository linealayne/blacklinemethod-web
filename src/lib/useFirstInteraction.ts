'use client'

import { useEffect, useState } from 'react'

const EVENTS: (keyof WindowEventMap)[] = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll']

/**
 * True after the visitor first moves, scrolls, touches, or types, or after
 * `delay` ms of quiet, whichever comes first. Expensive set-up (WebGL, pinned
 * scroll choreography) waits for this so the page is readable and interactive
 * before any of it runs.
 */
export function useFirstInteraction(enabled = true, delay = 6000): boolean {
  const [go, setGo] = useState(false)

  useEffect(() => {
    if (!enabled || go) return
    let done = false
    const start = () => {
      if (done) return
      done = true
      EVENTS.forEach((e) => window.removeEventListener(e, start))
      window.clearTimeout(timer)
      setGo(true)
    }
    EVENTS.forEach((e) => window.addEventListener(e, start, { passive: true }))
    const timer = window.setTimeout(start, delay)
    return () => {
      done = true
      EVENTS.forEach((e) => window.removeEventListener(e, start))
      window.clearTimeout(timer)
    }
  }, [enabled, go, delay])

  return go
}
