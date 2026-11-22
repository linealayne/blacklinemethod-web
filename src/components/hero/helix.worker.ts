/// <reference lib="webworker" />
import { HelixScene, type HelixColors, type Tier } from './HelixScene'
import { PillarScene } from '../pillars/PillarScene'

/**
 * The gene scenes, off the main thread. HeroHelix.tsx (the hero) and
 * PillarGene.tsx (the four-pillars section) each start one of these workers,
 * hand it a canvas (transferControlToOffscreen), and then only send small
 * messages: size, pointer position, taps, visibility. three.js is evaluated
 * here, the shaders compile here, and every frame is drawn here, so the page
 * stays responsive however slow the device. One worker script serves both
 * scenes, so three.js is downloaded once.
 */

export type ToWorker =
  | {
      type: 'init'
      canvas: OffscreenCanvas
      width: number
      height: number
      dpr: number
      colors: HelixColors
      tier: Tier
      phone: boolean
      intro: boolean
      /** ms from now during which the particles stay scattered (the loading screen is still up) */
      holdMs: number
    }
  | {
      type: 'init-pillars'
      canvas: OffscreenCanvas
      width: number
      height: number
      dpr: number
      colors: HelixColors & { tan: string }
      tier: Tier
      phone: boolean
    }
  | { type: 'resize'; width: number; height: number; dpr: number }
  | { type: 'pointer'; x: number; y: number; inside: boolean }
  | { type: 'drag'; dx: number; dy: number }
  | { type: 'leave' | 'dragEnd' | 'pulse' | 'skip' | 'dispose' }
  | { type: 'active'; active: boolean }
  // the pillars scene only
  | { type: 'jump'; index: number }
  | { type: 'held' | 'frozen'; on: boolean }

export type FromWorker = { type: 'frame' } | { type: 'fail' } | { type: 'pillar'; index: number }

const ctx = self as unknown as DedicatedWorkerGlobalScope
const post = (m: FromWorker) => ctx.postMessage(m)
let scene: HelixScene | null = null
let pillars: PillarScene | null = null

const watchContext = (canvas: OffscreenCanvas) =>
  canvas.addEventListener('webglcontextlost', (ev) => {
    ev.preventDefault()
    post({ type: 'fail' })
  })

ctx.onmessage = (e: MessageEvent<ToWorker>) => {
  const m = e.data
  if (m.type === 'init') {
    try {
      watchContext(m.canvas)
      scene = new HelixScene({
        canvas: m.canvas,
        width: m.width,
        height: m.height,
        dpr: m.dpr,
        colors: m.colors,
        tier: m.tier,
        phone: m.phone,
        intro: m.intro,
        holdUntil: m.intro ? performance.now() + m.holdMs : 0,
        onLock: () => {},
        onFirstFrame: () => post({ type: 'frame' }),
      })
    } catch {
      post({ type: 'fail' })
    }
    return
  }
  if (m.type === 'init-pillars') {
    try {
      watchContext(m.canvas)
      pillars = new PillarScene({
        canvas: m.canvas,
        width: m.width,
        height: m.height,
        dpr: m.dpr,
        colors: m.colors,
        tier: m.tier,
        phone: m.phone,
        onActive: (index) => post({ type: 'pillar', index }),
        onFirstFrame: () => post({ type: 'frame' }),
      })
    } catch {
      post({ type: 'fail' })
    }
    return
  }
  if (pillars) {
    switch (m.type) {
      case 'resize':
        pillars.resize(m.width, m.height, m.dpr)
        break
      case 'active':
        pillars.setActive(m.active)
        break
      case 'jump':
        pillars.jump(m.index)
        break
      case 'held':
        pillars.setHeld(m.on)
        break
      case 'frozen':
        pillars.setFrozen(m.on)
        break
      case 'dispose':
        pillars.dispose()
        pillars = null
        ctx.close()
        break
    }
    return
  }
  if (!scene) return
  switch (m.type) {
    case 'resize':
      scene.resize(m.width, m.height, m.dpr)
      break
    case 'pointer':
      scene.pointerMove(m.x, m.y, m.inside)
      break
    case 'leave':
      scene.pointerLeave()
      break
    case 'drag':
      scene.drag(m.dx, m.dy)
      break
    case 'dragEnd':
      scene.dragEnd()
      break
    case 'pulse':
      scene.pulseStrand()
      break
    case 'skip':
      scene.skip()
      break
    case 'active':
      scene.setActive(m.active)
      break
    case 'dispose':
      scene.dispose()
      scene = null
      ctx.close()
      break
  }
}
