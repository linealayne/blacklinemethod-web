import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/Reveal'
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
    timeZone: 'UTC',
  })

  return (
    <article className="bg-black min-h-screen pt-36 md:pt-48 pb-24 px-6">
      <div className="max-w-[680px] mx-auto">
        {/* Eyebrow */}
        <Reveal className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-10">
          <span className="bl-label bl-label-strong bl-tick">
            {category}
          </span>
          <span className="text-hairline hidden sm:inline" aria-hidden="true">·</span>
          <span className="bl-label whitespace-nowrap">
            {formattedDate}
          </span>
        </Reveal>

        {/* Title */}
        <Reveal
          as="h1"
          className="bl-h2 mb-10"
        >
          {title}
        </Reveal>

        {/* Dek */}
        <Reveal as="p" delay={0.08} className="bl-lead mb-14">
          {dek}
        </Reveal>

        {/* Hairline */}
        <span className="bl-rule mb-14" />

        {/* Body */}
        <Reveal delay={0.08} className="article-body space-y-6 font-sans text-[16px] md:text-[17px] text-body leading-[1.85] tracking-[0.01em]">
          {children}
        </Reveal>

        {/* Byline + CTA */}
        <Reveal className="mt-20 pt-10 border-t border-hairline space-y-10">
          <p className="bl-label">
            Written by {author}
          </p>

          <div className="space-y-5">
            <div className="w-8 h-px bg-offwhite/50" aria-hidden="true" />
            <p className="bl-lead text-offwhite/85">
              Engagements are limited. That is by design.
            </p>
            <Button asChild>
              <Link href="/contact">request a consult</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </article>
  )
}
