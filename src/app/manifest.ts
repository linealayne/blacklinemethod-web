import type { MetadataRoute } from 'next'

// Web app manifest: the home-screen and Android icons (public/icons, generated
// with the monogram; see "Brand mark" in CLAUDE.md). Colours are the page
// ground (black, #080808).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Blackline Method',
    short_name: 'Blackline',
    description: 'A private optimization practice in Dallas, Texas. By appointment.',
    start_url: '/',
    display: 'browser',
    background_color: '#080808',
    theme_color: '#080808',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
