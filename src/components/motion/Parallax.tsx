'use client'

import { usePathname } from 'next/navigation'
import { motionFlags } from '@/lib/flags'
import { isFinePointer } from '@/lib/motion'
import { useGsapEffect } from '@/lib/useGsap'

/**
 * Subtle parallax for elements marked data-parallax="N": the element drifts
 * N yPercent (negative rises faster than the page) across its pass through
 * the viewport. Desktop pointers only, never under reduced motion; re-scans
 * on every route. A handful of elements site-wide, by design.
 */
export function Parallax() {
  const pathname = usePathname()

  useGsapEffect(
    ({ gsap, ScrollTrigger }) => {
      const f = motionFlags()
      if (f.reduced || !isFinePointer() || window.innerWidth < 1024) return
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const amount = parseFloat(el.dataset.parallax || '0')
          if (!amount) return
          gsap.fromTo(
            el,
            { yPercent: -amount / 2 },
            {
              yPercent: amount / 2,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
            }
          )
        })
        ScrollTrigger.refresh()
      })
      return () => ctx.revert()
    },
    [pathname]
  )

  return null
}
