import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-hairline">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          {/* Brand + location */}
          <div className="space-y-3">
            <p className="font-serif text-sm tracking-[0.35em] text-offwhite/70 uppercase">
              BLACKLINE
            </p>
            <p className="font-sans text-xs text-offwhite/25 tracking-[0.05em] leading-relaxed">
              Dallas, Texas · By appointment · Remote and in-person
            </p>
            <div className="space-y-1">
              <a
                href="mailto:layne@blacklinemethod.com"
                className="block font-sans text-[10px] text-offwhite/25 tracking-[0.05em] transition-colors duration-600 hover:text-amber"
              >
                layne@blacklinemethod.com
              </a>
              <a
                href="mailto:spencer@blacklinemethod.com"
                className="block font-sans text-[10px] text-offwhite/25 tracking-[0.05em] transition-colors duration-600 hover:text-amber"
              >
                spencer@blacklinemethod.com
              </a>
            </div>
          </div>

          {/* Links + copyright */}
          <div className="flex flex-col md:items-end gap-5">
            <nav className="flex gap-7" aria-label="Footer navigation">
              {[
                { label: 'Philosophy', href: '/philosophy' },
                { label: 'The Method', href: '/method' },
                { label: 'Process', href: '/process' },
                { label: 'Insights', href: '/insights' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[10px] tracking-[0.18em] uppercase text-offwhite/25 transition-colors duration-600 hover:text-amber"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className="font-sans text-[10px] text-offwhite/15 tracking-[0.05em]">
              © {year} Blackline Method LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
