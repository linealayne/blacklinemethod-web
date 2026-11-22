import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { articles } from '@/content/insights/registry'
import { Folio } from '@/components/layout/Folio'
import { InsightRow } from '@/components/InsightRow'

// Show the three most recent articles on the landing page
const FEATURED = articles.slice(0, 3)

export function InsightsTeaserSection() {
  return (
    <Folio label="insights" ariaLabel="Insights">
      <div className="flex items-end justify-between gap-6 mb-12 md:mb-16">
        <Reveal as="h2" className="bl-h2">
          from the practice.
        </Reveal>
        <Reveal className="hidden md:block shrink-0">
          <Link href="/insights" className="group bl-link">
            <span className="bl-underline">All articles</span>
            <span aria-hidden="true" className="bl-arrow" />
          </Link>
        </Reveal>
      </div>

      <Reveal stagger className="border-t border-hairline">
        {FEATURED.map((article) => (
          <InsightRow key={article.slug} article={article} headingLevel="h3" />
        ))}
      </Reveal>

      <Reveal className="mt-8 md:hidden">
        <Link href="/insights" className="group bl-link">
          <span className="bl-underline">All articles</span>
          <span aria-hidden="true" className="bl-arrow" />
        </Link>
      </Reveal>
    </Folio>
  )
}
