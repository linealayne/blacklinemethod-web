/**
 * Client-side motion flags. The inline script in app/layout.tsx sets these
 * classes on <html> before first paint so every component (and CSS) can
 * make the same decision synchronously, with no hydration mismatch.
 *
 *   bl-reduced     prefers-reduced-motion: reduce
 *   bl-motion      motion allowed (the inverse of bl-reduced)
 *   bl-nowebgl     the WebGL API is absent (a real context probe runs later and may add it)
 *   bl-desktop     fine pointer and 1024px or wider
 *   bl-intro       every full page load (not in-site navigation), motion allowed: the loading
 *                  sequence plays (globals.css, "The loading sequence")
 *   bl-intro-b     the handoff: the wordmark slides to the header, the dark
 *                  screen lifts, the hero copy and the gene come in
 *   bl-intro-done  the sequence has finished or was skipped
 *   bl-fade        every full page load with reduced motion: one fade
 *   bl-hydrated    added by MotionProvider once React has taken over
 */
export interface MotionFlags {
  reduced: boolean
  webgl: boolean
  /** true when no intro is pending (never played, finished, or skipped) */
  introDone: boolean
}

/**
 * The loading sequence, in milliseconds from the first paint. The CSS delays
 * in globals.css ("The loading sequence") are written against these numbers;
 * change them together.
 */
export const INTRO = {
  handoffMs: 1610, // typing and the loading line are complete: the wordmark starts to slide
  geneMs: 2030, // the dark screen starts to lift: the gene begins to form
  totalMs: 4200, // everything is in its final state
}

declare global {
  interface Window {
    /** performance.now() when the loading sequence started (set by the flags script) */
    __blIntroT0?: number
  }
}

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

/** True while the loading sequence is on screen. */
export function introPlaying() {
  if (typeof document === 'undefined') return false
  const c = document.documentElement.classList
  return c.contains('bl-intro') && !c.contains('bl-intro-done')
}

/**
 * The inline script source. It runs on every full page load (a refresh
 * included) and never on in-site navigation, which keeps the document.
 * Besides the flags it runs the whole loading
 * sequence clock, so the sequence works (and can be skipped) before React
 * hydrates: any click, key, wheel, touch, or scroll jumps to the final state.
 * Events: `bl:intro-skip` (a person skipped), `bl:intro-done` (always).
 */
export const FLAGS_SCRIPT = `(function(){try{var w=window,h=document.documentElement,c=h.classList;var r=w.matchMedia('(prefers-reduced-motion: reduce)').matches;c.add(r?'bl-reduced':'bl-motion');if(!(w.WebGL2RenderingContext||w.WebGLRenderingContext))c.add('bl-nowebgl');if(!(w.matchMedia('(pointer: coarse)').matches||w.innerWidth<1024))c.add('bl-desktop');if(r){c.add('bl-fade');return}c.add('bl-intro');w.__blIntroT0=performance.now();var ev=['pointerdown','keydown','wheel','touchstart','scroll'],o={passive:true,capture:true},t1,t2;var fin=function(s){if(c.contains('bl-intro-done'))return;clearTimeout(t1);clearTimeout(t2);c.add('bl-intro-b');c.add('bl-intro-done');ev.forEach(function(e){w.removeEventListener(e,sk,o)});if(s)w.dispatchEvent(new Event('bl:intro-skip'));w.dispatchEvent(new Event('bl:intro-done'))};var sk=function(){fin(true)};ev.forEach(function(e){w.addEventListener(e,sk,o)});t1=setTimeout(function(){c.add('bl-intro-b')},${INTRO.handoffMs});t2=setTimeout(function(){fin(false)},${INTRO.totalMs})}catch(e){}})();`
