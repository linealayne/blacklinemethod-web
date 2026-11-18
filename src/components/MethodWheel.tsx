'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useMotion } from '@/components/motion/MotionProvider'

export interface WheelPillar {
  id: string
  label: string
}

/** Method wheel knobs */
export const WHEEL = {
  period: 34, // seconds per full turn
  stopEase: 12, // how quickly the wheel settles when a pillar is held (per second; quick, so the pillar stays under the cursor)
  resumeEase: 1.4, // how gently it comes back up to speed when released
  resumeAfterMs: 4200, // touch: resume on its own after this long
  radius: 0.34, // node ring, as a share of the wheel's width
  labelGap: 20, // px between a node and the near edge of its label (labels hug their node, outward)
  compact: { below: 520, radius: 0.25, labelGap: 12 }, // small wheels (phones)
}

function geometry(size: number) {
  return size < WHEEL.compact.below ? WHEEL.compact : WHEEL
}

const TAU = Math.PI * 2

/**
 * The four pillars on a slowly turning wheel. Rotation is time-based, never
 * tied to scroll. A fixed front marker (left on desktop, toward the copy;
 * bottom on phones, toward the copy below) decides the active pillar and
 * `onActive` reports it so the description panel can crossfade. Hovering or
 * focusing a pillar eases the wheel to a stop and highlights it; leaving
 * eases it back to speed from where it stopped. Touch: tap a pillar to hold
 * it, tap empty space (or wait) to resume. Pauses off screen; reduced motion
 * shows a still wheel whose pillars are still selectable.
 */
export function MethodWheel({
  pillars,
  onActive,
  onChoose,
  className = '',
}: {
  pillars: WheelPillar[]
  onActive?: (index: number) => void
  /** optional: called when a pillar is clicked (the /method page jumps to its section) */
  onChoose?: (index: number) => void
  className?: string
}) {
  const { mounted, reduced } = useMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([])
  const spokeRefs = useRef<(SVGLineElement | null)[]>([])
  const polyRef = useRef<SVGPolygonElement>(null)
  const markerRef = useRef<HTMLSpanElement>(null)
  const [compact, setCompact] = useState(false)
  const [held, setHeld] = useState<number | null>(null)
  const [front, setFront] = useState(0)
  const heldRef = useRef<number | null>(null)
  const timer = useRef<number | null>(null)
  const state = useRef({ angle: 0, speed: 1, markerAngle: Math.PI, size: 400, inView: true })
  const n = pillars.length

  // the angle that puts pillar 0 at the marker
  const place = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    const s = state.current
    const size = root.clientWidth
    s.size = size
    const g = geometry(size)
    const r = size * g.radius
    const c = size / 2
    let best = 0
    let bestD = Infinity
    const pts: string[] = []
    for (let i = 0; i < n; i++) {
      const a = s.angle + (i / n) * TAU
      const x = c + Math.cos(a) * r
      const y = c + Math.sin(a) * r
      const ax = Math.cos(a)
      const ay = Math.sin(a)
      const el = nodeRefs.current[i]
      if (el) {
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
        el.style.setProperty('--ax', ax.toFixed(3))
        el.style.setProperty('--ay', ay.toFixed(3))
        el.style.setProperty('--gap', `${g.labelGap}px`)
      }
      const sp = spokeRefs.current[i]
      if (sp) {
        sp.setAttribute('x2', x.toFixed(1))
        sp.setAttribute('y2', y.toFixed(1))
      }
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
      let d = Math.abs((((a - s.markerAngle) % TAU) + TAU) % TAU)
      d = Math.min(d, TAU - d)
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    polyRef.current?.setAttribute('points', pts.join(' '))
    const m = markerRef.current
    if (m) {
      const mr = r - 18
      m.style.transform = `translate(${(c + Math.cos(s.markerAngle) * mr).toFixed(1)}px, ${(c + Math.sin(s.markerAngle) * mr).toFixed(1)}px) rotate(${s.markerAngle}rad)`
    }
    setFront((f) => (f === best ? f : best))
  }, [n])

  // marker side follows the layout: left beside the copy, bottom when stacked
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => {
      state.current.markerAngle = mq.matches ? Math.PI : Math.PI / 2
      state.current.angle = state.current.markerAngle // pillar 0 starts at the marker
      place()
    }
    sync()
    mq.addEventListener('change', sync)
    const ro = new ResizeObserver(() => {
      setCompact((rootRef.current?.clientWidth ?? 600) < WHEEL.compact.below)
      place()
    })
    if (rootRef.current) ro.observe(rootRef.current)
    return () => {
      mq.removeEventListener('change', sync)
      ro.disconnect()
    }
  }, [place])

  // the turn
  useEffect(() => {
    if (!mounted || reduced) return
    const root = rootRef.current
    if (!root) return
    let raf = 0
    let last = performance.now()
    let running = false
    const s = state.current
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const target = heldRef.current === null ? 1 : 0
      s.speed += (target - s.speed) * (1 - Math.exp(-dt * (target === 0 ? WHEEL.stopEase : WHEEL.resumeEase)))
      if (target === 0 && s.speed < 0.003) s.speed = 0
      if (s.speed > 0) {
        s.angle = (s.angle + dt * s.speed * (TAU / WHEEL.period)) % TAU
        place()
      }
      raf = requestAnimationFrame(tick)
    }
    const run = (on: boolean) => {
      if (on === running) return
      running = on
      if (on) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      } else cancelAnimationFrame(raf)
    }
    const io = new IntersectionObserver(([e]) => {
      s.inView = e.isIntersecting
      run(s.inView && !document.hidden)
    })
    io.observe(root)
    const onVis = () => run(s.inView && !document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      run(false)
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [mounted, reduced, place])

  const active = held ?? front
  useEffect(() => {
    onActive?.(active)
  }, [active, onActive])

  const hold = (i: number | null, autoResume = false) => {
    heldRef.current = i
    setHeld(i)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
    if (i !== null && autoResume) timer.current = window.setTimeout(() => hold(null), WHEEL.resumeAfterMs)
  }
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const pointerType = useRef('mouse')

  return (
    <div
      ref={rootRef}
      className={`relative aspect-square w-full select-none ${className}`}
      onPointerDown={(e) => {
        pointerType.current = e.pointerType
        // tap on empty space releases a held pillar
        if (e.pointerType !== 'mouse' && !(e.target as Element).closest('[data-pillar-node]')) hold(null)
      }}
    >
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {/* scale rings and ticks (drawn in a 100-unit box; vector-effect keeps hairlines at 1px) */}
        <circle cx="50" cy="50" r={(compact ? WHEEL.compact.radius : WHEEL.radius) * 100} stroke="#F2F1EC" strokeOpacity="0.16" fill="none" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="50" r={(compact ? WHEEL.compact.radius : WHEEL.radius) * 100 + 6} stroke="#F2F1EC" strokeOpacity="0.08" strokeDasharray="1 5" fill="none" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="50" r="9" stroke="#C8965A" strokeOpacity="0.35" fill="none" vectorEffect="non-scaling-stroke" />
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * TAU
          const r0 = (compact ? WHEEL.compact.radius : WHEEL.radius) * 100 + 3
          const r1 = r0 + (i % 6 === 0 ? 2.2 : 1)
          return (
            <line
              key={i}
              x1={(50 + Math.cos(a) * r0).toFixed(3)}
              y1={(50 + Math.sin(a) * r0).toFixed(3)}
              x2={(50 + Math.cos(a) * r1).toFixed(3)}
              y2={(50 + Math.sin(a) * r1).toFixed(3)}
              stroke="#F2F1EC"
              strokeOpacity={i % 6 === 0 ? 0.3 : 0.12}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
      </svg>

      {/* the turning parts, in pixels */}
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <polygon ref={polyRef} fill="none" stroke="#F2F1EC" strokeOpacity="0.12" />
        {pillars.map((p, i) => (
          <line
            key={p.id}
            ref={(el) => {
              spokeRefs.current[i] = el
            }}
            x1="50%"
            y1="50%"
            stroke={i === active ? '#C8965A' : '#F2F1EC'}
            strokeOpacity={i === active ? 0.6 : 0.14}
            strokeDasharray="3 5"
            style={{ transition: 'stroke 0.4s, stroke-opacity 0.4s' }}
          />
        ))}
      </svg>

      {/* fixed front marker: inside the ring, pointing at the active pillar */}
      <span ref={markerRef} aria-hidden="true" className="absolute left-0 top-0 -ml-[3px] -mt-[5px] origin-[3px_5px]">
        <span className="block h-0 w-0 border-y-[5px] border-y-transparent border-l-[7px] border-l-amber" />
      </span>

      {/* centre */}
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bl-label text-[9.5px] text-amber/90 tracking-[0.3em] pl-[0.3em]" aria-hidden="true">
        you
      </span>

      {/* the pillars: real buttons, positioned each frame */}
      {pillars.map((p, i) => {
        const on = i === active
        return (
          <button
            key={p.id}
            type="button"
            data-pillar-node=""
            ref={(el) => {
              nodeRefs.current[i] = el
            }}
            aria-pressed={held === i}
            aria-label={p.label}
            className="group absolute left-0 top-0 -ml-[22px] -mt-[22px] h-11 w-11 rounded-full outline-offset-0"
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') hold(i)
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === 'mouse') hold(null)
            }}
            onFocus={(e) => {
              if (e.currentTarget.matches(':focus-visible')) hold(i)
            }}
            onBlur={() => hold(null)}
            onClick={() => {
              if (pointerType.current !== 'mouse') hold(i, true)
              onChoose?.(i)
            }}
          >
            {/* teal ring when selected */}
            <span
              className={`absolute inset-[9px] rounded-full border border-teal transition-[opacity,transform] duration-500 ease-lux ${on ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            />
            <span
              className={`absolute left-1/2 top-1/2 -ml-[4px] -mt-[4px] h-2 w-2 rounded-full transition-colors duration-500 ${on ? 'bg-amber shadow-[0_0_14px_2px_rgba(200,150,90,0.55)]' : 'bg-offwhite/60 group-hover:bg-offwhite'}`}
            />
            <span
              className={`absolute left-1/2 top-1/2 whitespace-nowrap bl-serif-caps text-[11px] md:text-[13.5px] tracking-[0.18em] md:tracking-[0.22em] transition-colors duration-500 ${on ? 'text-offwhite' : 'text-offwhite/50'}`}
              style={{
                transform:
                  'translate(calc(-50% + var(--ax, 0) * (50% + var(--gap, 20px))), calc(-50% + var(--ay, 0) * (50% + var(--gap, 20px) + 0.35em)))',
              }}
            >
              {p.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** The /method page wheel: choosing a pillar jumps to its section. */
export function MethodWheelNav({ pillars, className = '' }: { pillars: WheelPillar[]; className?: string }) {
  const onChoose = useCallback(
    (i: number) => {
      const el = document.getElementById(pillars[i].id)
      if (!el) return
      const reduced = document.documentElement.classList.contains('bl-reduced')
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    },
    [pillars]
  )
  return <MethodWheel pillars={pillars} onChoose={onChoose} className={className} />
}
