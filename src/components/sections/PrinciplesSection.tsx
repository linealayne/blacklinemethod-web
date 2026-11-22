'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useMotion } from '@/components/motion/MotionProvider'
import { Reveal } from '@/components/motion/Reveal'
import { HelixFragment } from '@/components/Strand'

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

/**
 * Card knobs. The flip itself (hover, focus, tap, and the title decoding from
 * A T G C as the card turns) is Layne's: do not change it unless he asks.
 */
const CARDS = {
  scrambleMs: 720, // how long the title takes to decode
  scrambleDelayMs: 260, // decode starts as the card passes edge-on
  // the strand on each card: a different length of the same helix
  fragments: [
    { turns: 1.5, phase: 0, rungCount: 9, lit: 3 },
    { turns: 2.1, phase: 0.9, rungCount: 12, lit: 7 },
    { turns: 2.8, phase: 1.7, rungCount: 15, lit: 5 },
  ],
}

const BASES = 'ATGC'

/**
 * The title, decoding. Letters cycle through A T G C and settle into the
 * target, left to right, while the card turns.
 *
 * It types in place with zero reflow: every character has a cell that is
 * already the width of its final glyph (an invisible ghost of the real
 * letter), the cycling letter is laid over the cell, and words cannot break
 * inside. So the line breaks, and the height of the title, are the final
 * ones before the first letter changes. The cycling letters are written
 * straight to the DOM (no React render per frame). Display only: the real
 * title is in the heading as screen-reader text.
 */
function DecodeTitle({ text, run, delay }: { text: string; run: boolean; delay: number }) {
  const cells = useRef<(HTMLElement | null)[]>([])
  const words = text.split(' ')
  const chars = words.join('')

  useEffect(() => {
    const paint = (pick: (i: number) => string) =>
      cells.current.forEach((el, i) => {
        if (el) el.textContent = pick(i)
      })
    const rest = () => paint((i) => chars[i])
    if (!run) {
      rest()
      return
    }
    let raf = 0
    let start = 0
    const tick = (now: number) => {
      if (!start) start = now + delay
      const p = Math.max(0, (now - start) / CARDS.scrambleMs)
      const settled = Math.floor(p * chars.length)
      if (p >= 1) {
        rest()
        return
      }
      paint((i) => (i < settled || chars[i] === '.' ? chars[i] : BASES[(Math.floor(now / 45) + i * 3) % 4]))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [chars, run, delay])

  let n = 0
  return (
    <span aria-hidden="true">
      {words.map((word, w) => (
        <span key={w}>
          <span className="bl-decode-word">
            {word.split('').map((ch) => {
              const i = n++
              return (
                <span key={i} className="bl-decode-cell">
                  <i>{ch}</i>
                  <b
                    ref={(el) => {
                      cells.current[i] = el
                    }}
                  >
                    {ch}
                  </b>
                </span>
              )
            })}
          </span>
          {w < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}

function PrincipleCard({ tenet, i, isStatic }: { tenet: (typeof TENETS)[number]; i: number; isStatic: boolean }) {
  const [flipped, setFlipped] = useState(false)
  const pointerType = useRef<string>('mouse')
  const headingId = `tenet-${tenet.id}`
  const fragment = CARDS.fragments[i]

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
        {/* Front: the number, a length of the strand, the title */}
        <div className="bl-card-face bl-card-front flex flex-col p-7 md:p-8" aria-hidden="true">
          <span className="bl-label text-tan tabular-nums">{tenet.index}</span>
          <div className="my-auto py-8">
            <HelixFragment {...fragment} />
          </div>
          <div className="flex items-end justify-between gap-6">
            <p className="bl-title max-w-[14ch]">{tenet.name}</p>
            <span className="bl-tap-hint bl-label text-[9.5px] whitespace-nowrap items-center gap-2">
              <span className="h-[5px] w-[5px] rounded-full bg-teal shadow-[0_0_8px_1px_rgb(var(--bl-teal-rgb)/0.7)]" />
              Tap to reveal
            </span>
          </div>
        </div>

        {/* Back: the title, the full description */}
        <div className="bl-card-face bl-card-back flex flex-col p-7 md:p-8">
          <div className="flex items-center justify-between gap-6">
            <span className="bl-label text-tan tabular-nums">{tenet.index}</span>
            <HelixFragment {...fragment} width={132} height={22} density={0.42} className="h-[22px] w-[132px] shrink-0 opacity-90" />
          </div>
          <h3 id={headingId} className="mt-10 bl-h3 text-[1.45rem] md:text-[1.6rem] leading-[1.2]">
            <span className="sr-only">{tenet.name}</span>
            <DecodeTitle text={tenet.name} run={flipped && !isStatic} delay={CARDS.scrambleDelayMs} />
          </h3>
          <div className="bl-card-back-body mt-auto">
            <span className="block h-px w-10 mb-6 [background:var(--bl-strand)]" aria-hidden="true" />
            <p className="bl-body">{tenet.description}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * Principles as three cards. Desktop: hover or keyboard focus flips a card
 * in 3D while its title decodes from base letters. Touch: tap flips, tap
 * again flips back. Reduced motion: the back of each card shows directly.
 * Every word is real text in the DOM.
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
              <PrincipleCard key={tenet.id} tenet={tenet} i={i} isStatic={isStatic} />
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
