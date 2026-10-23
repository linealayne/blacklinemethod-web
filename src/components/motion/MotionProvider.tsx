'use client'

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'
import { motionFlags } from '@/lib/flags'

export interface MotionState {
  /** false during SSR and the first client render */
  mounted: boolean
  reduced: boolean
  webgl: boolean
  loaderDone: boolean
}

const DEFAULT: MotionState = {
  mounted: false,
  reduced: false,
  webgl: false,
  loaderDone: false,
}

const MotionContext = createContext<MotionState>(DEFAULT)

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function MotionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MotionState>(DEFAULT)

  // Layout effect so it runs before paint, after every child's layout effect
  // (children effects fire first), which lets the CSS pre-hydration
  // hiding hand off to GSAP's inline styles without a flash.
  useIsoLayoutEffect(() => {
    const flags = motionFlags()
    document.documentElement.classList.add('bl-hydrated')
    setState({ mounted: true, ...flags })

    const onLoaderDone = () => setState((s) => ({ ...s, loaderDone: true }))
    window.addEventListener('bl:loader-done', onLoaderDone)
    return () => window.removeEventListener('bl:loader-done', onLoaderDone)
  }, [])

  return <MotionContext.Provider value={state}>{children}</MotionContext.Provider>
}

export function useMotion(): MotionState {
  return useContext(MotionContext)
}
