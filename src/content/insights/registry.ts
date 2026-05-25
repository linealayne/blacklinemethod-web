export interface ArticleRecord {
  slug: string
  category: string
  title: string
  dek: string
  date: string
  author: string
}

export const articles: ArticleRecord[] = [
  {
    slug: 'optimal-is-not-a-range',
    category: 'Diagnostic Philosophy',
    title: 'optimal is not a range.',
    dek: 'Why "in range" is a low bar, and what it costs you.',
    date: '2025-02-10',
    author: 'Spencer',
  },
  {
    slug: 'the-cost-of-low-estrogen-in-men',
    category: 'Endocrinology',
    title: 'the cost of low estrogen in men.',
    dek: 'Why suppressing what looks like an inconvenience is often a mistake.',
    date: '2025-03-04',
    author: 'Spencer',
  },
  {
    slug: 'why-bloodwork-needs-a-second-set-of-eyes',
    category: 'Diagnostics',
    title: 'why bloodwork needs a second set of eyes.',
    dek: 'Fifteen minutes is not enough to read a person.',
    date: '2025-04-01',
    author: 'Layne',
  },
  {
    slug: 'training-without-the-system-underneath',
    category: 'Training & Physiology',
    title: 'training without the system underneath it.',
    dek: 'Why a great program on a broken substrate produces mediocre results.',
    date: '2025-05-12',
    author: 'Layne',
  },
]
