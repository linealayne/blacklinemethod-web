'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useMotion } from '@/components/motion/MotionProvider'
import { MethodDiagram } from '@/components/MethodDiagram'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { gsap, useGSAP } from '@/lib/gsap'
import { motionFlags } from '@/lib/flags'
import { ORBIT, ORBIT_PULLBACK, type OrbitHandles } from '@/components/three/orbit-config'
import { useFirstInteraction } from '@/lib/useFirstInteraction'
import { supportsWebGL } from '@/components/three/webgl'

const OrbitScene = dynamic(() => import('@/components/three/OrbitScene'), { ssr: false })

export const PILLARS = [
  {
    id: 'hormones',
    label: 'Hormones',
    description:
      'Endocrine function sets the ceiling on everything else. We read panels in full context — markers, ratios, trends — and design protocols around how your system actually operates.',
  },
  {
    id: 'training',
    label: 'Training',
    description:
      'A program is a stimulus. What the body does with it depends on the system underneath. Training is built from first principles — biomechanics, progressive overload, measured intensity — against your biology.',
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    description:
      'Nutrition is the substrate the system runs on. We design approaches that support the actual demands of your protocol — not generic guidelines applied to a generic body.',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    description:
      'Sleep, stress, recovery, and the structure of how you live are not soft variables. They govern whether effort converts to adaptation. We build around how you actually live.',
  },
]

/** Pinned orbit choreography */
const METHOD = {
  pinDesktop: '+=320%',
  pinPhone: '+=340%',
  scrub: 0.7,
  phonePinStart: 'center center', // the orbit block sits centred in the viewport while pinned
}

export function MethodSection() {
  const { mounted, reduced, webgl } = useMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const stageWrap = useRef<HTMLDivElement>(null)
  const canvasWrap = useRef<HTMLDivElement>(null)
  const handles = useRef<OrbitHandles>({ progress: { value: 0 } }).current
  const [active, setActive] = useState(true)
  const [phone, setPhone] = useState(false)
  const [show3d, setShow3d] = useState(false)
  const [gl, setGl] = useState<boolean | null>(null)
  const isStatic = mounted && (reduced || !webgl || gl === false)
  const go = useFirstInteraction(mounted && !isStatic)

  // Real WebGL probe, deferred off the critical path
  useEffect(() => {
    if (go && gl === null) setGl(supportsWebGL())
  }, [go, gl])

  useEffect(() => {
    if (!mounted || isStatic) return
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setPhone(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    const el = canvasWrap.current
    if (!el) return () => mq.removeEventListener('change', sync)
    // Load the orbit only when the section is near
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow3d(true)
          io.disconnect()
        }
      },
      { rootMargin: '900px 0px' }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      mq.removeEventListener('change', sync)
    }
  }, [mounted, isStatic])

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

  useGSAP(
    () => {
      const section = sectionRef.current
      const stage = stageWrap.current
      if (!section || !stage || !go || gl !== true) return
      const flags = motionFlags()
      if (flags.reduced || !flags.webgl) return

      const pillars = gsap.utils.toArray<HTMLElement>('[data-pillar]', section)
      const whole = section.querySelector<HTMLElement>('[data-whole]')
      const cta = section.querySelector<HTMLElement>('[data-cta]')

      const mm = gsap.matchMedia()
      mm.add(
        { desktop: '(min-width: 768px)', phone: '(max-width: 767px)' },
        (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean }
          gsap.set(pillars, { opacity: 0, y: 20 })
          gsap.set(whole, { opacity: 0, y: 20 })
          gsap.set(cta, { autoAlpha: 0, y: 12 })

          const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            scrollTrigger: {
              trigger: desktop ? section : stage,
              pin: desktop ? section : stage,
              start: desktop ? 'top top' : METHOD.phonePinStart,
              end: desktop ? METHOD.pinDesktop : METHOD.pinPhone,
              scrub: METHOD.scrub,
              anticipatePin: 1,
              onUpdate: (self) => {
                handles.progress.value = self.progress
              },
            },
          })

          // Timeline time is normalised to 1 so positions equal scroll progress.
          const w = ORBIT.windowSize
          const inDur = w * 0.18
          const outDur = w * 0.14
          pillars.forEach((p, i) => {
            const start = ORBIT.intro + i * w + w * 0.1
            tl.to(p, { opacity: 1, y: 0, duration: inDur }, start)
            tl.to(p, { opacity: 0, y: -16, duration: outDur }, start + w - outDur - w * 0.08)
          })
          tl.to(whole, { opacity: 1, y: 0, duration: 0.07 }, ORBIT_PULLBACK + 0.02)
          tl.to(cta, { autoAlpha: 1, y: 0, duration: 0.05 }, ORBIT_PULLBACK + 0.09)
          tl.to({}, { duration: 0.01 }, 0.99)
        }
      )
      return () => mm.revert()
    },
    { scope: sectionRef, dependencies: [isStatic, go, gl], revertOnUpdate: true }
  )

  const bodyClass = 'font-sans text-sm md:text-[15px] text-body leading-relaxed tracking-wide max-w-md'

  return (
    <section
      ref={sectionRef}
      className={['bg-black border-t border-hairline', isStatic ? '' : 'bl-pinned md:min-h-[100svh] md:flex md:items-center'].join(' ')}
      aria-label="The Method"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full py-20 md:py-20">
        <div className="md:grid md:grid-cols-2 md:gap-x-20 md:items-center">
          {/* Heading: scrolls normally on phones, left column on desktop */}
          <div className="md:col-start-1 md:row-start-1">
            <Reveal as="p" className="bl-label mb-8">
              the method
            </Reveal>
            <SplitReveal
              as="h2"
              className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.5rem,4.8vw,5rem)]"
            >
              four pillars. one system.
            </SplitReveal>
            <Reveal as="p" delay={0.2} className={`mt-8 ${bodyClass}`}>
              Hormones, training, nutrition, and lifestyle are not separate services. They are one
              circular system. The Blackline Method works across all four simultaneously.
            </Reveal>
          </div>

          {/* On phones this block is what gets pinned; on desktop it dissolves into the grid */}
          <div ref={stageWrap} className="mt-10 md:mt-0 md:contents">
            <div className="md:col-start-2 md:row-start-1 md:row-span-2">
              <div
                ref={canvasWrap}
                aria-hidden={isStatic ? undefined : true}
                className="relative mx-auto aspect-square w-full max-w-[250px] sm:max-w-[320px] md:max-w-[520px]"
              >
                {isStatic ? (
                  <MethodDiagram className="w-full h-auto opacity-80" />
                ) : (
                  show3d && gl === true && <OrbitScene handles={handles} mode="scrub" active={active} phone={phone} />
                )}
              </div>
            </div>

            <div className="mt-8 md:mt-10 md:col-start-1 md:row-start-2">
              {isStatic ? (
                <div className="space-y-9">
                  {PILLARS.map((pillar) => (
                    <div key={pillar.id}>
                      <p className="bl-label bl-label-amber mb-3">{pillar.label}</p>
                      <p className={bodyClass}>{pillar.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-[9.5rem] md:min-h-[8.5rem]">
                  {PILLARS.map((pillar) => (
                    <div key={pillar.id} data-pillar className="[grid-area:1/1]">
                      <p className="bl-label bl-label-amber mb-3">{pillar.label}</p>
                      <p className={bodyClass}>{pillar.description}</p>
                    </div>
                  ))}
                  <div data-whole className="[grid-area:1/1]">
                    <p className="bl-label bl-label-amber mb-3">One system</p>
                    <p className={bodyClass}>
                      Adjusting one without understanding the others produces incomplete results. The
                      four are read together, around you.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-10 md:mt-12" data-cta>
                <Link
                  href="/method"
                  className="group inline-flex items-center gap-3 min-h-[44px] font-sans text-[11px] tracking-[0.2em] uppercase text-amber-muted transition-colors duration-600 hover:text-amber"
                >
                  <span className="bl-underline">Explore the full method</span>
                  <span aria-hidden="true" className="transition-transform duration-600 ease-lux group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
