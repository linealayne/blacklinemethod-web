/**
 * Motion tokens. Slow, precise, never bouncy.
 * Every tuning knob for the site's motion lives here or in the
 * component-level CONFIG objects (see CLAUDE.md).
 */
export const EASE = {
  reveal: 'expo.out', // masked line reveals
  rise: 'power3.out', // body fade-and-rise
  scrub: 'none', // scroll-scrubbed timelines
  ui: 'power2.out', // hover and press
  veil: 'power2.inOut', // route transition
} as const

export const DUR = {
  line: 1.1, // seconds per headline line
  lineStagger: 0.09,
  rise: 0.9,
  riseStagger: 0.08,
  veilIn: 0.22,
  veilOut: 0.3,
  loader: 1.15, // total loader time, under 1.5s
} as const

export const REVEAL_START = 'top 86%'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isFinePointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function isPhone(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}
