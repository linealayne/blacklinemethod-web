'use client'

import { useEffect, useRef } from 'react'

/**
 * First-visit loader, every device, once per session (sessionStorage, in
 * try/catch). A biomarker trace draws across the screen in 1.15s: erratic
 * on the left, settling into a calm, level line on the right, with an amber
 * read head riding its tip. The wordmark sits above it. Click, tap, or any
 * key skips straight to the page. Never for reduced motion. The overlay is
 * server-rendered so there is no flash; CSS hides it when it should not run
 * (see globals.css "Loader").
 */
export const LOADER = {
  handoffMs: 1350, // the hero starts revealing as the overlay begins to fade
  totalMs: 1800,
  skipFadeMs: 300,
}

/** Deterministic trace: amplitude decays left to right, two sharp excursions early on. */
function tracePath(): string {
  const W = 1000
  const mid = 20
  let seed = 7
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647 - 0.5
  }
  const pts: string[] = []
  for (let x = 0; x <= W; x += 6) {
    const f = x / W
    const calm = Math.pow(Math.max(0, 1 - f / 0.72), 2.2)
    let y = (Math.sin(x * 0.045) * 6 + Math.sin(x * 0.11) * 3 + rnd() * 9) * calm
    if (x > 150 && x < 175) y -= 15 * Math.sin(((x - 150) / 25) * Math.PI) * calm
    if (x > 300 && x < 318) y += 11 * Math.sin(((x - 300) / 18) * Math.PI) * calm
    pts.push(`${x === 0 ? 'M' : 'L'}${x} ${(mid + y).toFixed(2)}`)
  }
  return pts.join(' ')
}

const TRACE = tracePath()

export function Loader() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const el = ref.current
    if (!el) return

    let handedOff = false
    const handoff = () => {
      if (handedOff) return
      handedOff = true
      window.dispatchEvent(new Event('bl:loader-done'))
    }
    const finish = () => {
      handoff()
      html.classList.add('bl-loader-done')
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
    const timers = [window.setTimeout(handoff, LOADER.handoffMs), window.setTimeout(finish, LOADER.totalMs)]

    const skip = () => {
      timers.forEach(window.clearTimeout)
      el.classList.remove('is-playing')
      el.classList.add('is-skipped')
      handoff()
      timers.push(window.setTimeout(finish, LOADER.skipFadeMs))
      remove()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') return
      skip()
    }
    const remove = () => {
      el.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', onKey)
    }
    el.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', onKey)

    return () => {
      timers.forEach(window.clearTimeout)
      remove()
    }
  }, [])

  return (
    <div id="bl-loader" ref={ref} aria-hidden="true">
      <span className="wordmark">BLACKLINE</span>
      <svg className="trace" viewBox="0 0 1000 40" preserveAspectRatio="none">
        <path d={TRACE} vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="head" />
    </div>
  )
}
