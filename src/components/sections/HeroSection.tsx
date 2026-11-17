'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { useMotion } from '@/components/motion/MotionProvider'
import { motionFlags } from '@/lib/flags'
import { isDesktop } from '@/lib/motion'
import { useGsapEffect } from '@/lib/useGsap'

const HeroLine = dynamic(() => import('@/components/hero/HeroLine'), { ssr: false })

/** Hero reveal choreography (seconds) */
const HERO = {
  lineDuration: 1.3,
  lineStagger: 0.1,
  subOverlap: 0.6, // how early the sub elements start before the headline lines finish
  fadeStart: 0.25, // scroll progress where the copy starts to fade
  drift: -14, // yPercent the copy drifts while the hero scrolls away (parallax against the line)
}

/** The static trace for reduced motion and no-JS: calm, level, with the band. */
const STATIC_TRACE = (() => {
  const pts: string[] = []
  for (let x = 0; x <= 1000; x += 10) {
    const y = 60 + Math.sin(x * 0.02) * 0.9 + Math.sin(x * 0.051) * 0.5
    pts.push(`${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(2)}`)
  }
  return pts.join(' ')
})()

/**
 * The headline sits on the line. On desktop the masked line reveal runs on
 * every visit, in step with the line drawing in (under the loader on the
 * first visit, straight after hydration on later ones). On phones the
 * headline paints at first paint (it is the LCP element) and the line draws
 * beneath it once the loader hands off.
 */
export function HeroSection() {
  const { mounted, reduced, loaderDone } = useMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<(() => void) | null>(null)
  const loaderDoneRef = useRef(false)

  const [showLine, setShowLine] = useState(false)
  const [active, setActive] = useState(true)

  // The line is the hero: load it straight after hydration (it is a few kB of 2D canvas).
  useEffect(() => {
    if (mounted && !reduced) setShowLine(true)
  }, [mounted, reduced])

  // Pause rendering when the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || !showLine) return
    let inView = true
    const update = () => setActive(inView && !document.hidden)
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        update()
      },
      { threshold: 0 }
    )
    io.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [showLine])

  // Phones, tablets, reduced motion: subs rise through the CSS reveal once the loader hands off.
  useEffect(() => {
    if (!mounted) return
    const flags = motionFlags()
    if (flags.reduced || (!isDesktop() && loaderDone)) revealSubs(contentRef.current)
  }, [mounted, loaderDone])

  // Returning desktop visitors: keep the headline hidden synchronously until
  // the split takes over (the pre-hydration CSS rule stops applying at hydration).
  useLayoutEffect(() => {
    const h1 = h1Ref.current
    if (!h1) return
    const flags = motionFlags()
    if (!flags.reduced && isDesktop() && flags.loaderDone) h1.style.opacity = '0'
  }, [])

  // Desktop: masked line reveal, then the subs. All clients: scroll parallax.
  useGsapEffect(
    async ({ gsap, ScrollTrigger, loadSplitText }) => {
      const h1 = h1Ref.current
      const content = contentRef.current
      const section = sectionRef.current
      if (!h1 || !content || !section) return
      const flags = motionFlags()
      if (flags.reduced) return

      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            const f = gsap.utils.clamp(0, 1, (self.progress - HERO.fadeStart) / (0.9 - HERO.fadeStart))
            gsap.set(content, { yPercent: HERO.drift * self.progress, opacity: 1 - f })
          },
        })
      }, section)

      if (!isDesktop()) return () => ctx.revert()

      const SplitText = await loadSplitText()
      if (document.fonts?.ready) await document.fonts.ready
      const split = SplitText.create(h1, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'bl-line',
        autoSplit: true,
        onSplit(self) {
          gsap.set(self.lines, { yPercent: 110 })
          const tl = gsap.timeline({ paused: true })
          tl.to(self.lines, {
            yPercent: 0,
            duration: HERO.lineDuration,
            ease: 'expo.out',
            stagger: HERO.lineStagger,
          })
          tl.call(() => revealSubs(content), [], `-=${HERO.subOverlap}`)
          playRef.current = () => tl.play()
          if (loaderDoneRef.current) tl.play()
          return tl
        },
      })
      gsap.set(h1, { opacity: 1 })
      return () => {
        split.revert()
        ctx.revert()
      }
    },
    [mounted],
    { immediate: typeof window !== 'undefined' && isDesktop() }
  )

  useEffect(() => {
    loaderDoneRef.current = loaderDone
    if (loaderDone) playRef.current?.()
  }, [loaderDone])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] bg-black flex flex-col overflow-hidden"
      aria-label="Introduction"
    >
      {/* The line (decorative, canvas) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {showLine && <HeroLine anchor={anchorRef} start={loaderDone} active={active} />}
      </div>

      <div
        ref={contentRef}
        className="relative z-10 bl-wrap flex-1 flex flex-col justify-center md:justify-end pt-[calc(var(--bl-header)+4rem)] pb-10 md:pb-14"
      >
        <h1 ref={h1Ref} data-hero-h1="" className="bl-display max-w-[11ch] -ml-[0.04em]">
          run your own biology.
        </h1>

        {/* The baseline the line rides on. Holds the static trace for reduced motion and no-JS. */}
        <div ref={anchorRef} className="relative h-[112px] md:h-[150px]" aria-hidden="true">
          <div className="bl-line-static absolute inset-y-0 left-1/2 w-screen -translate-x-1/2">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 120" preserveAspectRatio="none">
              <path d="M0 16 L1000 16 M0 104 L1000 104" stroke="#F2F1EC" strokeOpacity="0.09" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" fill="none" />
              <path d={STATIC_TRACE} stroke="#F2F1EC" strokeOpacity="0.9" strokeWidth="1.15" vectorEffect="non-scaling-stroke" fill="none" />
            </svg>
            <span className="absolute left-[78%] top-1/2 -ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full bg-amber shadow-[0_0_14px_3px_rgba(200,150,90,0.4)]" />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-12 md:gap-x-8 md:items-start">
          <p
            data-hero-sub
            data-reveal=""
            className="bl-label md:col-span-5 lg:col-span-4 md:pt-1.5"
            style={{ '--bl-rise': '14px' } as React.CSSProperties}
          >
            Dallas, Texas&nbsp;&nbsp;·&nbsp;&nbsp;By appointment
          </p>

          <div className="md:col-span-7 lg:col-start-7 lg:col-span-6 xl:col-start-8 xl:col-span-5">
            <p
              data-hero-sub
              data-reveal=""
              className="bl-lead text-body"
              style={{ '--bl-rise': '14px', '--bl-delay': '0.1s' } as React.CSSProperties}
            >
              a private optimization practice built around one person at a time. hormones, training,
              nutrition, and the way you live.
            </p>

            <div data-hero-sub data-reveal="" className="mt-9" style={{ '--bl-rise': '14px', '--bl-delay': '0.2s' } as React.CSSProperties}>
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

function revealSubs(root: HTMLElement | null) {
  if (!root) return
  const section = root.closest('section') ?? root
  section.querySelectorAll('[data-hero-sub]').forEach((el) => el.classList.add('bl-in'))
}
