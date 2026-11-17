import type { Config } from 'tailwindcss'

/**
 * Blackline design tokens (revamp: "the reading room").
 * Monochrome first. Amber is the signal colour: it marks a live reading
 * (the hero readout point, the drawn timeline, the active principle, the
 * optimal band, focus rings, form errors) and nothing decorative.
 * Palette is fixed (see DESIGN.md). The additions below are documented
 * tonal relatives of the existing palette, added for contrast and depth:
 *   ink          deeper black for the loader, veil, and 3D canvas ground
 *   gold         muted gold highlight for particle warm-white and hover glows
 *   amber-muted  amber at readable small-label strength (about 5.1:1 on black)
 *   label        warm grey for quiet uppercase labels (about 5.7:1 on black)
 *   body / body-dim  body copy greys that clear WCAG AA (7.2:1 and 5.4:1)
 */
const config: Config = {
  future: { hoverOnlyWhenSupported: true },
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#080808',
        ink: '#040404',
        graphite: '#111110',
        offwhite: '#F2F1EC',
        amber: '#C8965A',
        'amber-muted': '#A27A4A',
        gold: '#E2C48F',
        hairline: '#262624',
        muted: '#6B6B6B',
        label: '#8C8A84',
        body: '#9C9B96',
        'body-dim': '#85847F',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        '600': '600ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        lux: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      letterSpacing: {
        'widest-xl': '0.3em',
        'widest-lg': '0.2em',
        'widest-md': '0.15em',
        'widest-sm': '0.1em',
      },
    },
  },
  plugins: [],
}

export default config
