'use client'

import { useCallback, useLayoutEffect, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useMotion } from '@/components/motion/MotionProvider'
import { introPlaying } from '@/lib/flags'
import { supportsWebGL } from '@/components/three/webgl'

const HeroHelix = dynamic(() => import('@/components/hero/HeroHelix'), { ssr: false })

const HEADLINE = ['run', 'your', 'own', 'biology.']

/**
 * The living sequence. A three.js double helix (HeroHelix) fills the hero
 * behind and beside the type. The composition is two things only: the
 * headline, lower left, and one quiet line beneath a hairline (the place,
 * and the practice in a sentence). The consult button lives in the header.
 *
 * On every full page load the loading sequence (globals.css, "The
 * loading sequence") hands over to this section: the headline rises word by
 * word and the gene forms from scattered particles. Reduced motion and no
 * WebGL get the static rendered still (.bl-helix-still).
 */
export function HeroSection() {
  const { mounted, reduced, webgl } = useMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const [intro, setIntro] = useState(false)
  const [failed, setFailed] = useState(false)
  const [showScene, setShowScene] = useState(false)

  // decided before paint: is the loading sequence running right now?
  useLayoutEffect(() => {
    setIntro(introPlaying())
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (reduced || !webgl || !supportsWebGL()) {
      if (!reduced && webgl) setFailed(true)
      return
    }
    setShowScene(true)
  }, [mounted, reduced, webgl])

  const onFail = useCallback(() => {
    setFailed(true)
    setShowScene(false)
  }, [])

  const i = (n: number) => ({ '--i': n }) as React.CSSProperties

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] bg-black flex flex-col overflow-hidden touch-pan-y"
      aria-label="Introduction"
    >
      {/* The scene (decorative) */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className={`bl-helix-still absolute inset-0 ${failed ? 'is-on' : ''}`} />
        {showScene && !failed && <HeroHelix hostRef={sectionRef} intro={intro} onFail={onFail} />}
        {/* soft vignettes keep the type fully legible over the scene */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_18%_88%,rgb(var(--bl-black-rgb)/0.92)_0%,rgb(var(--bl-black-rgb)/0.6)_45%,transparent_75%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      <div className="relative z-10 bl-wrap flex-1 flex flex-col justify-end pt-[calc(var(--bl-header)+4rem)] pb-12 md:pb-16 pointer-events-none">
        <h1 data-hero-h1="" className="bl-display max-w-[13ch] md:max-w-[9.5ch] lg:max-w-[10ch]">
          {HEADLINE.map((word, n) => (
            <span key={word}>
              <span data-hero-word="">
                <span style={i(n)}>{word}</span>
              </span>
              {n < HEADLINE.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>

        {/* One line beneath the headline: where, and what. The label hangs
            under the headline's left edge; the sentence sits on the right,
            under the gene, both on the same first baseline. */}
        <div className="mt-10 md:mt-14">
          <span data-intro="rule" className="block h-px w-full bg-offwhite/15" aria-hidden="true" />
          <div className="pt-6 md:pt-8 grid gap-4 md:grid-cols-12 md:gap-x-8 md:items-baseline">
            <p data-intro="copy" style={i(0)} className="bl-label md:col-span-5">
              Dallas, Texas&nbsp;&nbsp;·&nbsp;&nbsp;By appointment
            </p>
            <p
              data-intro="copy"
              style={i(1)}
              className="bl-lead text-offwhite/80 max-w-[34rem] md:col-span-7 lg:col-start-7 lg:col-span-6 xl:col-start-8 xl:col-span-5"
            >
              A private optimization practice built around one person at a time. Hormones, training,
              nutrition, and the way you live.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
