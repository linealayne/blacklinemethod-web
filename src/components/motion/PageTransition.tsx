'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { motionFlags } from '@/lib/flags'
import { DUR, EASE } from '@/lib/motion'

/**
 * Fade-through-black between routes, under 500ms total.
 * A capture-phase click listener intercepts same-origin navigations,
 * fades the veil in, then pushes the route; when the new pathname
 * renders, scroll resets, ScrollTrigger refreshes, and the veil lifts.
 * Next's Link honours defaultPrevented so prefetching is unaffected.
 */
export function PageTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const veilRef = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  const safety = useRef<number | null>(null)

  useEffect(() => {
    const veil = veilRef.current
    if (!veil) return

    const onClick = (e: MouseEvent) => {
      if (motionFlags().reduced) return
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const target = e.target as Element | null
      const a = target?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a) return
      if (a.target && a.target !== '_self') return
      if (a.hasAttribute('download')) return
      let url: URL
      try {
        url = new URL(a.href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (!/^https?:$/.test(url.protocol)) return
      const samePage =
        url.pathname === window.location.pathname && url.search === window.location.search
      if (samePage) return

      e.preventDefault()
      const href = url.pathname + url.search + url.hash
      gsap.killTweensOf(veil)
      gsap.to(veil, {
        autoAlpha: 1,
        duration: DUR.veilIn,
        ease: 'power2.in',
        onComplete: () => {
          router.push(href)
          // If the route never changes (error, same route), lift the veil anyway
          if (safety.current) window.clearTimeout(safety.current)
          safety.current = window.setTimeout(() => {
            gsap.to(veil, { autoAlpha: 0, duration: DUR.veilOut, ease: EASE.ui })
          }, 2000)
        },
      })
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [router])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const veil = veilRef.current
    if (!veil) return
    if (safety.current) {
      window.clearTimeout(safety.current)
      safety.current = null
    }
    const lenis = window.__lenis
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
    else window.scrollTo(0, 0)

    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      gsap.to(veil, { autoAlpha: 0, duration: DUR.veilOut, ease: EASE.ui, delay: 0.05 })
    })
  }, [pathname])

  return <div id="bl-veil" ref={veilRef} aria-hidden="true" />
}
