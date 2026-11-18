'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useMotion } from '@/components/motion/MotionProvider'
import { Reveal } from '@/components/motion/Reveal'

export const TENETS = [
  {
    id: 'symptoms',
    index: '01',
    name: 'symptoms first.',
    description:
      'Bloodwork is read in context, against symptoms, history, and goals. Not against population reference ranges. A value in range is not the same as a value that is adequate for you.',
  },
  {
    id: 'individual',
    index: '02',
    name: 'optimal is individual.',
    description:
      'Standard primary care is structured for triage and disease management. It was never built to optimize. We operate in the space between "nothing is wrong" and "performing at the level you should."',
  },
  {
    id: 'system',
    index: '03',
    name: 'one system.',
    description:
      'Hormones, training, nutrition, and the structure of how you live are not separate domains. They are one system. Adjusting one without understanding the others produces incomplete results.',
  },
]

/** Sequence card knobs */
const CARDS = {
  scrambleMs: 720, // how long the title takes to decode
  scrambleDelayMs: 260, // decode starts as the card passes edge-on
  strands: ['ATGCGTACCTAG', 'GCTTAGCATGCA', 'TACGGATCCGTA'], // decorative base sequence per card
  fragments: [
    { freq: 1.5, phase: 0, rungs: 9 },
    { freq: 2.1, phase: 0.9, rungs: 12 },
    { freq: 2.8, phase: 1.7, rungs: 15 },
  ],
}

const BASES = 'ATGC'

/**
 * Letters cycle through A T G C and settle into the target, left to right.
 * Display only (aria-hidden); the real text is always in the DOM.
 */
function useScramble(target: string, run: boolean, delay = 0) {
  const [text, setText] = useState(target)
  useEffect(() => {
    if (!run) {
      setText(target)
      return
    }
    let raf = 0
    let start = 0
    const tick = (now: number) => {
      if (!start) start = now + delay
      const p = Math.max(0, (now - start) / CARDS.scrambleMs)
      const settled = Math.floor(p * target.length)
      let out = ''
      for (let i = 0; i < target.length; i++) {
        const ch = target[i]
        if (i < settled || ch === ' ' || ch === '.') out += ch
        else out += BASES[(Math.floor(now / 45) + i * 3) % 4]
      }
      setText(out)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setText(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, delay])
  return text
}

function HelixFragment({ freq, phase, rungs }: { freq: number; phase: number; rungs: number }) {
  const W = 300
  const H = 96
  const mid = H / 2
  const amp = 30
  const a: string[] = []
  const b: string[] = []
  for (let x = 0; x <= W; x += 4) {
    const t = (x / W) * Math.PI * 2 * freq + phase
    a.push(`${x === 0 ? 'M' : 'L'}${x} ${(mid + Math.sin(t) * amp).toFixed(2)}`)
    b.push(`${x === 0 ? 'M' : 'L'}${x} ${(mid - Math.sin(t) * amp).toFixed(2)}`)
  }
  const lines = Array.from({ length: rungs }, (_, i) => {
    const x = ((i + 0.5) / rungs) * W
    const t = (x / W) * Math.PI * 2 * freq + phase
    const y = Math.sin(t) * amp
    return { x, y1: mid + y, y2: mid - y }
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" fill="none" aria-hidden="true">
      {lines.map((l, i) => (
        <line key={i} x1={l.x} x2={l.x} y1={l.y1} y2={l.y2} stroke="#F2F1EC" strokeOpacity={i % 4 === 1 ? 0.5 : 0.16} strokeWidth="1" />
      ))}
      <path d={a.join(' ')} stroke="#F2F1EC" strokeOpacity="0.6" strokeWidth="1" />
      <path d={b.join(' ')} stroke="#C8965A" strokeOpacity="0.75" strokeWidth="1" />
    </svg>
  )
}

function SequenceCard({ tenet, i, isStatic }: { tenet: (typeof TENETS)[number]; i: number; isStatic: boolean }) {
  const [flipped, setFlipped] = useState(false)
  const pointerType = useRef<string>('mouse')
  const title = useScramble(tenet.name, flipped && !isStatic, CARDS.scrambleDelayMs)
  const strand = useScramble(CARDS.strands[i], flipped && !isStatic)
  const headingId = `tenet-${tenet.id}`

  const hoverCapable = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  return (
    <article
      tabIndex={isStatic ? undefined : 0}
      aria-labelledby={headingId}
      className={['bl-card outline-offset-4', isStatic ? 'is-static' : 'h-[440px] md:h-[460px]', flipped ? 'is-flipped' : ''].join(' ')}
      onPointerEnter={(e) => {
        pointerType.current = e.pointerType
        if (e.pointerType === 'mouse' && hoverCapable()) setFlipped(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse' && hoverCapable()) setFlipped(false)
      }}
      onPointerDown={(e) => {
        pointerType.current = e.pointerType
      }}
      onClick={() => {
        if (pointerType.current !== 'mouse' || !hoverCapable()) setFlipped((f) => !f)
      }}
      onFocus={(e) => {
        if (e.target === e.currentTarget && e.currentTarget.matches(':focus-visible')) setFlipped(true)
      }}
      onBlur={(e) => {
        if (e.target === e.currentTarget) setFlipped(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setFlipped((f) => !f)
        }
        if (e.key === 'Escape') setFlipped(false)
      }}
    >
      <div className="bl-card-inner">
        {/* Front: the number, a base sequence, a helix fragment, the title */}
        <div className="bl-card-face bl-card-front flex flex-col p-7 md:p-8" aria-hidden="true">
          <div className="flex items-center justify-between">
            <span className="bl-label text-amber tabular-nums">{tenet.index}</span>
            <span className="relative h-[9px] w-[9px]">
              <span className="bl-cross left-0 top-0" />
            </span>
          </div>
          <p className="mt-10 bl-serif-caps text-[1.05rem] md:text-[1.15rem] tracking-[0.42em] text-offwhite/55 tabular-nums">
            {strand}
          </p>
          <div className="mt-8 -mx-1">
            <HelixFragment {...CARDS.fragments[i]} />
          </div>
          <div className="mt-auto flex items-end justify-between gap-6">
            <p className="bl-title max-w-[14ch]">{tenet.name}</p>
            <span className="bl-tap-hint bl-label text-[9.5px] whitespace-nowrap items-center gap-2">
              <span className="h-[5px] w-[5px] rounded-full border border-amber/80" />
              Tap to reveal
            </span>
          </div>
        </div>

        {/* Back: the title, the full description */}
        <div className="bl-card-face bl-card-back flex flex-col p-7 md:p-8">
          <div className="flex items-center justify-between">
            <span className="bl-label text-teal tabular-nums">{tenet.index}</span>
            <span className="bl-label text-[9.5px] text-offwhite/40 tracking-[0.42em]" aria-hidden="true">
              {CARDS.strands[i].slice(0, 4)}
            </span>
          </div>
          <h3 id={headingId} className="mt-10 bl-h3 text-[1.45rem] md:text-[1.6rem] leading-[1.2]">
            <span className="sr-only">{tenet.name}</span>
            <span aria-hidden="true">{isStatic ? tenet.name : title}</span>
          </h3>
          <div className="bl-card-back-body mt-auto">
            <span className="block h-px w-10 bg-teal/70 mb-6" aria-hidden="true" />
            <p className="bl-body">{tenet.description}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * Principles as three sequence cards. Desktop: hover or keyboard focus
 * flips a card in 3D while its title decodes from base letters. Touch: tap
 * flips, tap again flips back. Reduced motion: the back of each card shows
 * directly. Every word is real text in the DOM.
 */
export function PrinciplesSection() {
  const { mounted, reduced } = useMotion()
  const isStatic = mounted && reduced

  return (
    <section id="philosophy" className="bg-black" aria-label="Philosophy">
      <div className="bl-wrap">
        <div className="relative">
          <span className="bl-rule" aria-hidden="true" />
          <span className="bl-cross -left-1 -top-1" aria-hidden="true" />
          <span className="bl-cross -right-1 -top-1" aria-hidden="true" />
        </div>
        <div className="py-24 md:py-32">
          <Reveal stagger className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            {TENETS.map((tenet, i) => (
              <SequenceCard key={tenet.id} tenet={tenet} i={i} isStatic={isStatic} />
            ))}
          </Reveal>

          <Reveal className="mt-12 md:mt-14">
            <Link href="/philosophy" className="group bl-link">
              <span className="bl-underline">Read the full philosophy</span>
              <span aria-hidden="true" className="bl-arrow" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
