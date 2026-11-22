'use client'

import { useEffect, useRef, useState } from 'react'
import { INTRO } from '@/lib/flags'
import type { HelixScene, Tier } from './HelixScene'

interface HeroHelixProps {
  /** the hero section: the scene fills its box and listens to it */
  hostRef: React.RefObject<HTMLElement>
  /** play the full formation (the loading sequence is running) */
  intro: boolean
  /** WebGL could not start or was lost: show the static still */
  onFail: () => void
}

function pickTier(phone: boolean): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency || 4
  const mem = nav.deviceMemory ?? 8
  // phones always get a lighter gene (fewer particles)
  if (phone) return cores >= 8 && mem >= 6 ? 'mid' : 'low'
  if (mem < 4 || cores < 4) return 'low'
  return cores >= 8 && window.innerWidth >= 1280 ? 'high' : 'mid'
}

/**
 * The hero scene (three.js, loaded with next/dynamic after hydration).
 * Pointer: the helix tilts toward the cursor, nearby particles scatter and
 * spring back, a click sends a pulse down the strand. Touch: horizontal drag
 * tilts (vertical drags scroll the page as normal), tap pulses. Nothing here
 * ever calls preventDefault on scroll or touch.
 *
 * During the loading sequence the particles stay scattered until the dark
 * screen starts to lift (INTRO.geneMs), then drift together into the helix.
 */
export default function HeroHelix({ hostRef, intro, onFail }: HeroHelixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)
  const [phone, setPhone] = useState<boolean | null>(null)
  const callbacks = useRef({ onFail })
  callbacks.current = { onFail }

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setPhone(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host || phone === null) return
    let scene: HelixScene | null = null
    let disposed = false
    const cleanups: (() => void)[] = []

    import('./HelixScene')
      // let the browser breathe between evaluating three.js and building the scene,
      // so neither is one long main-thread task
      .then((mod) => new Promise<typeof mod>((resolve) => window.setTimeout(() => resolve(mod), 0)))
      .then(({ HelixScene }) => {
        if (disposed) return
        try {
          scene = new HelixScene({
            canvas,
            host,
            tier: pickTier(phone),
            phone,
            intro,
            holdUntil: intro ? (window.__blIntroT0 ?? 0) + INTRO.geneMs : 0,
            onLock: () => {},
            onFirstFrame: () => setLive(true),
          })
        } catch {
          callbacks.current.onFail()
          return
        }
        const s = scene

        // ---- run only while visible
        let inView = true
        const update = () => s.setActive(inView && !document.hidden)
        const io = new IntersectionObserver(([e]) => {
          inView = e.isIntersecting
          update()
        })
        io.observe(host)
        document.addEventListener('visibilitychange', update)
        update()
        cleanups.push(() => {
          io.disconnect()
          document.removeEventListener('visibilitychange', update)
        })

        const ro = new ResizeObserver(() => s.resize())
        ro.observe(host)
        cleanups.push(() => ro.disconnect())

        const onLost = (e: Event) => {
          e.preventDefault()
          callbacks.current.onFail()
        }
        canvas.addEventListener('webglcontextlost', onLost)
        cleanups.push(() => canvas.removeEventListener('webglcontextlost', onLost))

        // ---- skipping the loading sequence (any click, key, or scroll) forms the gene at once
        if (intro) {
          const skip = () => s.skip()
          window.addEventListener('bl:intro-skip', skip)
          cleanups.push(() => window.removeEventListener('bl:intro-skip', skip))
        }

        // ---- pointer (mouse and pen): tilt, scatter, click pulse
        const isControl = (t: EventTarget | null) => !!(t as Element | null)?.closest?.('a, button, input, textarea')
        const onMove = (e: PointerEvent) => {
          if (e.pointerType === 'touch') return
          const r = host.getBoundingClientRect()
          const inside = e.clientY >= r.top && e.clientY <= r.bottom
          s.pointerMove(e.clientX, e.clientY, inside)
        }
        const onLeave = () => s.pointerLeave()
        let touchStart: { x: number; y: number; t: number; id: number } | null = null
        const onDown = (e: PointerEvent) => {
          if (isControl(e.target)) return
          if (e.pointerType === 'touch') {
            touchStart = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }
            return
          }
          if (e.button === 0) s.pulseStrand()
        }
        const onTouchMove = (e: PointerEvent) => {
          if (e.pointerType !== 'touch' || !touchStart || e.pointerId !== touchStart.id) return
          s.drag(e.clientX - touchStart.x, e.clientY - touchStart.y)
        }
        const onUp = (e: PointerEvent) => {
          if (e.pointerType !== 'touch' || !touchStart) return
          const moved = Math.hypot(e.clientX - touchStart.x, e.clientY - touchStart.y)
          if (moved < 10 && performance.now() - touchStart.t < 350) s.pulseStrand()
          touchStart = null
          s.dragEnd()
        }
        const onCancel = () => {
          touchStart = null
          s.dragEnd()
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        document.documentElement.addEventListener('pointerleave', onLeave)
        host.addEventListener('pointerdown', onDown, { passive: true })
        host.addEventListener('pointermove', onTouchMove, { passive: true })
        host.addEventListener('pointerup', onUp, { passive: true })
        host.addEventListener('pointercancel', onCancel, { passive: true })
        cleanups.push(() => {
          window.removeEventListener('pointermove', onMove)
          document.documentElement.removeEventListener('pointerleave', onLeave)
          host.removeEventListener('pointerdown', onDown)
          host.removeEventListener('pointermove', onTouchMove)
          host.removeEventListener('pointerup', onUp)
          host.removeEventListener('pointercancel', onCancel)
        })
      })
      .catch(() => callbacks.current.onFail())

    return () => {
      disposed = true
      cleanups.forEach((c) => c())
      scene?.dispose()
      scene = null
    }
  }, [hostRef, intro, phone])

  return <canvas ref={canvasRef} className={`bl-helix-canvas absolute inset-0 h-full w-full ${live ? 'is-live' : ''}`} />
}
