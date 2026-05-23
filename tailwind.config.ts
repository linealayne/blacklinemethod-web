import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#0A0A0A',
        offwhite: '#F5F5F0',
        amber: '#C8965A',
        hairline: '#2A2A2A',
        muted: '#6B6B6B',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        '600': '600ms',
        '800': '800ms',
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
