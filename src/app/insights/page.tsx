import type { Metadata } from 'next'
import { InsightRow } from '@/components/InsightRow'
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
    <div className="bg-black min-h-screen pt-36 md:pt-48 pb-24">
      <div className="bl-wrap">
        {/* Header */}
        <Reveal as="p" className="bl-label bl-tick mb-10">
          insights
        </Reveal>
        <SplitReveal
          as="h1"
          className="bl-h1 mb-10"
        >
          from the practice.
        </SplitReveal>
        <Reveal as="p" delay={0.3} className="bl-body max-w-md mb-20 md:mb-24">
          Long-form essays on hormone physiology, diagnostics, training, and the structure of
          optimization. Not tips. Not guides. Writing that demonstrates how we think.
        </Reveal>

        {/* Article list */}
        <Reveal stagger className="border-t border-hairline">
          {articles.map((article) => (
            <InsightRow key={article.slug} article={article} showDate />
          ))}
        </Reveal>
      </div>
    </div>
  )
}
