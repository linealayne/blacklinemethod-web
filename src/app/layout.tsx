import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { PageTransition } from '@/components/motion/PageTransition'
import { Grain } from '@/components/motion/Grain'
import { Loader } from '@/components/motion/Loader'
import { FLAGS_SCRIPT } from '@/lib/flags'

// Fraunces: the face of the BLACKLINE wordmark, used for all display type.
// The site only ever sets it at weight 400, the small optical size (14) and
// SOFT 0, which is exactly Google's static 400 file, so that file is loaded
// instead of the variable font: the same glyphs and widths at about a sixth
// of the download (18 KB against 118 KB on the critical path). If a design
// ever needs another weight or optical size, switch back to
// `axes: ['opsz', 'SOFT']` and drop `weight`.
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal'],
  weight: ['400'],
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
  themeColor: '#080808',
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
        {/* Sets the motion flags and runs the loading sequence clock before first paint. See src/lib/flags.ts */}
        <script dangerouslySetInnerHTML={{ __html: FLAGS_SCRIPT }} />
      </head>
      <body>
        <MotionProvider>
          <a href="#bl-main" className="bl-skip">
            Skip to content
          </a>
          <Loader />
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
