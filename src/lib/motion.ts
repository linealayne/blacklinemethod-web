/**
 * Motion tokens. Precise, never bouncy, never tied to scroll position.
 * The only scroll-related motion on the site is a one-time fade and rise
 * (under 600ms) when an element first enters view.
 */
export const DUR = {
  rise: 0.5, // seconds, the one-time entrance (see globals.css, "Entrances")
  veilIn: 0.22,
  veilOut: 0.3,
} as const

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isFinePointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/** Fine pointer and 1024px or wider. */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false
  return document.documentElement.classList.contains('bl-desktop')
}

export function isPhone(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}
