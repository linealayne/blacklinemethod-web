import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/ArticleLayout'
import { articles } from '@/content/insights/registry'

// Static body imports — all four articles are bundled at build time (no dynamic imports needed)
import OptimalIsNotARange from '@/content/insights/optimal-is-not-a-range'
import TheCostOfLowEstrogenInMen from '@/content/insights/the-cost-of-low-estrogen-in-men'
import WhyBloodworkNeedsASecondSetOfEyes from '@/content/insights/why-bloodwork-needs-a-second-set-of-eyes'
import TrainingWithoutTheSystemUnderneath from '@/content/insights/training-without-the-system-underneath'

const BODY_COMPONENTS: Record<string, React.ComponentType> = {
  'optimal-is-not-a-range': OptimalIsNotARange,
  'the-cost-of-low-estrogen-in-men': TheCostOfLowEstrogenInMen,
  'why-bloodwork-needs-a-second-set-of-eyes': WhyBloodworkNeedsASecondSetOfEyes,
  'training-without-the-system-underneath': TrainingWithoutTheSystemUnderneath,
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) return {}

  return {
    title: `${article.title} — Blackline Method`,
    description: article.dek,
  }
}

export default async function InsightArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  const BodyComponent = BODY_COMPONENTS[slug]

  if (!article || !BodyComponent) {
    notFound()
  }

  return (
    <ArticleLayout
      category={article.category}
      date={article.date}
      title={article.title}
      dek={article.dek}
      author={article.author}
    >
      <BodyComponent />
    </ArticleLayout>
  )
}
