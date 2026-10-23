'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { useMotion } from '@/components/motion/MotionProvider'
import { motionFlags } from '@/lib/flags'
import { isFinePointer, isPhone } from '@/lib/motion'
import { useFirstInteraction } from '@/lib/useFirstInteraction'
import { useGsapEffect } from '@/lib/useGsap'
import type { HeroHandles } from '@/components/three/HeroField'
import { supportsWebGL } from '@/components/three/webgl'

const HeroField = dynamic(() => import('@/components/three/HeroField'), { ssr: false })

/** Hero reveal choreography (seconds) */
const HERO = {
  lineDuration: 1.3,
  lineStagger: 0.1,
  subOverlap: 0.75, // how early the sub elements start before the lines finish
  fadeStart: 0.3, // scroll progress where the copy starts to fade
}

/**
 * The headline is never hidden before paint: it is the page's largest text
 * and paints in the metric-matched fallback at first paint, then swaps to
 * Fraunces. The masked line reveal only runs when the loader runs (desktop
 * first visit, under the overlay). Everywhere else the subhead and button
 * simply rise in sequence through the CSS reveal.
 */
export function HeroSection() {
  const { mounted, reduced, webgl, loaderDone } = useMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const playRef = useRef<(() => void) | null>(null)
  const loaderDoneRef = useRef(false)
  const handles = useRef<HeroHandles>({
    pointer: { x: 0, y: 0, active: 0 },
    scroll: { value: 0 },
  }).current

  const [show3d, setShow3d] = useState(false)
  const [active, setActive] = useState(true)
  const [phone, setPhone] = useState(false)

  // Lazy-load WebGL once the loader is done and the visitor has moved, scrolled,
  // or touched (or after a quiet while). Text renders first, always.
  const go = useFirstInteraction(mounted && !reduced && webgl && loaderDone)
  useEffect(() => {
    if (!go) return
    if (!supportsWebGL()) return
    setPhone(isPhone())
    setShow3d(true)
    // warm the orbit chunk too: three is shared, the rest is small
    import('@/components/three/OrbitScene').catch(() => {})
  }, [go])

  // Pause rendering when the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || !show3d) return
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
  }, [show3d])

  // Pointer (desktop) or device tilt (phones) feeds the particle push.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || !show3d) return
    const p = handles.pointer
    if (isFinePointer()) {
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        p.x = ((e.clientX - r.left) / r.width) * 2 - 1
        p.y = -(((e.clientY - r.top) / r.height) * 2 - 1)
        p.active = 1
      }
      const onLeave = () => {
        p.active = 0
      }
      el.addEventListener('pointermove', onMove, { passive: true })
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    }
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      p.x = Math.max(-1, Math.min(1, e.gamma / 25)) * 0.6
      p.y = Math.max(-1, Math.min(1, (e.beta - 40) / 25)) * 0.6
      p.active = 0.7
    }
    window.addEventListener('deviceorientation', onTilt)
    return () => window.removeEventListener('deviceorientation', onTilt)
  }, [show3d, handles])

  // Sub elements: the CSS reveal handles the rise; we only decide when.
  // No loader (phones, tablets, returning visitors): right away.
  // Loader running: once the headline lines have mostly arrived (see below).
  useEffect(() => {
    if (!mounted) return
    const flags = motionFlags()
    if (flags.reduced || flags.loaderDone) revealSubs(contentRef.current)
  }, [mounted])

  // Desktop first visit: masked line reveal under the loader, then the subs.
  useGsapEffect(
    async ({ gsap, ScrollTrigger, loadSplitText }) => {
      const h1 = h1Ref.current
      const content = contentRef.current
      const section = sectionRef.current
      if (!h1 || !content || !section) return
      const flags = motionFlags()
      if (flags.reduced) return

      const ctx = gsap.context(() => {
        // Scrolling past the hero: copy drifts up and fades; the field loosens.
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            handles.scroll.value = self.progress
            const f = gsap.utils.clamp(0, 1, (self.progress - HERO.fadeStart) / (0.95 - HERO.fadeStart))
            gsap.set(content, { yPercent: -10 * self.progress, opacity: 1 - f })
          },
        })
      }, section)

      if (flags.loaderDone) return () => ctx.revert()

      // Loader is up: split now, reveal when it hands off.
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
      return () => {
        split.revert()
        ctx.revert()
      }
    },
    [mounted],
    { immediate: typeof window !== 'undefined' && !motionFlags().loaderDone }
  )

  useEffect(() => {
    loaderDoneRef.current = loaderDone
    if (loaderDone) playRef.current?.()
  }, [loaderDone])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] bg-black flex items-center justify-center overflow-hidden"
      aria-label="Introduction"
    >
      {/* Particle field (decorative, lazy) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {show3d && <HeroField handles={handles} start={loaderDone} active={active} phone={phone} />}
      </div>
      {/* Soft darkening behind the words so the headline always reads */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 54% at 50% 56%, rgba(10,10,10,0.62) 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0) 74%)',
        }}
      />

      <div ref={contentRef} className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-16 pb-10">
        <h1
          ref={h1Ref}
          className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.75rem,7vw,7rem)]"
        >
          run your own biology.
        </h1>

        <p data-hero-sub data-reveal="" className="mt-8 bl-label" style={{ '--bl-rise': '18px' } as React.CSSProperties}>
          Dallas, Texas&nbsp;&nbsp;·&nbsp;&nbsp;By appointment
        </p>

        <p
          data-hero-sub
          data-reveal=""
          className="mt-6 font-serif italic text-body-dim text-base md:text-lg tracking-wide max-w-md mx-auto"
          style={{ '--bl-rise': '18px', '--bl-delay': '0.1s' } as React.CSSProperties}
        >
          a private optimization practice built around one person at a time. hormones, training,
          nutrition, and the way you live.
        </p>

        <div data-hero-sub data-reveal="" className="mt-12" style={{ '--bl-rise': '18px', '--bl-delay': '0.2s' } as React.CSSProperties}>
          <Button asChild size="lg" glow>
            <Link href="/contact">request a consult</Link>
          </Button>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
        data-hero-sub
        data-reveal=""
        style={{ '--bl-rise': '0px', '--bl-delay': '0.5s' } as React.CSSProperties}
      >
        <div className="w-px h-14 bg-gradient-to-b from-offwhite/0 to-offwhite/25 mx-auto" />
      </div>
    </section>
  )
}

function revealSubs(root: HTMLElement | null) {
  if (!root) return
  const section = root.closest('section') ?? root
  section.querySelectorAll('[data-hero-sub]').forEach((el) => el.classList.add('bl-in'))
}
