/**
 * Orbit tuning knobs, kept free of three.js imports so DOM components can
 * share the choreography windows without pulling WebGL into their bundle.
 */
export const ORBIT = {
  radius: 1.8,
  tilt: 0.62, // radians about X; 0 = edge-on, PI/2 = full circle
  tiltEnd: 0.95,
  camZ: 7.2,
  camZEnd: 9.2,
  phoneCamOffset: 1.6, // extra camera distance on phones so labels fit the small canvas
  intro: 0.08, // share of progress spent settling in
  windowSize: 0.19, // share of progress per pillar
  rotateShare: 0.3, // share of each window spent rotating (rest holds)
  nodeRadius: 0.05,
  ringOpacity: 0.6,
  haloScale: 1.38,
  haloOpacity: 0.12,
  idleSpeed: 0.16, // radians per second in idle mode
  smoothing: 7, // progress damping; higher = tighter to scroll
  colors: { amber: '#C8965A', gold: '#E2C48F', dim: '#8C8A84' },
}

export const PILLAR_LABELS = ['Hormones', 'Training', 'Nutrition', 'Lifestyle'] as const

export const ORBIT_PULLBACK = ORBIT.intro + ORBIT.windowSize * PILLAR_LABELS.length

/** Which pillar is in front for a given progress: -1 intro, 0..3, 4 = whole system */
export function activeIndexFor(p: number): number {
  if (p < ORBIT.intro) return -1
  if (p >= ORBIT_PULLBACK) return 4
  return Math.min(3, Math.floor((p - ORBIT.intro) / ORBIT.windowSize))
}

export interface OrbitHandles {
  progress: { value: number }
}
