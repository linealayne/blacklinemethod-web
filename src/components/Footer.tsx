import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Philosophy', href: '/philosophy' },
  { label: 'The Method', href: '/method' },
  { label: 'Process', href: '/process' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-hairline">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-14 pb-10 md:pt-16 md:pb-12">
        <div className="grid gap-12 md:grid-cols-[1fr_auto] md:items-end">
          {/* Brand + location */}
          <div className="space-y-4">
            <p className="font-serif text-sm tracking-[0.35em] text-offwhite/80 uppercase">
              BLACKLINE
            </p>
            <p className="font-sans text-xs text-body-dim tracking-[0.05em] leading-relaxed">
              Dallas, Texas · By appointment · Remote and in-person
            </p>
            <div className="flex flex-col items-start">
              <a
                href="mailto:layne@blacklinemethod.com"
                className="inline-flex items-center min-h-[40px] font-sans text-xs text-body-dim tracking-[0.05em] transition-colors duration-600 hover:text-amber"
              >
                layne@blacklinemethod.com
              </a>
              <a
                href="mailto:spencer@blacklinemethod.com"
                className="inline-flex items-center min-h-[40px] font-sans text-xs text-body-dim tracking-[0.05em] transition-colors duration-600 hover:text-amber"
              >
                spencer@blacklinemethod.com
              </a>
            </div>
          </div>

          {/* Links: two tidy columns on phones, a single row from sm up */}
          <nav aria-label="Footer navigation">
            <ul className="grid grid-cols-2 gap-x-10 sm:flex sm:flex-wrap sm:gap-x-8 md:justify-end">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center min-h-[44px] whitespace-nowrap font-sans text-[11px] tracking-[0.18em] uppercase text-label transition-colors duration-600 hover:text-amber"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-hairline">
          <p className="font-sans text-[11px] text-body-dim tracking-[0.05em]">
            © {year} Blackline Method LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
