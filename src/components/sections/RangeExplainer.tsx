'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { Folio } from '@/components/layout/Folio'
import { motionFlags } from '@/lib/flags'
import { useGsapEffect } from '@/lib/useGsap'
import type { GsapModule } from '@/lib/gsap'

/**
 * "Optimal is not a range", illustrated. A wide reference band, a much
 * narrower band inside it, and a marker you can drag or move with the
 * keyboard. No numbers, no units, no markers: purely illustrative.
 * GSAP and Draggable load on demand; keyboard and click work before they do.
 */
export const RANGE = {
  reference: [0.1, 0.9] as const, // fraction of the track
  optimal: [0.6, 0.74] as const,
  initial: 0.32,
  keyStep: 0.02,
}

type Status = 'out' | 'in' | 'optimal'

function statusFor(f: number): Status {
  if (f < RANGE.reference[0] || f > RANGE.reference[1]) return 'out'
  if (f >= RANGE.optimal[0] && f <= RANGE.optimal[1]) return 'optimal'
  return 'in'
}

const STATUS_TEXT: Record<Status, string> = {
  out: 'Out of range.',
  in: 'In range.',
  optimal: 'In range and optimal.',
}

const STATUS_NOTE: Record<Status, string> = {
  out: 'This is what a flagged lab report catches.',
  in: 'Nothing is flagged. The appointment ends here.',
  optimal: 'The narrower question, answered for one person.',
}

export function RangeExplainer() {
  const trackRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const fraction = useRef(RANGE.initial)
  const gsapRef = useRef<GsapModule['gsap'] | null>(null)
  const draggable = useRef<{ update: () => void; kill: () => void } | null>(null)
  const [status, setStatus] = useState<Status>(statusFor(RANGE.initial))
  const [valueNow, setValueNow] = useState(Math.round(RANGE.initial * 100))

  const place = useCallback((f: number, animate = false) => {
    const track = trackRef.current
    const marker = markerRef.current
    if (!track || !marker) return
    const clamped = Math.max(0, Math.min(1, f))
    fraction.current = clamped
    const x = clamped * track.clientWidth
    const gsap = gsapRef.current
    if (gsap) {
      if (animate && !motionFlags().reduced) gsap.to(marker, { x, duration: 0.35, ease: 'power3.out' })
      else gsap.set(marker, { x })
      draggable.current?.update()
    } else {
      marker.style.transform = `translate(${x}px, 0px)`
    }
    setStatus(statusFor(clamped))
    setValueNow(Math.round(clamped * 100))
  }, [])

  // Initial placement without any library
  useEffect(() => {
    place(RANGE.initial)
    const track = trackRef.current
    if (!track) return
    const ro = new ResizeObserver(() => place(fraction.current))
    ro.observe(track)
    return () => ro.disconnect()
  }, [place])

  // Drag support when GSAP arrives
  useGsapEffect(
    async ({ gsap, loadDraggable }) => {
      const track = trackRef.current
      const marker = markerRef.current
      if (!track || !marker) return
      const Draggable = await loadDraggable()
      gsapRef.current = gsap
      place(fraction.current)
      const [d] = Draggable.create(marker, {
        type: 'x',
        bounds: track,
        cursor: 'grab',
        activeCursor: 'grabbing',
        onDrag() {
          fraction.current = this.x / track.clientWidth
          setStatus(statusFor(fraction.current))
          setValueNow(Math.round(fraction.current * 100))
        },
      })
      draggable.current = d
      return () => {
        d.kill()
        draggable.current = null
        gsapRef.current = null
      }
    },
    [place]
  )

  // Crossfade the status line when it changes (CSS keyframe; reduced motion: instant)
  useEffect(() => {
    const el = statusRef.current
    if (!el || motionFlags().reduced) return
    el.classList.remove('bl-status-in')
    void el.offsetWidth
    el.classList.add('bl-status-in')
  }, [status])

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = fraction.current + RANGE.keyStep
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = fraction.current - RANGE.keyStep
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = 1
    if (e.key === 'PageUp') next = fraction.current + RANGE.keyStep * 5
    if (e.key === 'PageDown') next = fraction.current - RANGE.keyStep * 5
    if (next === null) return
    e.preventDefault()
    place(next, true)
  }

  const onTrackPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current
    if (!track || e.target === markerRef.current || markerRef.current?.contains(e.target as Node)) return
    const r = track.getBoundingClientRect()
    place((e.clientX - r.left) / r.width, true)
    markerRef.current?.focus()
  }

  const pct = (f: number) => `${f * 100}%`

  return (
    <Folio label="illustrative" ariaLabel="Optimal is not a range, illustrated">
        <div className="grid gap-14 xl:grid-cols-2 xl:gap-20 items-center">
          <div>
            <Reveal as="h2" className="bl-h2">
              optimal is not a range.
            </Reveal>
            <Reveal as="p" delay={0.08} className="mt-7 bl-body max-w-md">
              A reference range describes where most of a population falls. What is optimal for one
              person is a much narrower question. Move the marker.
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <div className="pt-10 pb-2">
              <div className="relative h-5 mb-3 font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-label">
                <span className="absolute" style={{ left: pct(RANGE.reference[0]) }}>
                  Reference range
                </span>
              </div>

              <div ref={trackRef} className="relative h-14 cursor-pointer" onPointerDown={onTrackPointerDown}>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-hairline" aria-hidden="true" />
                <div
                  className="absolute inset-y-2 border-x border-dashed border-offwhite/25 bg-offwhite/[0.03]"
                  style={{ left: pct(RANGE.reference[0]), right: pct(1 - RANGE.reference[1]) }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-y-0 border-x border-amber/70 bg-amber/[0.12]"
                  style={{ left: pct(RANGE.optimal[0]), width: pct(RANGE.optimal[1] - RANGE.optimal[0]) }}
                  aria-hidden="true"
                />
                <div
                  ref={markerRef}
                  role="slider"
                  tabIndex={0}
                  aria-label="Illustrative marker. Move to see how the reading is described."
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={valueNow}
                  aria-valuetext={STATUS_TEXT[status]}
                  onKeyDown={onKeyDown}
                  className="absolute top-0 bottom-0 left-0 w-11 -ml-[22px] touch-none group rounded-[1px]"
                >
                  <span className="absolute left-1/2 top-0 bottom-0 w-px bg-offwhite/80 -translate-x-1/2 transition-colors duration-300 group-focus-visible:bg-amber" />
                  <span className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black border border-offwhite/80 shadow-[0_0_18px_rgba(200,150,90,0.4)] transition-[border-color,box-shadow] duration-300 group-focus-visible:border-amber group-hover:border-amber" />
                </div>
              </div>

              <div className="relative h-5 mt-3 font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-amber-muted">
                <span
                  className="absolute whitespace-nowrap"
                  style={{ left: pct((RANGE.optimal[0] + RANGE.optimal[1]) / 2), transform: 'translateX(-50%)' }}
                >
                  Optimal for you
                </span>
              </div>

              <div className="mt-10 pt-8 border-t border-hairline min-h-[7rem]">
                <p ref={statusRef} className="bl-serif-caps text-[1.3rem] md:text-[1.6rem] tracking-[0.09em]">
                  {STATUS_TEXT[status]}
                </p>
                <p className="mt-2 bl-body text-body-dim">{STATUS_NOTE[status]}</p>
              </div>
            </div>
          </Reveal>
        </div>
    </Folio>
  )
}
