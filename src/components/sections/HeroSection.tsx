'use client'

import { useCallback, useLayoutEffect, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { useMotion } from '@/components/motion/MotionProvider'
import { finishIntro, INTRO_KEY } from '@/lib/flags'
import { supportsWebGL } from '@/components/three/webgl'

const HeroHelix = dynamic(() => import('@/components/hero/HeroHelix'), { ssr: false })

/** Intro timing for the copy once the helix locks (seconds, CSS delays) */
const HERO_COPY = {
  wordmark: 0, // the header wordmark and nav
  headline: 0.15,
  label: 0.45,
  lead: 0.55,
  cta: 0.7,
}

/**
 * The living sequence. A three.js double helix (HeroHelix) fills the hero
 * behind and beside the type; the copy keeps the original composition:
 * headline lower left, the label, the lead and the consult button at the
 * right. On the first homepage visit of a session the page opens dark, the
 * particles converge into the helix, and the wordmark and copy resolve in as
 * it locks (globals.css, "Hero intro"). Reduced motion and no WebGL get the
 * static rendered still (.bl-helix-still).
 */
export function HeroSection() {
  const { mounted, reduced, webgl } = useMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const [intro, setIntro] = useState(false)
  const [failed, setFailed] = useState(false)
  const [showScene, setShowScene] = useState(false)

  // Client navigation back to the homepage: decide before paint whether the
  // intro plays (the inline flags script only runs on a full page load).
  useLayoutEffect(() => {
    const c = document.documentElement.classList
    if (c.contains('bl-intro')) {
      setIntro(!c.contains('bl-intro-done'))
      return
    }
    let seen = true
    try {
      seen = !!window.sessionStorage.getItem(INTRO_KEY)
    } catch {}
    if (!seen && c.contains('bl-motion') && !c.contains('bl-nowebgl')) {
      c.add('bl-intro')
      setIntro(true)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (reduced || !webgl || !supportsWebGL()) {
      if (!reduced && webgl) setFailed(true)
      finishIntro()
      return
    }
    setShowScene(true)
  }, [mounted, reduced, webgl])

  const onLock = useCallback(() => finishIntro(), [])
  const onFail = useCallback(() => {
    setFailed(true)
    setShowScene(false)
    finishIntro()
  }, [])

  const delay = (s: number) => ({ '--bl-intro-delay': `${s}s` }) as React.CSSProperties

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] bg-black flex flex-col overflow-hidden touch-pan-y"
      aria-label="Introduction"
    >
      {/* The scene (decorative) */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className={`bl-helix-still absolute inset-0 ${failed ? 'is-on' : ''}`} />
        {showScene && !failed && <HeroHelix hostRef={sectionRef} intro={intro} onLock={onLock} onFail={onFail} />}
        {/* soft vignettes keep the type fully legible over the scene */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_18%_88%,rgba(8,8,8,0.92)_0%,rgba(8,8,8,0.6)_45%,transparent_75%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      {/* Registration marks at the hero's inner corners */}
      <div className="pointer-events-none absolute inset-0 bl-wrap hidden md:block" aria-hidden="true" data-intro="" style={delay(0.9)}>
        <span className="bl-cross left-[calc(var(--bl-gutter)-4px)] top-[calc(var(--bl-header)+1.5rem)]" />
        <span className="bl-cross right-[calc(var(--bl-gutter)-4px)] top-[calc(var(--bl-header)+1.5rem)]" />
      </div>

      <div className="relative z-10 bl-wrap flex-1 flex flex-col justify-end pt-[calc(var(--bl-header)+4rem)] pb-12 md:pb-16 pointer-events-none">
        <h1 data-hero-h1="" data-intro="resolve" style={delay(HERO_COPY.headline)} className="bl-display max-w-[13ch] md:max-w-[9.5ch] lg:max-w-[10ch]">
          run your own biology.
        </h1>

        <div className="mt-10 md:mt-14 pt-7 md:pt-8 border-t border-offwhite/15 grid gap-7 md:grid-cols-12 md:gap-x-8 md:items-start">
          <p data-intro="" style={delay(HERO_COPY.label)} className="bl-label md:col-span-5 lg:col-span-4 md:pt-1.5">
            Dallas, Texas&nbsp;&nbsp;·&nbsp;&nbsp;By appointment
          </p>

          <div className="md:col-span-7 lg:col-start-7 lg:col-span-6 xl:col-start-8 xl:col-span-5">
            <p data-intro="" style={delay(HERO_COPY.lead)} className="bl-lead text-offwhite/80">
              A private optimization practice built around one person at a time. Hormones, training,
              nutrition, and the way you live.
            </p>

            <div data-intro="" style={delay(HERO_COPY.cta)} className="mt-8 pointer-events-auto">
              <Button asChild size="lg">
                <Link href="/contact">request a consult</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
