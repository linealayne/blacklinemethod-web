import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { articles } from '@/content/insights/registry'

// Show the three most recent articles on the landing page
const FEATURED = articles.slice(0, 3)

export function InsightsTeaserSection() {
  return (
    <section className="bg-black border-t border-hairline" aria-label="Insights">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="flex items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <Reveal as="p" className="bl-label mb-5">
              insights
            </Reveal>
            <SplitReveal
              as="h2"
              className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.25rem,4vw,4rem)]"
            >
              from the practice.
            </SplitReveal>
          </div>
          <Reveal className="hidden md:block">
            <Link
              href="/insights"
              className="group inline-flex items-center gap-3 min-h-[44px] font-sans text-[11px] tracking-[0.2em] uppercase text-amber-muted transition-colors duration-600 hover:text-amber pb-1"
            >
              <span className="bl-underline">All articles</span>
              <span aria-hidden="true" className="transition-transform duration-600 ease-lux group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>

        <Reveal stagger className="border-t border-hairline">
          {FEATURED.map((article) => (
            <Link
              key={article.slug}
              href={`/insights/${article.slug}`}
              className="group block border-b border-hairline py-9 md:py-10 transition-transform duration-600 ease-lux hover:-translate-y-0.5"
            >
              <div className="grid md:grid-cols-[1fr_auto] gap-5 md:gap-10 items-start">
                <div>
                  <span className="block font-sans text-[10px] tracking-[0.25em] uppercase text-amber-muted mb-4">
                    {article.category}
                  </span>
                  <h3 className="font-serif font-light text-offwhite/90 lowercase tracking-wider text-[clamp(1.4rem,2.5vw,2rem)] leading-[1.15] mb-3 transition-colors duration-600 group-hover:text-offwhite">
                    <span className="bl-underline text-amber">
                      <span className="text-offwhite/90 group-hover:text-offwhite transition-colors duration-600">{article.title}</span>
                    </span>
                  </h3>
                  <p className="font-sans text-sm text-body-dim tracking-wide leading-relaxed max-w-lg">
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
          ))}
        </Reveal>

        <Reveal delay={0.1} className="mt-8 md:hidden">
          <Link
            href="/insights"
            className="group inline-flex items-center gap-3 min-h-[44px] font-sans text-[11px] tracking-[0.2em] uppercase text-amber-muted transition-colors duration-600 hover:text-amber"
          >
            <span className="bl-underline">All articles</span>
            <span aria-hidden="true" className="transition-transform duration-600 ease-lux group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
