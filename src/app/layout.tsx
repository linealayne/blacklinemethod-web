import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { Loader } from '@/components/motion/Loader'
import { PageTransition } from '@/components/motion/PageTransition'
import { Grain } from '@/components/motion/Grain'
import { FLAGS_SCRIPT } from '@/lib/flags'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'block',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Blackline Method | Private Optimization Practice, Dallas',
  description:
    'A private optimization practice built around the individual, not the population average. Hormones, training, nutrition, and the way you live, read as one system. Dallas, Texas. By appointment.',
  keywords: [
    'hormone optimization Dallas',
    'private optimization practice',
    'bloodwork interpretation Dallas',
    'performance optimization Dallas',
    'private coaching Dallas',
    'endocrine optimization',
  ],
  openGraph: {
    title: 'Blackline Method | Private Optimization Practice',
    description:
      'Run your own biology. A private optimization practice built around you, not the clock or the population average. By appointment.',
    url: 'https://blacklinemethod.com',
    siteName: 'Blackline Method',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blackline Method | Private Optimization Practice',
    description:
      'Run your own biology. A private optimization practice built around you, not the clock or the population average.',
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

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets motion/WebGL/loader flags on <html> before first paint. See src/lib/flags.ts */}
        <script dangerouslySetInnerHTML={{ __html: FLAGS_SCRIPT }} />
      </head>
      <body>
        <MotionProvider>
          <a href="#bl-main" className="bl-skip">
            Skip to content
          </a>
          <Loader />
          <SmoothScroll />
          <PageTransition />
          <Header />
          <main id="bl-main">{children}</main>
          <Footer />
          <Grain />
        </MotionProvider>
      </body>
    </html>
  )
}
