import type { Config } from 'tailwindcss'

/**
 * Blackline design tokens (pass two: "the living sequence").
 * Near-black, greys, off-white, amber as the accent. Teal and violet are
 * used richly in the hero scene only; outside it teal is a rare secondary
 * accent (a decoded sequence card, the selected method pillar). No
 * gradients on text. See CLAUDE.md and DESIGN.md.
 *   ink          deeper black for the veil and the mobile menu
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
        teal: '#2FA39A',
        violet: '#7A6CF2',
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
