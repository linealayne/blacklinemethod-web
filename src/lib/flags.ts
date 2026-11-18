/**
 * Client-side motion flags. The inline script in app/layout.tsx sets these
 * classes on <html> before first paint so every component (and CSS) can
 * make the same decision synchronously, with no hydration mismatch.
 *
 *   bl-reduced     prefers-reduced-motion: reduce
 *   bl-motion      motion allowed (the inverse of bl-reduced)
 *   bl-nowebgl     the WebGL API is absent (a real context probe runs later and may add it)
 *   bl-intro       first homepage visit this session on a motion + WebGL client:
 *                  the hero intro plays and the header and hero copy wait for it
 *   bl-intro-done  added when the intro has resolved (or was skipped)
 *   bl-desktop     fine pointer and 1024px or wider
 *   bl-hydrated    added by MotionProvider once React has taken over
 */
export interface MotionFlags {
  reduced: boolean
  webgl: boolean
  /** true when no intro is pending (never played, finished, or skipped) */
  introDone: boolean
}

/** sessionStorage key: the intro has played once this session */
export const INTRO_KEY = 'bl-intro-seen'

export function motionFlags(): MotionFlags {
  if (typeof document === 'undefined') {
    return { reduced: false, webgl: false, introDone: true }
  }
  const c = document.documentElement.classList
  const reduced = c.contains('bl-reduced')
  return {
    reduced,
    webgl: !c.contains('bl-nowebgl') && !reduced,
    introDone: !c.contains('bl-intro') || c.contains('bl-intro-done'),
  }
}

/** Mark the intro finished: CSS resolves the header and the hero copy. */
export function finishIntro() {
  if (typeof document === 'undefined') return
  const c = document.documentElement.classList
  try {
    window.sessionStorage.setItem(INTRO_KEY, '1')
  } catch {}
  if (!c.contains('bl-intro') || c.contains('bl-intro-done')) return
  c.add('bl-intro-done')
  window.dispatchEvent(new Event('bl:intro-done'))
}

/** The inline script source. Kept here so layout.tsx and tests share it. */
export const FLAGS_SCRIPT = `(function(){try{var h=document.documentElement,c=h.classList;var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;c.add(r?'bl-reduced':'bl-motion');var g=!!(window.WebGL2RenderingContext||window.WebGLRenderingContext);if(!g)c.add('bl-nowebgl');var v=false;try{v=!!window.sessionStorage.getItem('${INTRO_KEY}')}catch(e){}var m=window.matchMedia('(pointer: coarse)').matches||window.innerWidth<1024;if(!m)c.add('bl-desktop');if(!v&&!r&&g&&location.pathname==='/')c.add('bl-intro')}catch(e){}})();`
