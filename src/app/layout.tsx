import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Blackline Method — Private Optimization Practice, Dallas',
  description:
    'A private optimization practice for hormones, training, nutrition, and the structure of how you live. By appointment. Dallas, Texas.',
  keywords: [
    'hormone optimization Dallas',
    'private optimization practice',
    'bloodwork interpretation Dallas',
    'performance optimization Dallas',
    'private coaching Dallas',
    'endocrine optimization',
  ],
  openGraph: {
    title: 'Blackline Method — Private Optimization Practice',
    description:
      'Run your own biology. A private optimization practice for hormones, training, nutrition, and the way you live. By appointment.',
    url: 'https://blacklinemethod.com',
    siteName: 'Blackline Method',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blackline Method — Private Optimization Practice',
    description:
      'Run your own biology. A private optimization practice for hormones, training, nutrition, and the way you live.',
  },
  metadataBase: new URL('https://blacklinemethod.com'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
