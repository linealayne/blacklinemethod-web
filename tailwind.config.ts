import type { Config } from 'tailwindcss'

/**
 * Blackline design tokens (pass three: one palette, taken from the hero gene).
 * Every colour is defined ONCE, as an RGB triplet, in src/app/globals.css
 * (`:root`). Tailwind only points at those variables, so `text-tan/60`,
 * `bg-teal`, `border-hairline` and friends all resolve to the same tokens.
 * Roles are documented in CLAUDE.md ("Colour").
 */
const token = (name: string) => `rgb(var(--bl-${name}-rgb) / <alpha-value>)`

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
        black: token('black'),
        ink: token('ink'),
        graphite: token('graphite'),
        offwhite: token('offwhite'),
        tan: token('tan'),
        'tan-muted': token('tan-muted'),
        teal: token('teal'),
        violet: token('violet'),
        hairline: token('hairline'),
        'rule-strong': token('rule-strong'),
        label: token('label'),
        'label-strong': token('label-strong'),
        lead: token('lead'),
        body: token('body'),
        'body-dim': token('body-dim'),
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
