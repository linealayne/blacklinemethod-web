import gsap from 'gsap'

/**
 * GSAP core. Never imported statically from the page or layout bundles:
 * components load it with `import('@/lib/gsap')` (see useGsapEffect) after
 * hydration. There is no ScrollTrigger on this site: nothing is tied to
 * scroll position (see CLAUDE.md, "No scroll animation").
 */
if (typeof window !== 'undefined') {
  gsap.defaults({ ease: 'power3.out', duration: 1 })
}

export async function loadDraggable() {
  const { Draggable } = await import('gsap/Draggable')
  gsap.registerPlugin(Draggable)
  return Draggable
}

export { gsap }
export type GsapModule = typeof import('./gsap')
