'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useMotion } from '@/components/motion/MotionProvider'
import { supportsWebGL } from '@/components/three/webgl'
import { canUseWorker, pickTier, readColors } from '@/components/hero/gene-env'
import type { FromWorker, ToWorker } from '@/components/hero/helix.worker'

export interface Pillar {
  id: string
  label: string
  description: string
}

/** What this component needs from the running scene, wherever it runs. */
interface SceneHandle {
  resize(width: number, height: number, dpr: number): void
  setActive(active: boolean): void
  jump(index: number): void
  setHeld(on: boolean): void
  setFrozen(on: boolean): void
  dispose(): void
}

/**
 * The rotating gene: the four pillars as nodes on one turning gene
 * (PillarScene.ts), with the active pillar's number, name, and description
 * beside it. One pillar shows at a time and they cross-fade as the gene
 * brings each node to the front. The 01 to 04 index jumps to a pillar; on
 * touch a horizontal swipe does the same.
 *
 * The turn is time-based. It rests while the pointer or keyboard focus is
 * on the text or the index, stops with the pause control, and the whole
 * scene sleeps while the section is off screen or the tab is hidden.
 *
 * All four pillars are always in the DOM as real text (the three that are
 * not showing are only transparent), so screen readers get the full list.
 * Reduced motion, no WebGL, and no JavaScript get the static strand with all
 * four pillars listed instead (`.bl-rotor-static`, see globals.css).
 *
 * PROTECTED: a staple of the site. Do not change unless Layne asks.
 */
export function PillarGene({ pillars, className = '' }: { pillars: Pillar[]; className?: string }) {
  const { mounted, reduced, webgl } = useMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handle = useRef<SceneHandle | null>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [live, setLive] = useState(false)
  const [failed, setFailed] = useState(false)
  const [near, setNear] = useState(false)
  const [stacked, setStacked] = useState<boolean | null>(null)
  const [mode, setMode] = useState<'worker' | 'main'>('worker')
  // what the scene must be told again if it restarts (a layout change rebuilds it)
  const state = useRef({ active: 0, paused: false })
  state.current = { active, paused }

  const enabled = mounted && !reduced && webgl && !failed

  useEffect(() => {
    if (!enabled) return
    if (!supportsWebGL()) {
      setFailed(true)
      return
    }
    if (!canUseWorker()) setMode('main')
    // the stacked layout (gene across the top) below the two-column breakpoint
    const mq = window.matchMedia('(max-width: 1023px)')
    const sync = () => setStacked(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    // nothing is downloaded or started until the section is close
    const root = rootRef.current
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '80% 0px' }
    )
    if (root) io.observe(root)
    return () => {
      mq.removeEventListener('change', sync)
      io.disconnect()
    }
  }, [enabled])

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    const root = rootRef.current
    if (!enabled || !near || stacked === null || !canvas || !stage || !root) return
    let disposed = false
    const cleanups: (() => void)[] = []

    const box = () => {
      const r = stage.getBoundingClientRect()
      return { width: Math.max(1, r.width), height: Math.max(1, r.height), dpr: window.devicePixelRatio || 1 }
    }
    const init = { ...box(), colors: readColors(), tier: pickTier(window.matchMedia('(max-width: 767px)').matches), phone: stacked }
    const onPillar = (index: number) => {
      if (!disposed) setActive(index)
    }
    const fail = () => {
      if (!disposed) setFailed(true)
    }

    const attach = (s: SceneHandle) => {
      handle.current = s
      if (state.current.active) s.jump(state.current.active)
      if (state.current.paused) s.setFrozen(true)

      // run only while the section is on screen and the tab is visible
      let inView = false
      const update = () => s.setActive(inView && !document.hidden)
      const io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting
        update()
      })
      io.observe(root)
      document.addEventListener('visibilitychange', update)
      const ro = new ResizeObserver(() => {
        const b = box()
        s.resize(b.width, b.height, b.dpr)
      })
      ro.observe(stage)
      cleanups.push(() => {
        io.disconnect()
        ro.disconnect()
        document.removeEventListener('visibilitychange', update)
      })
    }

    if (mode === 'worker') {
      try {
        const worker = new Worker(new URL('../hero/helix.worker.ts', import.meta.url))
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
          else if (e.data.type === 'pillar') onPillar(e.data.index)
          else fallBack()
        }
        worker.onerror = fallBack
        send({ type: 'init-pillars', canvas: off, ...init }, [off])
        attach({
          resize: (width, height, dpr) => send({ type: 'resize', width, height, dpr }),
          setActive: (on) => send({ type: 'active', active: on }),
          jump: (index) => send({ type: 'jump', index }),
          setHeld: (on) => send({ type: 'held', on }),
          setFrozen: (on) => send({ type: 'frozen', on }),
          dispose: () => {
            send({ type: 'dispose' })
            window.setTimeout(() => worker.terminate(), 200)
          },
        })
      } catch {
        setMode('main')
      }
    } else {
      import('./PillarScene')
        .then((mod) => new Promise<typeof mod>((resolve) => window.setTimeout(() => resolve(mod), 0)))
        .then(({ PillarScene }) => {
          if (disposed) return
          const scene = new PillarScene({ canvas, ...init, ...box(), onActive: onPillar, onFirstFrame: () => setLive(true) })
          const onLost = (e: Event) => {
            e.preventDefault()
            fail()
          }
          canvas.addEventListener('webglcontextlost', onLost)
          cleanups.push(() => canvas.removeEventListener('webglcontextlost', onLost))
          attach(scene)
        })
        .catch(fail)
    }

    return () => {
      disposed = true
      cleanups.forEach((c) => c())
      handle.current?.dispose()
      handle.current = null
    }
  }, [enabled, near, stacked, mode])

  const go = useCallback(
    (index: number) => {
      const i = (index + pillars.length) % pillars.length
      setActive(i)
      handle.current?.jump(i)
    },
    [pillars.length]
  )

  const togglePause = () => {
    const next = !paused
    setPaused(next)
    handle.current?.setFrozen(next)
  }

  // resting while someone reads: the pointer or keyboard focus is on the text or the index
  const reading = useRef({ hover: false, focus: false })
  const rest = (patch: Partial<{ hover: boolean; focus: boolean }>) => {
    Object.assign(reading.current, patch)
    handle.current?.setHeld(reading.current.hover || reading.current.focus)
  }

  // touch: a horizontal swipe changes pillar (vertical drags scroll the page as normal)
  const touch = useRef<{ x: number; y: number; id: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') touch.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const t = touch.current
    touch.current = null
    if (!t || e.pointerType !== 'touch' || e.pointerId !== t.id) return
    const dx = e.clientX - t.x
    const dy = e.clientY - t.y
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) go(state.current.active + (dx < 0 ? 1 : -1))
  }

  return (
    <div
      ref={rootRef}
      className={`bl-rotor ${failed ? 'is-failed' : ''} ${className}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (touch.current = null)}
    >
      <div ref={stageRef} className="bl-rotor-stage" aria-hidden="true">
        {/* the key remounts the canvas whenever the scene restarts: a canvas handed to a worker cannot be reused */}
        {enabled && <canvas key={`${mode}-${stacked}`} ref={canvasRef} className={`bl-rotor-canvas ${live ? 'is-live' : ''}`} />}
      </div>

      <div
        className="bl-rotor-panel"
        onPointerEnter={(e) => e.pointerType === 'mouse' && rest({ hover: true })}
        onPointerLeave={(e) => e.pointerType === 'mouse' && rest({ hover: false })}
        onFocus={(e) => e.target.matches(':focus-visible') && rest({ focus: true })}
        onBlur={() => rest({ focus: false })}
      >
        <ol className="bl-rotor-text">
          {pillars.map((pillar, i) => (
            <li key={pillar.id} className={i === active ? 'is-active' : ''}>
              <span className="bl-label text-tan tabular-nums">0{i + 1}</span>
              <h3 className="bl-h3">{pillar.label}</h3>
              <p className="bl-body">{pillar.description}</p>
            </li>
          ))}
        </ol>

        <div className="bl-rotor-index" role="group" aria-label="The four pillars">
          {pillars.map((pillar, i) => (
            <button
              key={pillar.id}
              type="button"
              className="bl-rotor-tab"
              aria-label={`0${i + 1} ${pillar.label}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => go(i)}
            >
              <span className="bl-rotor-dot" aria-hidden="true" />
              <span className="bl-rotor-num bl-label tabular-nums" aria-hidden="true">
                0{i + 1}
              </span>
            </button>
          ))}
          <button
            type="button"
            className="bl-rotor-pause"
            aria-label={paused ? 'Play rotation' : 'Pause rotation'}
            onClick={togglePause}
          >
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" fill="currentColor">
              {paused ? <path d="M2.5 1.2 10.5 6l-8 4.8z" /> : <path d="M2.5 1.5h2.2v9H2.5zM7.3 1.5h2.2v9H7.3z" />}
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
