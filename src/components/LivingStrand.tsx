'use client'

import { useEffect, useRef, useState } from 'react'
import { tokenHex } from '@/components/hero/gene-env'
import { GROOVE, HelixFragment, type FragmentShape } from '@/components/Strand'

/**
 * A length of the gene, alive: the same side-on particle helix as
 * HelixFragment (Strand.tsx), turning slowly about its own axis while an
 * ember ripple travels along the rungs one base pair at a time, the way the
 * hero's does. Drawn on a small 2D canvas with additive glow sprites; all
 * the canvases on a page share one animation frame.
 *
 * It costs nothing until it is first scrolled into view (no sprites, no
 * particles, no frame), and after that it only draws while it is on screen,
 * the tab is visible, and `running` is true. Reduced motion, or no canvas, leaves the static HelixFragment that
 * is rendered underneath (and is what the server sends).
 */

export interface StrandLife {
  /** radians per second about the strand's axis */
  speed: number
  /** rungs per second for the ripple */
  pulseRate: number
  /** which strand is the brighter, nearer one */
  lead: 'teal' | 'violet' | 'both'
}

interface Props extends FragmentShape, StrandLife {
  running?: boolean
  /** change this number to send one ripple along the strand from the start (the card flip) */
  burst?: number
  className?: string
}

// ---- one animation frame for every living strand on the page
const drawers = new Set<(now: number) => void>()
let raf = 0
const tick = (now: number) => {
  drawers.forEach((d) => d(now))
  raf = drawers.size ? requestAnimationFrame(tick) : 0
}
const subscribe = (d: (now: number) => void) => {
  drawers.add(d)
  if (!raf) raf = requestAnimationFrame(tick)
  return () => {
    drawers.delete(d)
  }
}

// ---- glow sprites, one per colour
const sprites = new Map<string, HTMLCanvasElement>()
function sprite(hex: string) {
  let c = sprites.get(hex)
  if (c) return c
  c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const n = parseInt(hex.slice(1), 16)
  const rgb = `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, `rgba(${rgb}, 1)`)
  grad.addColorStop(0.17, `rgba(${rgb}, 1)`)
  grad.addColorStop(0.3, `rgba(${rgb}, 0.42)`)
  grad.addColorStop(0.6, `rgba(${rgb}, 0.1)`)
  grad.addColorStop(1, `rgba(${rgb}, 0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  sprites.set(hex, c)
  return c
}

interface Particle {
  t: number
  du: number
  jit: number
  size: number
  bright: number
  seed: number
}

/** the same repeatable scatter as the static strand, so the two match */
function particles(count: number, phase: number): Particle[] {
  return Array.from({ length: count }, (_, n) => {
    const h1 = Math.sin(n * 12.9898 + phase * 7.1) * 43758.5453
    const h2 = Math.sin(n * 78.233 + phase * 3.7) * 12543.1337
    const r1 = h1 - Math.floor(h1)
    const r2 = h2 - Math.floor(h2)
    return {
      t: (n + 0.5) / count,
      du: (r2 - 0.5) * 1.6,
      jit: (r1 - 0.5) * 3.4,
      size: r2 > 0.9 ? 1.7 : 0.6 + r2 * 0.7,
      bright: r2 > 0.9 ? 1.25 : 1,
      seed: r1 * 40,
    }
  })
}

export function LivingStrand({ running = true, burst = 0, className = '', speed, pulseRate, lead, ...shape }: Props) {
  const { width = 300, height = 96, turns, phase = 0, rungCount, density = 0.5 } = shape
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)
  const flags = useRef({ running, burst })
  flags.current = { running, burst }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || document.documentElement.classList.contains('bl-reduced')) return
    let stop: (() => void) | null = null
    let ro: ResizeObserver | null = null
    let visible = false
    let draw: ((now: number) => void) | null = null

    /** built the first time the strand comes into view */
    const setup = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      const colors = {
        teal: sprite(tokenHex('teal', '#2FA39A')),
        violet: sprite(tokenHex('violet', '#7A6CF2')),
        ember: sprite(tokenHex('ember', '#C8965A')),
      }
      const ember = tokenHex('ember', '#C8965A')
      const white = tokenHex('offwhite', '#F2F1EC')
      const n = Math.round(width * density)
      const strands = [
        {
          dots: particles(n, phase),
          offset: 0,
          sprite: colors.teal,
          gain: lead === 'violet' ? 0.6 : 1,
        },
        {
          dots: particles(n, phase + GROOVE),
          offset: GROOVE,
          sprite: colors.violet,
          gain: lead === 'teal' ? 0.6 : 1,
        },
      ]
      // the leading strand is drawn last, over the other
      if (lead !== 'violet') strands.reverse()

      const mid = height / 2
      const amp = height / 2 - 6
      let scale = 1
      let last = 0
      let rot = 0
      let pulse = -1
      let seenBurst = flags.current.burst
      let wait = 0
      let drawn = false

      const fit = () => {
        const r = canvas.getBoundingClientRect()
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const w = Math.max(1, Math.round(r.width * dpr))
        const h = Math.max(1, Math.round(r.height * dpr))
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w
          canvas.height = h
        }
        scale = w / width
        drawn = false
      }

      const frame = (now: number) => {
        const on = visible && flags.current.running
        if (!on && drawn) {
          last = 0
          return
        }
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
        last = on ? now : 0
        rot += dt * speed
        // a flip sends one ripple from the start, after the card has turned
        if (flags.current.burst !== seenBurst) {
          seenBurst = flags.current.burst
          pulse = -1
          wait = 0.45
        }
        if (wait > 0) wait -= dt
        else pulse += dt * pulseRate
        if (pulse > rungCount + 5) pulse = -3

        ctx.setTransform(scale, 0, 0, scale, 0, 0)
        ctx.clearRect(0, 0, width, height)
        ctx.globalCompositeOperation = 'lighter'

        // rungs: faint, lit in ember as the ripple passes
        ctx.lineWidth = 1
        for (let k = 0; k < rungCount; k++) {
          const t = (k + 0.5) / rungCount
          const a = t * Math.PI * 2 * turns + phase + rot
          const x = t * width
          const y1 = mid + Math.sin(a) * amp
          const y2 = mid + Math.sin(a + GROOVE) * amp
          const lag = pulse - k
          const lit = Math.min(1, Math.exp(-lag * lag * 1.6) + (lag > 0 ? Math.exp(-lag * 0.9) * 0.35 : 0))
          ctx.globalAlpha = 0.14 + lit * 0.7
          ctx.strokeStyle = lit > 0.5 ? ember : white
          ctx.beginPath()
          ctx.moveTo(x, y1)
          ctx.lineTo(x, y2)
          ctx.stroke()
          if (lit > 0.06) {
            // a few ember particles along the lit rung, sized to the strand
            ctx.globalAlpha = lit * 0.5
            for (let m = 0; m < 5; m++) {
              const u = 0.12 + m * 0.19
              const s = (0.045 + lit * 0.035) * height
              ctx.drawImage(colors.ember, x - s / 2, y1 + (y2 - y1) * u - s / 2, s, s)
            }
          }
        }

        // the two strands: the near side of each is larger and brighter
        for (const strand of strands) {
          for (const d of strand.dots) {
            const a = d.t * Math.PI * 2 * turns + phase + strand.offset + rot
            const near = (Math.cos(a) + 1) / 2
            const r = (0.5 + near * 0.8) * d.size
            const twinkle = 0.9 + 0.1 * Math.sin(now * 0.0011 + d.seed)
            // the strand tapers out at both ends instead of stopping at the edge
            const end = Math.min(1, Math.min(d.t, 1 - d.t) / 0.06)
            ctx.globalAlpha = Math.min(1, (0.2 + near * 0.7) * d.bright * strand.gain * twinkle) * end
            const s = r * 9
            ctx.drawImage(strand.sprite, d.t * width + d.du - s / 2, mid + Math.sin(a) * amp + d.jit - s / 2, s, s)
          }
        }
        ctx.globalAlpha = 1
        if (!drawn) {
          drawn = true
          setLive(true)
        }
      }

      fit()
      ro = new ResizeObserver(fit)
      ro.observe(canvas)
      return frame
    }

    // in the frame loop only while on screen
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !draw) draw = setup()
      if (visible && draw && !stop) stop = subscribe(draw)
      if (!visible && stop) {
        stop()
        stop = null
      }
    })
    io.observe(canvas)
    return () => {
      stop?.()
      ro?.disconnect()
      io.disconnect()
    }
  }, [width, height, turns, phase, rungCount, density, speed, pulseRate, lead])

  return (
    <span className={`bl-living relative block ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className={`bl-living-canvas absolute inset-0 h-full w-full ${live ? 'is-live' : ''}`} />
      <HelixFragment {...shape} lead={lead} className="block h-auto w-full" />
    </span>
  )
}
