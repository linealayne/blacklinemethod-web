/**
 * Client-side motion flags. The inline script in app/layout.tsx sets these
 * classes on <html> before first paint so every component (and CSS) can
 * make the same decision synchronously, with no hydration mismatch.
 *
 *   bl-reduced    prefers-reduced-motion: reduce
 *   bl-motion     motion allowed (the inverse of bl-reduced)
 *   bl-nowebgl    the WebGL API is absent (a real context probe runs later, lazily)
 *   bl-no-loader  returning visitor this session, reduced motion, or a touch / under-1024px device (the loader is desktop-only)
 *   bl-desktop    fine pointer and 1024px or wider (loader and masked hero reveal)
 *   bl-hydrated   added by MotionProvider once React has taken over
 */
export interface MotionFlags {
  reduced: boolean
  webgl: boolean
  loaderDone: boolean
}

export function motionFlags(): MotionFlags {
  if (typeof document === 'undefined') {
    return { reduced: false, webgl: false, loaderDone: false }
  }
  const c = document.documentElement.classList
  const reduced = c.contains('bl-reduced')
  return {
    reduced,
    webgl: !c.contains('bl-nowebgl') && !reduced,
    loaderDone: reduced || c.contains('bl-no-loader') || c.contains('bl-loader-done'),
  }
}

/** The inline script source. Kept here so layout.tsx and tests share it. */
export const FLAGS_SCRIPT = `(function(){try{var h=document.documentElement,c=h.classList;var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;c.add(r?'bl-reduced':'bl-motion');var g=!!(window.WebGL2RenderingContext||window.WebGLRenderingContext);if(!g)c.add('bl-nowebgl');var v=false;try{v=!!window.sessionStorage.getItem('bl-visited')}catch(e){}var m=window.matchMedia('(pointer: coarse)').matches||window.innerWidth<1024;if(!m)c.add('bl-desktop');if(v||r||m)c.add('bl-no-loader')}catch(e){}})();`
