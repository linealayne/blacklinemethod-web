'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { Reveal } from '@/components/motion/Reveal'
import { gsap, Draggable, useGSAP } from '@/lib/gsap'
import { motionFlags } from '@/lib/flags'

/**
 * "Optimal is not a range", illustrated. A wide reference band, a much
 * narrower band inside it, and a marker you can drag or move with the
 * keyboard. No numbers, no units, no markers: purely illustrative.
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
  const draggable = useRef<Draggable | null>(null)
  const [status, setStatus] = useState<Status>(statusFor(RANGE.initial))
  const [valueNow, setValueNow] = useState(Math.round(RANGE.initial * 100))

  const place = useCallback((f: number, animate = false) => {
    const track = trackRef.current
    const marker = markerRef.current
    if (!track || !marker) return
    const clamped = gsap.utils.clamp(0, 1, f)
    fraction.current = clamped
    const x = clamped * track.clientWidth
    if (animate && !motionFlags().reduced) gsap.to(marker, { x, duration: 0.35, ease: 'power3.out' })
    else gsap.set(marker, { x })
    draggable.current?.update()
    setStatus(statusFor(clamped))
    setValueNow(Math.round(clamped * 100))
  }, [])

  useGSAP(
    () => {
      const track = trackRef.current
      const marker = markerRef.current
      if (!track || !marker) return
      place(RANGE.initial)
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
      const ro = new ResizeObserver(() => place(fraction.current))
      ro.observe(track)
      return () => {
        ro.disconnect()
        d.kill()
      }
    },
    { scope: trackRef }
  )

  // Crossfade the status line when it changes (reduced motion: instant)
  useEffect(() => {
    const el = statusRef.current
    if (!el || motionFlags().reduced) return
    gsap.fromTo(el, { opacity: 0.2, y: 4 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', overwrite: true })
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
    <section className="bg-black border-t border-hairline" aria-label="Optimal is not a range, illustrated">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="grid gap-14 md:grid-cols-2 md:gap-24 items-center">
          <div>
            <Reveal as="p" className="bl-label mb-8">
              illustrative
            </Reveal>
            <SplitReveal
              as="h2"
              className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.5rem,4.6vw,4.75rem)]"
            >
              optimal is not a range.
            </SplitReveal>
            <Reveal as="p" delay={0.2} className="mt-8 font-sans text-sm md:text-[15px] text-body leading-relaxed tracking-wide max-w-md">
              A reference range describes where most of a population falls. What is optimal for one
              person is a much narrower question. Move the marker.
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="pt-10 pb-2">
              {/* labels above */}
              <div className="relative h-5 mb-3 font-sans text-[10px] tracking-[0.25em] uppercase text-label">
                <span className="absolute" style={{ left: pct(RANGE.reference[0]) }}>
                  Reference range
                </span>
              </div>

              {/* track */}
              <div
                ref={trackRef}
                className="relative h-14 cursor-pointer"
                onPointerDown={onTrackPointerDown}
              >
                <div className="absolute inset-y-0 left-0 right-0 border-y border-hairline/60" aria-hidden="true" />
                <div
                  className="absolute inset-y-2 border border-hairline bg-offwhite/[0.035]"
                  style={{ left: pct(RANGE.reference[0]), right: pct(1 - RANGE.reference[1]) }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-y-2 border border-amber/60 bg-amber/15"
                  style={{ left: pct(RANGE.optimal[0]), width: pct(RANGE.optimal[1] - RANGE.optimal[0]) }}
                  aria-hidden="true"
                />
                {/* marker */}
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
                  <span className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black border border-offwhite/80 shadow-[0_0_18px_rgba(226,196,143,0.45)] transition-[border-color,box-shadow] duration-300 group-focus-visible:border-amber group-hover:border-gold" />
                </div>
              </div>

              {/* labels below */}
              <div className="relative h-5 mt-3 font-sans text-[10px] tracking-[0.25em] uppercase text-amber-muted">
                <span
                  className="absolute whitespace-nowrap"
                  style={{ left: pct((RANGE.optimal[0] + RANGE.optimal[1]) / 2), transform: 'translateX(-50%)' }}
                >
                  Optimal for you
                </span>
              </div>

              {/* status */}
              <div className="mt-10 min-h-[4.5rem]">
                <p
                  ref={statusRef}
                  className="font-serif font-light text-offwhite text-2xl md:text-[1.75rem] tracking-wide"
                >
                  {STATUS_TEXT[status]}
                </p>
                <p className="mt-2 font-sans text-sm text-body-dim tracking-wide">{STATUS_NOTE[status]}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
