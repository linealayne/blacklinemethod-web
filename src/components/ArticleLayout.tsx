import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
    <article className="bg-black min-h-screen pt-40 pb-32 px-6">
      <div className="max-w-[640px] mx-auto">
        {/* Eyebrow */}
        <div className="flex items-center gap-4 mb-10">
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-amber/60">
            {category}
          </span>
          <span className="text-hairline" aria-hidden="true">·</span>
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-offwhite/20">
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif font-light text-offwhite lowercase leading-[1.1] tracking-wider text-[clamp(2.25rem,5vw,3.5rem)] mb-8">
          {title}
        </h1>

        {/* Dek */}
        <p className="font-serif italic text-offwhite/45 text-lg leading-relaxed mb-14 tracking-wide">
          {dek}
        </p>

        {/* Hairline */}
        <div className="w-full h-px bg-hairline mb-14" aria-hidden="true" />

        {/* Body */}
        <div className="article-body space-y-6 font-sans text-[16px] text-offwhite/55 leading-[1.85] tracking-[0.01em]">
          {children}
        </div>

        {/* Byline + CTA */}
        <div className="mt-20 pt-10 border-t border-hairline space-y-10">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-offwhite/25">
            Written by {author}
          </p>

          <div className="space-y-5">
            <div className="w-8 h-px bg-amber" aria-hidden="true" />
            <p className="font-serif text-xl text-offwhite/70 font-light tracking-wide">
              Engagements are limited. That is by design.
            </p>
            <Button asChild>
              <Link href="/contact">request a consult</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
