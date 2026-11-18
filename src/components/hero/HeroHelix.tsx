'use client'

import { useEffect, useRef, useState } from 'react'
import { HUD } from './helix-config'
import type { HelixScene, Tier } from './HelixScene'

interface HeroHelixProps {
  /** the hero section: the scene fills its box and listens to it */
  hostRef: React.RefObject<HTMLElement>
  /** play the full intro (first homepage visit this session) */
  intro: boolean
  /** the helix has locked into shape */
  onLock: () => void
  /** WebGL could not start or was lost: show the static still */
  onFail: () => void
}

function pickTier(phone: boolean): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency || 4
  const mem = nav.deviceMemory ?? 8
  if (phone) return cores >= 8 && mem >= 6 ? 'mid' : 'low'
  if (mem < 4 || cores < 4) return 'low'
  return cores >= 8 && window.innerWidth >= 1280 ? 'high' : 'mid'
}

/**
 * The hero scene (three.js, loaded with next/dynamic after hydration) and
 * its HUD: biomarker labels at the edges with thin leader lines that land on
 * the strand. Pointer: the helix tilts toward the cursor, nearby particles
 * scatter and spring back, a click sends a pulse down the strand. Touch:
 * horizontal drag tilts (vertical drags scroll the page as normal), tap
 * pulses. Nothing here ever calls preventDefault on scroll or touch.
 */
export default function HeroHelix({ hostRef, intro, onLock, onFail }: HeroHelixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<(SVGLineElement | null)[]>([])
  const dotsRef = useRef<(SVGCircleElement | null)[]>([])
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  const [live, setLive] = useState(false)
  const [phone, setPhone] = useState<boolean | null>(null)
  const callbacks = useRef({ onLock, onFail })
  callbacks.current = { onLock, onFail }

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

    // label boxes, measured on resize: the leader line starts at the edge facing the strand
    let boxes: { x: number; y: number }[] = []
    const measure = () => {
      const hr = host.getBoundingClientRect()
      boxes = HUD.map((h, i) => {
        const el = labelRefs.current[i]
        if (!el) return { x: 0, y: 0 }
        const r = el.getBoundingClientRect()
        return { x: (h.side < 0 ? r.right + 10 : r.left - 10) - hr.left, y: r.top + 6 - hr.top }
      })
    }

    const onAnchors = (pts: { x: number; y: number }[]) => {
      pts.forEach((p, i) => {
        const line = linesRef.current[i]
        const dot = dotsRef.current[i]
        const b = boxes[i]
        if (!line || !dot || !b) return
        line.setAttribute('x1', b.x.toFixed(1))
        line.setAttribute('y1', b.y.toFixed(1))
        line.setAttribute('x2', p.x.toFixed(1))
        line.setAttribute('y2', p.y.toFixed(1))
        dot.setAttribute('cx', p.x.toFixed(1))
        dot.setAttribute('cy', p.y.toFixed(1))
      })
    }

    import('./HelixScene')
      .then(({ HelixScene }) => {
        if (disposed) return
        try {
          scene = new HelixScene({
            canvas,
            host,
            tier: pickTier(phone),
            phone,
            intro,
            onLock: () => callbacks.current.onLock(),
            onFirstFrame: () => setLive(true),
            onAnchors,
          })
        } catch {
          callbacks.current.onFail()
          return
        }
        const s = scene
        measure()

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

        const ro = new ResizeObserver(() => {
          s.resize()
          measure()
        })
        ro.observe(host)
        cleanups.push(() => ro.disconnect())

        const onLost = (e: Event) => {
          e.preventDefault()
          callbacks.current.onFail()
        }
        canvas.addEventListener('webglcontextlost', onLost)
        cleanups.push(() => canvas.removeEventListener('webglcontextlost', onLost))

        // ---- the intro can be skipped by any click, tap, wheel, or key
        if (intro) {
          const skip = () => s.skip()
          const opts = { passive: true, capture: true } as const
          window.addEventListener('pointerdown', skip, opts)
          window.addEventListener('wheel', skip, opts)
          window.addEventListener('touchstart', skip, opts)
          window.addEventListener('keydown', skip, opts)
          cleanups.push(() => {
            window.removeEventListener('pointerdown', skip, opts)
            window.removeEventListener('wheel', skip, opts)
            window.removeEventListener('touchstart', skip, opts)
            window.removeEventListener('keydown', skip, opts)
          })
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

  return (
    <>
      <canvas ref={canvasRef} className={`bl-helix-canvas absolute inset-0 h-full w-full ${live ? 'is-live' : ''}`} />

      {/* HUD: decorative biomarker labels with leader lines; no values */}
      <div ref={hudRef} className="absolute inset-0" aria-hidden="true" data-intro="" style={{ '--bl-intro-delay': '0.5s' } as React.CSSProperties}>
        <svg className="absolute inset-0 h-full w-full overflow-visible">
          {HUD.map((h, i) => (
            <g key={h.id} className={h.phone ? '' : 'hidden md:inline'}>
              <line
                ref={(el) => {
                  linesRef.current[i] = el
                }}
                stroke="#F2F1EC"
                strokeOpacity="0.22"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              <circle
                ref={(el) => {
                  dotsRef.current[i] = el
                }}
                r="2.5"
                fill="none"
                stroke={h.color}
                strokeOpacity="0.9"
              />
            </g>
          ))}
        </svg>
        {HUD.map((h, i) => (
          <div
            key={h.id}
            ref={(el) => {
              labelRefs.current[i] = el
            }}
            className={`absolute left-[var(--px)] top-[var(--py)] md:left-[var(--x)] md:top-[var(--y)] ${h.phone ? '' : 'hidden md:block'} ${h.side < 0 ? '-translate-x-full text-right' : ''}`}
            style={{ '--x': `${h.x * 100}%`, '--y': `${h.y * 100}%`, '--px': `${h.px * 100}%`, '--py': `${h.py * 100}%` } as React.CSSProperties}
          >
            <p className="bl-label text-[9.5px] md:text-[10px] text-offwhite/70 whitespace-nowrap" style={{ textTransform: 'none' }}>{h.label}</p>
            <div className={`mt-2.5 w-[88px] md:w-[112px] bl-hud-bar ${h.side < 0 ? 'ml-auto' : ''}`} style={{ '--c': h.color, '--a': `${18 + i * 11}%`, '--w': `${26 + (i % 2) * 10}%`, '--d': `${6 + i * 1.3}s` } as React.CSSProperties}>
              <i />
            </div>
            <div className={`mt-1.5 flex justify-between w-[88px] md:w-[112px] ${h.side < 0 ? 'ml-auto' : ''}`} aria-hidden="true">
              {[0, 1, 2, 3, 4].map((t) => (
                <span key={t} className="block h-[3px] w-px bg-offwhite/25" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
