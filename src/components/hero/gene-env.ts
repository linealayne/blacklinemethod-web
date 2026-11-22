import { HELIX } from './helix-config'
import type { HelixColors, Tier } from './HelixScene'

/**
 * What every gene scene asks of the page before it starts: how strong the
 * device is, the palette, and whether the scene can run in a worker.
 * Shared by the hero (HeroHelix.tsx) and the pillars (PillarGene.tsx).
 */

export function pickTier(phone: boolean): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency || 4
  const mem = nav.deviceMemory ?? 8
  // phones always get a lighter gene (fewer particles)
  if (phone) return cores >= 8 && mem >= 6 ? 'mid' : 'low'
  if (mem < 4 || cores < 4) return 'low'
  return cores >= 8 && window.innerWidth >= 1280 ? 'high' : 'mid'
}

/** One palette token (globals.css, `--bl-<name>-rgb`) as a hex string. */
export function tokenHex(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--bl-${name}-rgb`).trim().split(/\s+/).map(Number)
  if (v.length !== 3 || v.some((n) => !Number.isFinite(n))) return fallback
  return `#${v.map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

/** The palette, from the CSS tokens in globals.css (helix-config holds fallbacks). */
export function readColors(): HelixColors & { tan: string } {
  return {
    amber: tokenHex('ember', HELIX.colors.amber),
    teal: tokenHex('teal', HELIX.colors.teal),
    violet: tokenHex('violet', HELIX.colors.violet),
    offwhite: tokenHex('offwhite', HELIX.colors.offwhite),
    tan: tokenHex('tan', '#D0AE82'),
  }
}

export const canUseWorker = () =>
  typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined' && 'transferControlToOffscreen' in HTMLCanvasElement.prototype
