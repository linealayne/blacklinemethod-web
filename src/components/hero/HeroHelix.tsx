'use client'

import { useEffect, useRef, useState } from 'react'
import { INTRO } from '@/lib/flags'
import { HELIX } from './helix-config'
import type { HelixColors, Tier } from './HelixScene'
import type { FromWorker, ToWorker } from './helix.worker'

interface HeroHelixProps {
  /** the hero section: the scene fills its box and listens to it */
  hostRef: React.RefObject<HTMLElement>
  /** play the full formation (the loading sequence is running) */
  intro: boolean
  /** WebGL could not start or was lost: show the static still */
  onFail: () => void
}

/** What the wrapper needs from a running scene, wherever it runs. */
interface SceneHandle {
  resize(width: number, height: number, dpr: number): void
  pointerMove(x: number, y: number, inside: boolean): void
  pointerLeave(): void
  drag(dx: number, dy: number): void
  dragEnd(): void
  pulseStrand(): void
  skip(): void
  setActive(active: boolean): void
  dispose(): void
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

/** The palette, from the CSS tokens in globals.css (helix-config holds fallbacks). */
function readColors(): HelixColors {
  const css = getComputedStyle(document.documentElement)
  const hex = (name: string, fallback: string) => {
    const v = css.getPropertyValue(`--bl-${name}-rgb`).trim().split(/\s+/).map(Number)
    if (v.length !== 3 || v.some((n) => !Number.isFinite(n))) return fallback
    return `#${v.map((n) => n.toString(16).padStart(2, '0')).join('')}`
  }
  return {
    amber: hex('ember', HELIX.colors.amber),
    teal: hex('teal', HELIX.colors.teal),
    violet: hex('violet', HELIX.colors.violet),
    offwhite: hex('offwhite', HELIX.colors.offwhite),
  }
}

const canUseWorker = () =>
  typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined' && 'transferControlToOffscreen' in HTMLCanvasElement.prototype

/**
 * The hero scene. It runs in a web worker on an OffscreenCanvas wherever
 * the browser allows (helix.worker.ts), so three.js never blocks the page;
 * otherwise, or if the worker cannot get a WebGL context, the same scene
 * runs on the main thread. Either way this component only measures, listens,
 * and forwards.
 *
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
  // 'worker' first; 'main' after a worker failure (the canvas is remounted, since a transferred canvas cannot be taken back)
  const [mode, setMode] = useState<'worker' | 'main'>(() => (canUseWorker() ? 'worker' : 'main'))
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
    let disposed = false
    let handle: SceneHandle | null = null
    const cleanups: (() => void)[] = []

    const box = () => {
      const r = host.getBoundingClientRect()
      return { width: Math.max(1, r.width), height: Math.max(1, r.height), dpr: window.devicePixelRatio || 1 }
    }
    const holdMs = () => (intro ? Math.max(0, (window.__blIntroT0 ?? 0) + INTRO.geneMs - performance.now()) : 0)
    const init = { ...box(), colors: readColors(), tier: pickTier(phone), phone, intro }

    /** wire the page to a running scene */
    const attach = (s: SceneHandle) => {
      handle = s

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
        const b = box()
        s.resize(b.width, b.height, b.dpr)
      })
      ro.observe(host)
      cleanups.push(() => ro.disconnect())

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
        s.pointerMove(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1), inside)
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
    }

    if (mode === 'worker') {
      // ---- off the main thread
      let worker: Worker
      try {
        worker = new Worker(new URL('./helix.worker.ts', import.meta.url))
        const off = canvas.transferControlToOffscreen()
        const send = (m: ToWorker, transfer: Transferable[] = []) => worker.postMessage(m, transfer)
        const fallBack = () => {
          if (disposed) return
          worker.terminate()
          setLive(false)
          setMode('main')
        }
        worker.onmessage = (e: MessageEvent<FromWorker>) => {
          if (e.data.type === 'frame') setLive(true)
          else fallBack()
        }
        worker.onerror = fallBack
        send({ type: 'init', canvas: off, ...init, holdMs: holdMs() }, [off])
        attach({
          resize: (width, height, dpr) => send({ type: 'resize', width, height, dpr }),
          pointerMove: (x, y, inside) => send({ type: 'pointer', x, y, inside }),
          pointerLeave: () => send({ type: 'leave' }),
          drag: (dx, dy) => send({ type: 'drag', dx, dy }),
          dragEnd: () => send({ type: 'dragEnd' }),
          pulseStrand: () => send({ type: 'pulse' }),
          skip: () => send({ type: 'skip' }),
          setActive: (active) => send({ type: 'active', active }),
          dispose: () => {
            send({ type: 'dispose' })
            window.setTimeout(() => worker.terminate(), 200)
          },
        })
      } catch {
        setMode('main')
      }
    } else {
      // ---- on the main thread (no OffscreenCanvas, or the worker could not start)
      import('./HelixScene')
        // let the browser breathe between evaluating three.js and building the scene
        .then((mod) => new Promise<typeof mod>((resolve) => window.setTimeout(() => resolve(mod), 0)))
        .then(({ HelixScene }) => {
          if (disposed) return
          const scene = new HelixScene({
            canvas,
            ...init,
            ...box(),
            holdUntil: intro ? performance.now() + holdMs() : 0,
            onLock: () => {},
            onFirstFrame: () => setLive(true),
          })
          const onLost = (e: Event) => {
            e.preventDefault()
            callbacks.current.onFail()
          }
          canvas.addEventListener('webglcontextlost', onLost)
          cleanups.push(() => canvas.removeEventListener('webglcontextlost', onLost))
          attach(scene)
        })
        .catch(() => callbacks.current.onFail())
    }

    return () => {
      disposed = true
      cleanups.forEach((c) => c())
      handle?.dispose()
      handle = null
    }
  }, [hostRef, intro, phone, mode])

  // the key remounts the canvas whenever the scene restarts: a canvas handed to a worker cannot be reused
  return <canvas key={`${mode}-${phone}-${intro}`} ref={canvasRef} className={`bl-helix-canvas absolute inset-0 h-full w-full ${live ? 'is-live' : ''}`} />
}
