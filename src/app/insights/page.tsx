import type { Metadata } from 'next'
import Link from 'next/link'
import { FadeInSection } from '@/components/FadeInSection'
import { articles } from '@/content/insights/registry'

export const metadata: Metadata = {
  title: 'Insights — Blackline Method',
  description:
    'Long-form essays on hormone physiology, diagnostics, training, and the science of optimization. From the Blackline Method practice.',
}

export default function InsightsPage() {
  return (
    <div className="bg-black min-h-screen pt-40 pb-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <FadeInSection>
          <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
            insights
          </span>
          <h1 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(3rem,7vw,7rem)] mb-6">
            from the practice.
          </h1>
          <p className="font-sans text-sm text-offwhite/35 tracking-wide leading-relaxed max-w-md mb-24">
            Long-form essays on hormone physiology, diagnostics, training, and the structure
            of optimization. Not tips. Not guides. Writing that demonstrates how we think.
          </p>
        </FadeInSection>

        {/* Article list */}
        <div>
          {articles.map((article, i) => {
            const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })

            return (
              <FadeInSection key={article.slug} delay={0.08 * i}>
                <div>
                  {i > 0 && (
                    <div className="h-px bg-hairline" aria-hidden="true" />
                  )}
                  <Link
                    href={`/insights/${article.slug}`}
                    className="group block py-12 transition-opacity duration-600"
                  >
                    <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
                      <div>
                        <div className="flex items-center gap-4 mb-5">
                          <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-amber/50">
                            {article.category}
                          </span>
                          <span className="text-hairline" aria-hidden="true">·</span>
                          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-offwhite/20">
                            {formattedDate}
                          </span>
                        </div>
                        <h2 className="font-serif font-light text-offwhite/80 lowercase tracking-wider text-[clamp(1.5rem,2.5vw,2.25rem)] leading-[1.15] mb-3 group-hover:text-offwhite transition-colors duration-600">
                          {article.title}
                        </h2>
                        <p className="font-sans text-sm text-offwhite/35 tracking-wide leading-relaxed max-w-xl">
                          {article.dek}
                        </p>
                      </div>
                      <div className="flex items-start pt-1 shrink-0">
                        <span
                          className="font-sans text-[11px] tracking-[0.2em] uppercase text-amber/40 group-hover:text-amber transition-colors duration-600"
                          aria-label="Read article"
                        >
                          Read →
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </FadeInSection>
            )
          })}
        </div>

        {/* Bottom hairline */}
        <div className="h-px bg-hairline mt-4" aria-hidden="true" />
      </div>
    </div>
  )
}
