import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Philosophy', href: '/philosophy' },
  { label: 'The Method', href: '/method' },
  { label: 'Process', href: '/process' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
]

/**
 * The footer closes on the wordmark set at full width, sitting on the line:
 * a hairline with one amber reading point, the hero's motif at rest.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-black">
      <div className="bl-wrap pb-8 md:pb-10">
        <span className="bl-rule" aria-hidden="true" />
        <div className="pt-16 md:pt-24">
        <div className="bl-folio">
          <div className="bl-margin">
            <p className="bl-label">Dallas, Texas · By appointment · Remote and in-person</p>
          </div>

          <div className="grid gap-12 md:grid-cols-2 md:gap-8">
            <div className="flex flex-col items-start">
              <a
                href="mailto:layne@blacklinemethod.com"
                className="inline-flex items-center min-h-[44px] font-serif font-light text-[1.35rem] md:text-[1.6rem] tracking-[-0.01em] text-offwhite/90 transition-opacity duration-600 hover:opacity-60"
              >
                layne@blacklinemethod.com
              </a>
              <a
                href="mailto:spencer@blacklinemethod.com"
                className="inline-flex items-center min-h-[44px] font-serif font-light text-[1.35rem] md:text-[1.6rem] tracking-[-0.01em] text-offwhite/90 transition-opacity duration-600 hover:opacity-60"
              >
                spencer@blacklinemethod.com
              </a>
            </div>

            <nav aria-label="Footer navigation">
              <ul className="grid grid-cols-2 gap-x-8 md:justify-items-start">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center min-h-[44px] whitespace-nowrap font-sans text-[10.5px] font-medium tracking-[0.2em] uppercase text-label transition-colors duration-600 hover:text-offwhite"
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

        {/* The line, at rest */}
        <div className="relative mt-20 md:mt-28" aria-hidden="true">
          <span className="block h-px w-full bg-offwhite/25" />
          <span className="absolute left-[78%] top-0 -mt-[2.5px] -ml-[2.5px] h-[5px] w-[5px] rounded-full bg-amber shadow-[0_0_12px_2px_rgba(200,150,90,0.35)]" />
        </div>

        <p
          data-parallax="16"
          className="mt-6 md:mt-8 font-serif font-light uppercase text-offwhite text-center leading-[0.8] tracking-[0.18em] pl-[0.18em] text-[clamp(2.6rem,12.4vw,13.5rem)] select-none"
          style={{ fontVariationSettings: "'SOFT' 0" }}
        >
          BLACKLINE
        </p>

        <div className="mt-8 md:mt-10 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <p className="font-sans text-[11px] text-body-dim tracking-[0.05em]">
            © {year} Blackline Method LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
