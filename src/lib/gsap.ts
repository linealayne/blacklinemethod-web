import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * GSAP core + ScrollTrigger. This module is never imported statically from
 * the page or layout bundles: components load it with `import('@/lib/gsap')`
 * (see useGsapEffect) after hydration, so nothing here blocks first paint.
 * Plugins that only one component needs load through the helpers below.
 */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  gsap.defaults({ ease: 'power3.out', duration: 1 })
  ScrollTrigger.config({ ignoreMobileResize: true })
  ;(window as Window & { __ScrollTrigger?: typeof ScrollTrigger }).__ScrollTrigger = ScrollTrigger
}

export async function loadSplitText() {
  const { SplitText } = await import('gsap/SplitText')
  gsap.registerPlugin(SplitText)
  return SplitText
}

export async function loadDraggable() {
  const { Draggable } = await import('gsap/Draggable')
  gsap.registerPlugin(Draggable)
  return Draggable
}

export { gsap, ScrollTrigger }
export type GsapModule = typeof import('./gsap')
