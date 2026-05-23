'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Membership', href: '#membership' },
  { label: 'Contact', href: '#contact' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-700 ease-out',
          scrolled
            ? 'bg-black/95 backdrop-blur-md border-b border-hairline'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-sm tracking-[0.35em] text-offwhite uppercase transition-opacity duration-600 hover:opacity-60"
            aria-label="Blackline Method — home"
          >
            BLACKLINE
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[11px] tracking-[0.2em] uppercase text-offwhite/50 transition-colors duration-600 hover:text-amber"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile trigger */}
          <button
            className="md:hidden text-offwhite/70 transition-colors duration-600 hover:text-amber p-1"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu size={18} strokeWidth={1.25} />
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
            aria-modal="true"
            role="dialog"
            aria-label="Navigation menu"
          >
            {/* Menu header */}
            <div className="flex items-center justify-between px-6 h-20 border-b border-hairline">
              <Link
                href="/"
                className="font-serif text-sm tracking-[0.35em] text-offwhite uppercase"
                onClick={() => setMenuOpen(false)}
              >
                BLACKLINE
              </Link>
              <button
                className="text-offwhite/60 transition-colors duration-600 hover:text-amber p-1"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} strokeWidth={1.25} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col justify-center flex-1 px-6 gap-10">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.12 + i * 0.07,
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    className="block font-serif text-4xl font-light text-offwhite/70 tracking-wider lowercase transition-colors duration-600 hover:text-amber"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label.toLowerCase()}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Menu footer */}
            <div className="px-6 pb-10 border-t border-hairline pt-8">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-offwhite/20">
                Dallas Design District · By appointment
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
