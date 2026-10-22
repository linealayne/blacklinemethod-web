import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import type { ReactNode } from 'react'

interface ArticleLayoutProps {
  category: string
  date: string
  title: string
  dek: string
  author: string
  children: ReactNode
}

export function ArticleLayout({
  category,
  date,
  title,
  dek,
  author,
  children,
}: ArticleLayoutProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="bg-black min-h-screen pt-36 md:pt-40 pb-24 px-6">
      <div className="max-w-[640px] mx-auto">
        {/* Eyebrow */}
        <Reveal className="flex items-center gap-4 mb-10">
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-amber-muted">
            {category}
          </span>
          <span className="text-hairline" aria-hidden="true">·</span>
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-label">
            {formattedDate}
          </span>
        </Reveal>

        {/* Title */}
        <SplitReveal
          as="h1"
          className="font-serif font-light text-offwhite lowercase leading-[1.1] tracking-wider text-[clamp(2.25rem,5vw,3.5rem)] mb-8"
        >
          {title}
        </SplitReveal>

        {/* Dek */}
        <Reveal as="p" delay={0.3} className="font-serif italic text-body text-lg leading-relaxed mb-14 tracking-wide">
          {dek}
        </Reveal>

        {/* Hairline */}
        <div className="w-full h-px bg-hairline mb-14" aria-hidden="true" />

        {/* Body */}
        <Reveal delay={0.15} className="article-body space-y-6 font-sans text-[16px] md:text-[17px] text-body leading-[1.85] tracking-[0.01em]">
          {children}
        </Reveal>

        {/* Byline + CTA */}
        <Reveal className="mt-20 pt-10 border-t border-hairline space-y-10">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-label">
            Written by {author}
          </p>

          <div className="space-y-5">
            <div className="w-8 h-px bg-amber" aria-hidden="true" />
            <p className="font-serif text-xl text-offwhite/80 font-light tracking-wide">
              Engagements are limited. That is by design.
            </p>
            <Button asChild glow>
              <Link href="/contact">request a consult</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </article>
  )
}
