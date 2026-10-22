'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { motionFlags } from '@/lib/flags'

declare global {
  interface Window {
    __lenis?: Lenis
  }
}

/** Lenis smooth scrolling synced to ScrollTrigger. Off for reduced motion. */
export const SMOOTH_SCROLL = {
  lerp: 0.12, // lower = floatier, higher = tighter
  wheelMultiplier: 1,
  touchMultiplier: 1.4,
}

export function SmoothScroll() {
  useEffect(() => {
    if (motionFlags().reduced) return

    const lenis = new Lenis({
      lerp: SMOOTH_SCROLL.lerp,
      wheelMultiplier: SMOOTH_SCROLL.wheelMultiplier,
      touchMultiplier: SMOOTH_SCROLL.touchMultiplier,
      smoothWheel: true,
      syncTouch: false,
    })
    window.__lenis = lenis
    document.documentElement.classList.add('bl-lenis')

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Fonts change line counts, which changes trigger positions
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh())
    }

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      delete window.__lenis
      document.documentElement.classList.remove('bl-lenis')
    }
  }, [])

  return null
}
