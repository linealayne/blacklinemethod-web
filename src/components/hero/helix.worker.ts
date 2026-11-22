/// <reference lib="webworker" />
import { HelixScene, type HelixColors, type Tier } from './HelixScene'

/**
 * The hero scene, off the main thread. HeroHelix.tsx hands this worker the
 * canvas (transferControlToOffscreen) and then only sends it small messages:
 * size, pointer position, taps, visibility. three.js is evaluated here, the
 * shaders compile here, and every frame is drawn here, so the page stays
 * responsive while the gene forms, however slow the device.
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
  | { type: 'resize'; width: number; height: number; dpr: number }
  | { type: 'pointer'; x: number; y: number; inside: boolean }
  | { type: 'drag'; dx: number; dy: number }
  | { type: 'leave' | 'dragEnd' | 'pulse' | 'skip' | 'dispose' }
  | { type: 'active'; active: boolean }

export type FromWorker = { type: 'frame' } | { type: 'fail' }

const ctx = self as unknown as DedicatedWorkerGlobalScope
const post = (m: FromWorker) => ctx.postMessage(m)
let scene: HelixScene | null = null

ctx.onmessage = (e: MessageEvent<ToWorker>) => {
  const m = e.data
  if (m.type === 'init') {
    try {
      m.canvas.addEventListener('webglcontextlost', (ev) => {
        ev.preventDefault()
        post({ type: 'fail' })
      })
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
