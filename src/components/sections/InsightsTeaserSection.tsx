import Link from 'next/link'
import { FadeInSection } from '@/components/FadeInSection'
import { articles } from '@/content/insights/registry'

// Show the three most recent articles on the landing page
const FEATURED = articles.slice(0, 3)

export function InsightsTeaserSection() {
  return (
    <section className="bg-black border-t border-hairline" aria-label="Insights">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-44">
        <FadeInSection>
          <div className="flex items-end justify-between gap-6 mb-16">
            <div>
              <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-4">
                insights
              </span>
              <h2 className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.25rem,4vw,4rem)]">
                from the practice.
              </h2>
            </div>
            <Link
              href="/insights"
              className="hidden md:inline-flex font-sans text-[11px] tracking-[0.2em] uppercase text-amber/60 transition-colors duration-600 hover:text-amber items-center gap-3 pb-2"
            >
              All articles
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </FadeInSection>

        <div className="space-y-0">
          {FEATURED.map((article, i) => (
            <FadeInSection key={article.slug} delay={0.1 * i}>
              <div>
                {i > 0 && (
                  <div className="h-px bg-hairline" aria-hidden="true" />
                )}
                <Link
                  href={`/insights/${article.slug}`}
                  className="group block py-10 transition-opacity duration-600 hover:opacity-100"
                >
                  <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
                    <div>
                      <span className="block font-sans text-[10px] tracking-[0.25em] uppercase text-amber/50 mb-4">
                        {article.category}
                      </span>
                      <h3 className="font-serif font-light text-offwhite/80 lowercase tracking-wider text-[clamp(1.4rem,2.5vw,2rem)] leading-[1.15] mb-3 group-hover:text-offwhite transition-colors duration-600">
                        {article.title}
                      </h3>
                      <p className="font-sans text-sm text-offwhite/35 tracking-wide leading-relaxed max-w-lg">
                        {article.dek}
                      </p>
                    </div>
                    <span
                      className="font-sans text-[11px] tracking-[0.2em] uppercase text-amber/40 group-hover:text-amber transition-colors duration-600 pt-1 shrink-0"
                      aria-hidden="true"
                    >
                      Read →
                    </span>
                  </div>
                </Link>
              </div>
            </FadeInSection>
          ))}
        </div>

        <FadeInSection delay={0.3}>
          <div className="mt-10 md:hidden">
            <Link
              href="/insights"
              className="font-sans text-[11px] tracking-[0.2em] uppercase text-amber/60 transition-colors duration-600 hover:text-amber inline-flex items-center gap-3"
            >
              All articles
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
