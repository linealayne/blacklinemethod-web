'use client'

import { useEffect } from 'react'
import type Lenis from 'lenis'
import { motionFlags } from '@/lib/flags'
import { isFinePointer } from '@/lib/motion'

declare global {
  interface Window {
    __lenis?: Lenis
  }
}

/**
 * Lenis smooth scrolling synced to ScrollTrigger. Desktop pointers only:
 * touch devices keep native scrolling (lighter, and what the hand expects).
 * Both libraries load on demand after hydration. Off for reduced motion.
 */
export const SMOOTH_SCROLL = {
  lerp: 0.12, // lower = floatier, higher = tighter
  wheelMultiplier: 1,
}

export function SmoothScroll() {
  useEffect(() => {
    if (motionFlags().reduced || !isFinePointer()) return
    let cancelled = false
    let cleanup: (() => void) | null = null

    Promise.all([import('lenis'), import('@/lib/gsap')]).then(([{ default: LenisCtor }, { gsap, ScrollTrigger }]) => {
      if (cancelled) return
      const lenis = new LenisCtor({
        lerp: SMOOTH_SCROLL.lerp,
        wheelMultiplier: SMOOTH_SCROLL.wheelMultiplier,
        smoothWheel: true,
        syncTouch: false,
      })
      window.__lenis = lenis
      document.documentElement.classList.add('bl-lenis')

      lenis.on('scroll', ScrollTrigger.update)
      const tick = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      cleanup = () => {
        gsap.ticker.remove(tick)
        lenis.destroy()
        delete window.__lenis
        document.documentElement.classList.remove('bl-lenis')
      }
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return null
}
