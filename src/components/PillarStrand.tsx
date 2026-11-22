'use client'

import { Reveal } from '@/components/motion/Reveal'
import { StrandRail } from '@/components/Strand'

export interface Pillar {
  id: string
  label: string
  description?: string
}

/**
 * The four pillars as nodes on one still strand, all four listed in full.
 * On the home page this is what reduced motion, no WebGL, and no JavaScript
 * get in place of the rotating gene (pillars/PillarGene.tsx).
 * The strand runs down the left for the full height of the list; each
 * pillar hangs off it on a short rung: number, name, description, all of it
 * always visible and real text. Phones get exactly the same thing, since it
 * is already a single vertical column.
 *
 * Motion (globals.css, "The pillar strand"): a node lights once when its
 * pillar first enters view, which is the site's ordinary one-time entrance
 * and is never tied to scroll position; hovering a pillar rings its node.
 * Reduced motion: every node is lit from the start.
 */
export function PillarStrand({ pillars, origin, className = '' }: { pillars: Pillar[]; origin?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <StrandRail id="bl-rail-y" axis="y" className="absolute left-0 top-0 h-full" />

      {/* where the strand starts: the person it is read around */}
      {origin && (
        <p className="relative pl-[68px] md:pl-[88px] pb-10 md:pb-12 bl-label text-tan" aria-hidden="true">
          <span className="absolute left-[18px] top-[5px] h-[5px] w-[5px] rounded-full bg-teal shadow-[0_0_10px_2px_rgb(var(--bl-teal-rgb)/0.65)]" />
          {origin}
        </p>
      )}

      <ol className="space-y-12 md:space-y-14">
        {pillars.map((pillar, i) => (
          <Reveal as="li" key={pillar.id} className="bl-pillar relative pl-[68px] md:pl-[88px]" style={{ '--bl-node-delay': '0.25s' } as React.CSSProperties}>
            <span className="absolute left-[14.5px] top-[1px]" aria-hidden="true">
              <span className="bl-node" />
            </span>
            <span className="bl-pillar-rung absolute left-[34px] top-[6px] h-px w-[22px] md:w-[40px]" aria-hidden="true" />
            <span className="block bl-label text-tan tabular-nums">0{i + 1}</span>
            <h3 className="bl-h3 mt-4">{pillar.label}</h3>
            {pillar.description && <p className="bl-body mt-4 max-w-md">{pillar.description}</p>}
          </Reveal>
        ))}
      </ol>
    </div>
  )
}

/**
 * The /method page: the same strand laid on its side as a small index.
 * Four nodes along it, each a link that jumps to its pillar's section.
 */
export function PillarStrandNav({ pillars, className = '' }: { pillars: Pillar[]; className?: string }) {
  const jump = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    const reduced = document.documentElement.classList.contains('bl-reduced')
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
  }
  return (
    <nav aria-label="The four pillars" className={`relative ${className}`}>
      <StrandRail id="bl-rail-x" axis="x" className="absolute inset-x-0 top-0" />
      <Reveal as="ol" className="relative grid grid-cols-4">
        {pillars.map((pillar, i) => (
          <li key={pillar.id}>
            <a
              href={`#${pillar.id}`}
              onClick={(e) => jump(e, pillar.id)}
              className="bl-pillar group flex flex-col items-center pt-[14.5px] pb-2 text-center outline-offset-4"
              style={{ '--bl-node-delay': `${0.2 + i * 0.12}s` } as React.CSSProperties}
            >
              <span className="bl-node" aria-hidden="true" />
              <span className="mt-7 block bl-label text-tan tabular-nums">0{i + 1}</span>
              <span className="mt-2.5 block bl-serif-caps text-[10px] tracking-[0.1em] sm:text-[13.5px] sm:tracking-[0.2em] text-offwhite/75 transition-colors duration-500 group-hover:text-offwhite">
                {pillar.label}
              </span>
            </a>
          </li>
        ))}
      </Reveal>
    </nav>
  )
}
