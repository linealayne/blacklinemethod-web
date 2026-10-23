'use client'

import { useEffect, useRef } from 'react'

/**
 * First-visit loader, desktop only: the wordmark letter-spaces in and one
 * amber rule draws beneath it (CSS keyframes, see globals.css "Loader").
 * Runs once per session (sessionStorage, in try/catch), never for reduced
 * motion, phones, or tablets, and finishes in about 1.15s. The overlay is
 * server-rendered so there is no flash before hydration; CSS hides it
 * immediately when it should not run.
 */
export const LOADER = {
  handoffMs: 750, // the hero starts revealing as the overlay begins to fade
  totalMs: 1150,
}

export function Loader() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const el = ref.current
    if (!el) return

    const finish = () => {
      html.classList.add('bl-loader-done')
      window.dispatchEvent(new Event('bl:loader-done'))
    }

    if (html.classList.contains('bl-no-loader') || html.classList.contains('bl-reduced')) {
      finish()
      return
    }

    try {
      window.sessionStorage.setItem('bl-visited', '1')
    } catch {
      /* storage unavailable: the loader simply plays on every load */
    }

    el.classList.add('is-playing')
    const handoff = window.setTimeout(() => window.dispatchEvent(new Event('bl:loader-done')), LOADER.handoffMs)
    const done = window.setTimeout(finish, LOADER.totalMs)
    return () => {
      window.clearTimeout(handoff)
      window.clearTimeout(done)
    }
  }, [])

  return (
    <div id="bl-loader" ref={ref} aria-hidden="true">
      <div className="w-[150px] text-center">
        <span className="wordmark">BLACKLINE</span>
        <span className="rule" />
      </div>
    </div>
  )
}
