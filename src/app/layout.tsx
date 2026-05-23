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
  title: 'Blackline Method — Private Training, Dallas Design District',
  description:
    'A private training and wellness facility in the Dallas Design District. Strength, recovery, and clinical care — in one building. By application only.',
  keywords: [
    'private gym Dallas',
    'Design District Dallas',
    'personal training Dallas',
    'luxury gym Dallas',
    'wellness Dallas',
    'blood work fitness',
    'hormone optimization Dallas',
  ],
  openGraph: {
    title: 'Blackline Method — Private Training, Dallas Design District',
    description:
      'Train. Recover. Heal. A private facility in the Dallas Design District, limited to 150 members.',
    url: 'https://blacklinemethod.com',
    siteName: 'Blackline Method',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blackline Method — Private Training, Dallas Design District',
    description:
      'Train. Recover. Heal. A private facility in the Dallas Design District, limited to 150 members.',
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
