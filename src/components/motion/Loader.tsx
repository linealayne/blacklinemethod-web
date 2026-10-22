'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

/**
 * First-visit loader: the wordmark letter-spaces in and one amber rule
 * draws beneath it. Runs once per session (sessionStorage, in try/catch),
 * never for reduced motion, and finishes in about 1.35s. The overlay is
 * server-rendered so there is no flash before hydration; CSS hides it
 * immediately for returning visitors.
 */
export const LOADER = {
  wordIn: 0.6,
  ruleDraw: 0.5,
  ruleAt: 0.2,
  fadeOut: 0.4,
  fadeAt: 0.75,
  spacingFrom: '0.1em',
  spacingTo: '0.35em',
}

export function Loader() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const html = document.documentElement
      const el = ref.current
      if (!el) return

      const finish = () => {
        html.classList.add('bl-loader-done')
        window.dispatchEvent(new Event('bl:loader-done'))
      }
      // The hero starts revealing as the overlay begins to fade
      const handoff = () => window.dispatchEvent(new Event('bl:loader-done'))

      if (html.classList.contains('bl-no-loader') || html.classList.contains('bl-reduced')) {
        finish()
        return
      }

      try {
        window.sessionStorage.setItem('bl-visited', '1')
      } catch {
        /* storage unavailable: the loader simply plays on every load */
      }

      const word = el.querySelector('.wordmark')
      const rule = el.querySelector('.rule')
      const tl = gsap.timeline({ onComplete: finish })
      tl.fromTo(
        word,
        { opacity: 0, letterSpacing: LOADER.spacingFrom },
        { opacity: 1, letterSpacing: LOADER.spacingTo, duration: LOADER.wordIn, ease: 'power3.out' }
      )
        .to(rule, { scaleX: 1, duration: LOADER.ruleDraw, ease: 'power3.inOut' }, LOADER.ruleAt)
        .call(handoff, [], LOADER.fadeAt)
        .to(el, { autoAlpha: 0, duration: LOADER.fadeOut, ease: 'power2.inOut' }, LOADER.fadeAt)
    },
    { scope: ref }
  )

  return (
    <div id="bl-loader" ref={ref} aria-hidden="true">
      <div className="w-[150px] text-center">
        <span className="wordmark">BLACKLINE</span>
        <span className="rule" />
      </div>
    </div>
  )
}
