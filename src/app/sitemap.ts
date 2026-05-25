import type { MetadataRoute } from 'next'
import { articles } from '@/content/insights/registry'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://blacklinemethod.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/philosophy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/method`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/process`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/insights`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/insights/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...articleRoutes]
}
