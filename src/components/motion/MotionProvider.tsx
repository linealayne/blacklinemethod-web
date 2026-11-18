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
  /** no hero intro pending */
  introDone: boolean
}

const DEFAULT: MotionState = {
  mounted: false,
  reduced: false,
  webgl: false,
  introDone: true,
}

const MotionContext = createContext<MotionState>(DEFAULT)

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function MotionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MotionState>(DEFAULT)

  useIsoLayoutEffect(() => {
    const flags = motionFlags()
    document.documentElement.classList.add('bl-hydrated')
    setState({ mounted: true, ...flags })

    const onIntroDone = () => setState((s) => ({ ...s, introDone: true }))
    window.addEventListener('bl:intro-done', onIntroDone)
    return () => window.removeEventListener('bl:intro-done', onIntroDone)
  }, [])

  return <MotionContext.Provider value={state}>{children}</MotionContext.Provider>
}

export function useMotion(): MotionState {
  return useContext(MotionContext)
}
