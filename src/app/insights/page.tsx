import type { Metadata } from 'next'
import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { articles } from '@/content/insights/registry'

export const metadata: Metadata = {
  title: 'Insights | Blackline Method',
  description:
    'Long-form essays on hormone physiology, diagnostics, training, and the science of optimization. From the Blackline Method practice.',
}

export default function InsightsPage() {
  return (
    <div className="bg-black min-h-screen pt-36 md:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <Reveal as="p" className="bl-label mb-8">
          insights
        </Reveal>
        <SplitReveal
          as="h1"
          className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(3rem,7vw,7rem)] mb-6"
        >
          from the practice.
        </SplitReveal>
        <Reveal as="p" delay={0.3} className="font-sans text-sm md:text-[15px] text-body tracking-wide leading-relaxed max-w-md mb-20 md:mb-24">
          Long-form essays on hormone physiology, diagnostics, training, and the structure of
          optimization. Not tips. Not guides. Writing that demonstrates how we think.
        </Reveal>

        {/* Article list */}
        <Reveal stagger className="border-t border-hairline">
          {articles.map((article) => {
            const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })

            return (
              <Link
                key={article.slug}
                href={`/insights/${article.slug}`}
                className="group block border-b border-hairline py-10 md:py-12 transition-transform duration-600 ease-lux hover:-translate-y-0.5"
              >
                <div className="grid md:grid-cols-[1fr_auto] gap-5 md:gap-10 items-start">
                  <div>
                    <div className="flex items-center gap-4 mb-5">
                      <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-amber-muted">
                        {article.category}
                      </span>
                      <span className="text-hairline" aria-hidden="true">·</span>
                      <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-label">
                        {formattedDate}
                      </span>
                    </div>
                    <h2 className="font-serif font-light text-offwhite/90 lowercase tracking-wider text-[clamp(1.5rem,2.5vw,2.25rem)] leading-[1.15] mb-3">
                      <span className="bl-underline text-amber">
                        <span className="text-offwhite/90 group-hover:text-offwhite transition-colors duration-600">{article.title}</span>
                      </span>
                    </h2>
                    <p className="font-sans text-sm text-body-dim tracking-wide leading-relaxed max-w-xl">
                      {article.dek}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-2 font-sans text-[11px] tracking-[0.2em] uppercase text-amber-muted group-hover:text-amber transition-colors duration-600 pt-1 shrink-0"
                    aria-hidden="true"
                  >
                    Read
                    <span className="transition-transform duration-600 ease-lux group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            )
          })}
        </Reveal>
      </div>
    </div>
  )
}
