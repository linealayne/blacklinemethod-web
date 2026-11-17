'use client'

import { useEffect, useRef } from 'react'

/**
 * The hero line: one fine line drawn across the screen like a live lab-trend
 * readout. It draws in from the left with an amber read head, starts restless
 * (a noisy, dysregulated signal), and settles into a calm, level line. The
 * cursor bends it (a spring-mass string: every point springs back to the
 * baseline and pulls on its neighbours, so a disturbance travels and damps
 * out); on touch devices the finger and the scroll velocity drive it.
 * Disturbing it also raises its "agitation", so the signal goes noisy again
 * and then calms. That return to a steady line is the brand's point.
 *
 * 2D canvas, DPR capped at 2, fixed-step integration (120Hz) so it behaves
 * the same at any frame rate. The loop sleeps once the line is at rest and
 * wakes on input; it stops when the hero is off screen or the tab is hidden.
 */
export const LINE = {
  spacing: 5, // px between simulated points
  maxPoints: 420,
  step: 1 / 120, // s, fixed integration step
  stiffness: 0.0035, // spring back to the baseline (per step)
  tension: 0.3, // neighbour coupling: how far a bend travels (< 0.5 for stability)
  damping: 0.022,
  pointerPull: 0.016, // how strongly the line bends toward the cursor
  pointerSigma: 110, // px, horizontal width of the bend
  pointerReach: 240, // px, vertical distance at which the cursor still bends the line
  maxBend: 96, // px
  pointerKick: 0.05, // cursor velocity transferred into the line
  scrollKick: 0.045, // scroll velocity transferred into the line (touch devices mostly)
  drawDuration: 1.9, // s, intro draw
  agitationDecay: 0.75, // per second (exponential)
  agitationGain: 0.0009, // per px of pointer travel
  noiseAmp: 22, // px of signal noise at full agitation
  dprCap: 2,
  lineWidth: 1.15,
  lineAlpha: 0.9,
  haloAlpha: 0.05,
  bandHalf: 44, // px, half-height of the faint reference band
  bandAlpha: 0.09,
  restDotX: 0.78, // read head rest position (share of width)
  colors: { line: '242,241,236', amber: '200,150,90' },
}

export interface HeroLineProps {
  /** element whose vertical centre is the line's baseline */
  anchor: React.RefObject<HTMLElement>
  /** begin the intro draw */
  start: boolean
  /** render at all (false when off screen or the tab is hidden) */
  active: boolean
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// smooth 1D value noise
function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453
  return s - Math.floor(s)
}
function vnoise(x: number) {
  const i = Math.floor(x)
  const f = x - i
  const u = f * f * (3 - 2 * f)
  return (hash(i) * (1 - u) + hash(i + 1) * u) * 2 - 1
}

export default function HeroLine({ anchor, start, active }: HeroLineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const api = useRef<{ wake: () => void; begin: () => void; setActive: (a: boolean) => void } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0
    let dpr = 1
    let base = 0
    let n = 0
    let xs = new Float32Array(0)
    let y = new Float32Array(0)
    let v = new Float32Array(0)

    let drawT = 0 // seconds since begin
    let begun = false
    let agitation = 1
    let noiseT = 0
    let acc = 0
    let last = 0
    let raf = 0
    let running = false
    let visible = true
    let idleSince = 0

    const ptr = { x: 0, y: 0, vx: 0, vy: 0, active: false, lastMove: 0 }
    let dotX = 0
    let scrollY = window.scrollY

    const measure = () => {
      const r = host.getBoundingClientRect()
      W = Math.max(1, Math.round(r.width))
      H = Math.max(1, Math.round(r.height))
      dpr = Math.min(window.devicePixelRatio || 1, LINE.dprCap)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      const a = anchor.current?.getBoundingClientRect()
      base = a ? a.top + a.height / 2 - r.top : H * 0.6
      const count = Math.min(LINE.maxPoints, Math.ceil(W / LINE.spacing) + 1)
      if (count !== n) {
        n = count
        xs = new Float32Array(n)
        y = new Float32Array(n)
        v = new Float32Array(n)
      }
      for (let i = 0; i < n; i++) xs[i] = (i / (n - 1)) * W
      if (!dotX) dotX = W * LINE.restDotX
    }

    const signal = (x: number, t: number) =>
      Math.sin(x * 0.012 + t * 1.6) * 0.42 +
      Math.sin(x * 0.029 - t * 2.4) * 0.26 +
      vnoise(x * 0.045 + t * 2.2) * 0.38 +
      vnoise(x * 0.16 - t * 4.5) * 0.14

    const physics = () => {
      const K = LINE.stiffness
      const T = LINE.tension
      const D = LINE.damping
      const sig2 = 2 * LINE.pointerSigma * LINE.pointerSigma
      let prox = 0
      let target = 0
      if (ptr.active) {
        const dy = ptr.y - base
        prox = Math.exp(-(dy * dy) / (2 * LINE.pointerReach * LINE.pointerReach))
        target = Math.max(-LINE.maxBend, Math.min(LINE.maxBend, dy * 0.55))
      }
      for (let i = 1; i < n - 1; i++) {
        let a = -K * y[i] + T * (y[i - 1] + y[i + 1] - 2 * y[i]) - D * v[i]
        if (prox > 0.002) {
          const dx = xs[i] - ptr.x
          const g = Math.exp(-(dx * dx) / sig2) * prox
          if (g > 0.001) {
            a += LINE.pointerPull * g * (target - y[i])
            v[i] += ptr.vy * g * LINE.pointerKick
          }
        }
        v[i] += a
      }
      for (let i = 1; i < n - 1; i++) {
        y[i] += v[i]
        if (y[i] > LINE.maxBend * 1.4) y[i] = LINE.maxBend * 1.4
        else if (y[i] < -LINE.maxBend * 1.4) y[i] = -LINE.maxBend * 1.4
      }
      ptr.vx *= 0.8
      ptr.vy *= 0.8
    }

    const render = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const drawP = easeInOut(Math.min(1, drawT / LINE.drawDuration))
      const headX = drawP * W
      const amp = LINE.noiseAmp * agitation
      // edges taper so the line enters and leaves the frame calmly
      const edge = (x: number) => Math.min(1, x / (W * 0.08), (W - x) / (W * 0.08))
      const yAt = (i: number) => base + (y[i] + signal(xs[i], noiseT) * amp) * edge(xs[i])

      // reference band: two faint dashed rules, fading in after the draw
      const bandFade = Math.max(0, Math.min(1, (drawT - LINE.drawDuration * 0.6) / 1.2))
      if (bandFade > 0) {
        ctx.save()
        ctx.setLineDash([2, 6])
        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(${LINE.colors.line},${LINE.bandAlpha * bandFade})`
        ctx.beginPath()
        for (const off of [-LINE.bandHalf, LINE.bandHalf]) {
          const yy = Math.round(base + off) + 0.5
          ctx.moveTo(0, yy)
          ctx.lineTo(W, yy)
        }
        ctx.stroke()
        ctx.restore()
      }

      // the line, clipped to the draw head
      const lastIdx = Math.min(n - 1, Math.ceil((headX / W) * (n - 1)))
      if (lastIdx >= 1) {
        ctx.beginPath()
        ctx.moveTo(xs[0], yAt(0))
        for (let i = 1; i <= lastIdx; i++) {
          const x = Math.min(xs[i], headX)
          ctx.lineTo(x, yAt(i))
        }
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.strokeStyle = `rgba(${LINE.colors.line},${LINE.haloAlpha})`
        ctx.lineWidth = 6
        ctx.stroke()
        ctx.strokeStyle = `rgba(${LINE.colors.line},${LINE.lineAlpha})`
        ctx.lineWidth = LINE.lineWidth
        ctx.stroke()
      }

      // amber read head: rides the draw tip, then follows the cursor's x
      let hx: number
      if (drawP < 1) hx = headX
      else hx = dotX
      const fi = Math.max(0, Math.min(n - 1, (hx / W) * (n - 1)))
      const i0 = Math.floor(fi)
      const i1 = Math.min(n - 1, i0 + 1)
      const hy = yAt(i0) + (yAt(i1) - yAt(i0)) * (fi - i0)
      const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 16)
      glow.addColorStop(0, `rgba(${LINE.colors.amber},0.42)`)
      glow.addColorStop(1, `rgba(${LINE.colors.amber},0)`)
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(hx, hy, 16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = `rgb(${LINE.colors.amber})`
      ctx.beginPath()
      ctx.arc(hx, hy, 2.6, 0, Math.PI * 2)
      ctx.fill()
    }

    const atRest = (now: number) => {
      if (drawT < LINE.drawDuration + 1.5) return false
      if (agitation > 0.004) return false
      if (ptr.active && now - ptr.lastMove < 600) return false
      const targetX = ptr.active ? ptr.x : W * LINE.restDotX
      if (Math.abs(dotX - targetX) > 0.5) return false
      for (let i = 0; i < n; i += 3) {
        if (Math.abs(v[i]) > 0.01 || Math.abs(y[i]) > 0.08) return false
      }
      return true
    }

    const frame = (now: number) => {
      raf = 0
      if (!visible || !begun) {
        running = false
        return
      }
      const dt = Math.min(0.05, (now - last) / 1000 || 0)
      last = now
      drawT += dt
      agitation *= Math.exp(-LINE.agitationDecay * dt)
      noiseT += dt * (0.35 + agitation * 0.9)
      acc += dt
      let steps = 0
      while (acc >= LINE.step && steps < 8) {
        physics()
        acc -= LINE.step
        steps++
      }
      if (steps === 8) acc = 0
      const targetX = ptr.active ? ptr.x : W * LINE.restDotX
      dotX += (targetX - dotX) * (1 - Math.exp(-dt * 6))
      render()
      if (atRest(now)) {
        if (!idleSince) idleSince = now
        if (now - idleSince > 300) {
          running = false
          return
        }
      } else idleSince = 0
      raf = requestAnimationFrame(frame)
    }

    const wake = () => {
      if (running || !visible) return
      running = true
      idleSince = 0
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    // ----- input -----
    const local = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect()
      return { x: cx - r.left, y: cy - r.top }
    }
    const moveTo = (cx: number, cy: number, now: number) => {
      const p = local(cx, cy)
      if (ptr.active) {
        const dx = p.x - ptr.x
        const dy = p.y - ptr.y
        ptr.vx = dx * 0.5
        ptr.vy = dy * 0.5
        const near = Math.exp(-Math.pow(p.y - base, 2) / (2 * LINE.pointerReach * LINE.pointerReach))
        agitation = Math.min(1, agitation + Math.hypot(dx, dy) * LINE.agitationGain * near)
      }
      ptr.x = p.x
      ptr.y = p.y
      ptr.active = p.y > -40 && p.y < H + 40
      ptr.lastMove = now
      wake()
    }
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      moveTo(e.clientX, e.clientY, performance.now())
    }
    const onLeave = () => {
      ptr.active = false
      wake()
    }
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) moveTo(t.clientX, t.clientY, performance.now())
    }
    const onTouchEnd = () => {
      ptr.active = false
      wake()
    }
    const onScroll = () => {
      const sy = window.scrollY
      const d = sy - scrollY
      scrollY = sy
      if (!d || !begun) return
      const kick = Math.max(-40, Math.min(40, d)) * LINE.scrollKick
      const centre = ptr.active ? ptr.x : W * 0.5
      const sig2 = 2 * Math.pow(W * 0.22, 2)
      for (let i = 1; i < n - 1; i++) {
        const dx = xs[i] - centre
        v[i] -= kick * Math.exp(-(dx * dx) / sig2)
      }
      agitation = Math.min(1, agitation + Math.abs(d) * 0.0012)
      wake()
    }

    measure()
    const ro = new ResizeObserver(() => {
      measure()
      if (!running) render()
    })
    ro.observe(host)
    if (anchor.current) ro.observe(anchor.current)
    document.fonts?.ready.then(() => {
      measure()
      if (!running) render()
    })

    window.addEventListener('pointermove', onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    host.parentElement?.addEventListener('touchstart', onTouch, { passive: true })
    host.parentElement?.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    api.current = {
      wake,
      begin: () => {
        if (begun) return
        begun = true
        canvas.classList.add('is-live')
        wake()
      },
      setActive: (a: boolean) => {
        visible = a
        if (a) wake()
        else if (raf) {
          cancelAnimationFrame(raf)
          raf = 0
          running = false
        }
      },
    }

    return () => {
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      host.parentElement?.removeEventListener('touchstart', onTouch)
      host.parentElement?.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('scroll', onScroll)
      api.current = null
    }
  }, [anchor])

  useEffect(() => {
    if (start) api.current?.begin()
  }, [start])

  useEffect(() => {
    api.current?.setActive(active)
  }, [active])

  return <canvas ref={canvasRef} className="bl-line-canvas absolute inset-0 block" aria-hidden="true" />
}

