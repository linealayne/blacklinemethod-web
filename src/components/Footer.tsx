'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { observeOnce } from '@/components/motion/Reveal'

const FOOTER_LINKS = [
  { label: 'Philosophy', href: '/philosophy' },
  { label: 'The Method', href: '/method' },
  { label: 'Process', href: '/process' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
]

const WORDMARK = 'BLACKLINE'

/**
 * The footer closes on the wordmark at full width, sitting on a hairline
 * with one amber reading point. Once, when it first enters view: the
 * hairlines draw across, the wordmark's letters rise one by one, then the
 * contacts and links fade up in sequence (globals.css, "Footer load-in").
 * About 1.3s end to end; nothing waits on it and reduced motion skips it.
 */
export function Footer() {
  const year = new Date().getFullYear()
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return observeOnce(el, () => el.classList.add('is-in'), '0px 0px -12% 0px')
  }, [])

  let item = 0
  const next = () => ({ '--i': item++ }) as React.CSSProperties

  return (
    <footer ref={ref} data-foot="" className="bg-black overflow-hidden">
      <div className="bl-wrap pb-8 md:pb-10">
        <div className="relative" aria-hidden="true">
          <span data-foot-rule="" className="bl-rule" />
          <span className="bl-cross -left-1 -top-1" />
          <span className="bl-cross -right-1 -top-1" />
        </div>
        <div className="pt-16 md:pt-24">
          <div className="bl-folio">
            <div className="bl-margin">
              <p data-foot-item="" style={next()} className="bl-label">
                Dallas, Texas · By appointment · Remote and in-person
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-2 md:gap-8">
              <div className="flex flex-col items-start">
                <a
                  data-foot-item=""
                  style={next()}
                  href="mailto:layne@blacklinemethod.com"
                  className="group inline-flex items-center min-h-[44px] font-sans text-[17px] md:text-[20px] text-offwhite/90 transition-colors duration-500 hover:text-offwhite"
                >
                  <span className="bl-underline pb-1">layne@blacklinemethod.com</span>
                </a>
                <a
                  data-foot-item=""
                  style={next()}
                  href="mailto:spencer@blacklinemethod.com"
                  className="group inline-flex items-center min-h-[44px] font-sans text-[17px] md:text-[20px] text-offwhite/90 transition-colors duration-500 hover:text-offwhite"
                >
                  <span className="bl-underline pb-1">spencer@blacklinemethod.com</span>
                </a>
              </div>

              <nav aria-label="Footer navigation">
                <ul className="grid grid-cols-2 gap-x-8 md:justify-items-start">
                  {FOOTER_LINKS.map((link) => (
                    <li key={link.href} data-foot-item="" style={next()}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center min-h-[44px] whitespace-nowrap font-sans text-[10.5px] font-medium tracking-[0.2em] uppercase text-label transition-colors duration-500 hover:text-offwhite"
                      >
                        <span className="bl-underline pb-1">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* The line, at rest, with its amber reading point */}
        <div className="relative mt-20 md:mt-28" aria-hidden="true">
          <span data-foot-rule="" className="block h-px w-full bg-offwhite/25" style={{ transitionDelay: '0.1s' }} />
          <span
            data-foot-dot=""
            className="absolute left-[78%] top-0 -mt-[2.5px] -ml-[2.5px] h-[5px] w-[5px] rounded-full bg-amber shadow-[0_0_12px_2px_rgba(200,150,90,0.35)]"
          />
        </div>

        <p className="mt-6 md:mt-8 bl-wordmark text-offwhite text-center leading-[0.9] tracking-[0.18em] pl-[0.18em] text-[clamp(2.4rem,11.6vw,13rem)] select-none">
          <span className="sr-only">{WORDMARK}</span>
          <span aria-hidden="true" className="inline-flex overflow-hidden pb-[0.04em]">
            {WORDMARK.split('').map((ch, i) => (
              <span key={i} data-foot-letter="" style={{ '--i': i } as React.CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
        </p>

        <div data-foot-item="" style={next()} className="mt-8 md:mt-10 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <p className="font-sans text-[11px] text-body-dim tracking-[0.05em]">
            © {year} Blackline Method LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
