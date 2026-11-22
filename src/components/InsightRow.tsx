import Link from 'next/link'
import type { ArticleRecord } from '@/content/insights/registry'

/**
 * One entry in an insights list: category (and date) in a narrow index
 * column, the serif title and dek in the main column, "Read" with a drawn
 * arrow on the right. Hover draws the title's underline and extends the
 * arrow; no layout shift.
 */
export function InsightRow({
  article,
  showDate = false,
  headingLevel = 'h2',
}: {
  article: ArticleRecord
  showDate?: boolean
  headingLevel?: 'h2' | 'h3'
}) {
  const Heading = headingLevel
  const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <Link href={`/insights/${article.slug}`} className="group block border-b border-hairline">
      <div className="grid gap-4 py-9 md:py-11 md:grid-cols-12 md:gap-x-8 md:items-baseline">
        <div className="md:col-span-3 flex flex-wrap gap-x-4 gap-y-1 md:flex-col">
          <span className="bl-label bl-label-strong">{article.category}</span>
          {showDate && <span className="bl-label">{formattedDate}</span>}
        </div>
        <div className="md:col-span-7">
          <Heading className="bl-title mb-3">
            <span className="bl-underline pb-1">{article.title}</span>
          </Heading>
          <p className="bl-body text-body-dim max-w-xl">{article.dek}</p>
        </div>
        <span className="md:col-span-2 md:justify-self-end bl-link min-h-0 text-label group-hover:text-offwhite transition-colors duration-600" aria-hidden="true">
          Read
          <span className="bl-arrow" />
        </span>
      </div>
    </Link>
  )
}
