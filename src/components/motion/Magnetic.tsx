'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { motionFlags } from '@/lib/flags'
import { isFinePointer } from '@/lib/motion'

/** Soft magnetic pull on desktop pointers only. Decorative; no effect on touch. */
export const MAGNET = {
  strength: 0.28, // fraction of the pointer offset the button follows
  padding: 56, // px of pull zone around the button (md:p-14 in the JSX; desktop only)
  duration: 0.7,
}

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const zone = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = zone.current
      if (!el || motionFlags().reduced || !isFinePointer()) return
      const inner = el.firstElementChild as HTMLElement | null
      if (!inner) return
      const xTo = gsap.quickTo(inner, 'x', { duration: MAGNET.duration, ease: 'power3' })
      const yTo = gsap.quickTo(inner, 'y', { duration: MAGNET.duration, ease: 'power3' })

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        xTo(dx * MAGNET.strength)
        yTo(dy * MAGNET.strength)
      }
      const onLeave = () => {
        xTo(0)
        yTo(0)
      }
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope: zone }
  )

  return (
    <div
      ref={zone}
      className={['inline-block md:p-14 md:-m-14', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}
