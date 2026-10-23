'use client'

import { useEffect, useLayoutEffect, type DependencyList } from 'react'
import type { GsapModule } from './gsap'
import { whenInteracted } from './useFirstInteraction'

// Layout effect so the cleanup runs in React's mutation phase, before host
// nodes are removed: ScrollTrigger pins reparent sections into spacers and
// must be reverted before React unmounts them.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

type Cleanup = void | (() => void)

interface Options {
  /** load GSAP right away instead of waiting for the first interaction */
  immediate?: boolean
}

/**
 * Run a GSAP effect after the library has loaded on demand. The callback
 * receives the gsap module and returns a cleanup (usually `() => ctx.revert()`).
 * Loading waits for the visitor's first interaction (see whenInteracted), so
 * gsap is never part of the page's initial JavaScript or its idle period.
 */
export function useGsapEffect(
  effect: (mod: GsapModule) => Cleanup | Promise<Cleanup>,
  deps: DependencyList,
  options: Options = {}
) {
  useIsoLayoutEffect(() => {
    let cancelled = false
    let cleanup: Cleanup
    const gate = options.immediate ? Promise.resolve() : whenInteracted()
    gate
      .then(() => import('@/lib/gsap'))
      .then(async (mod) => {
        if (cancelled) return
        const c = await effect(mod)
        if (cancelled) {
          if (typeof c === 'function') c()
          return
        }
        cleanup = c
      })
    return () => {
      cancelled = true
      if (typeof cleanup === 'function') cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
