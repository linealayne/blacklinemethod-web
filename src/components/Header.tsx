'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { label: 'Philosophy', href: '/philosophy' },
  { label: 'The Method', href: '/method' },
  { label: 'Process', href: '/process' },
  { label: 'Insights', href: '/insights' },
]

const MOBILE_LINKS = [...NAV_LINKS, { label: 'Contact', href: '/contact' }]

/**
 * Mobile menu choreography lives in globals.css ("Mobile menu"): the overlay
 * fades in over 0.5s and the serif links slide up through masks in sequence.
 * No animation library on the critical path.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 100)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const open = useCallback(() => {
    setMenuOpen(true)
    window.__lenis?.stop()
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => closeRef.current?.focus())
  }, [])

  const close = useCallback(() => {
    setMenuOpen(false)
    window.__lenis?.start()
    document.body.style.overflow = ''
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key !== 'Tab' || !overlayRef.current) return
      const focusables = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      ).filter((el) => el.tabIndex !== -1)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, close])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
      window.__lenis?.start()
    }
  }, [])

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50',
          'transition-[background-color,border-color] duration-700 ease-out',
          scrolled ? 'bg-black/80 backdrop-blur-md border-b border-hairline' : 'bg-transparent border-b border-transparent',
        ].join(' ')}
      >
        <div className="bl-wrap h-[var(--bl-header)] flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-[13px] tracking-[0.42em] text-offwhite uppercase transition-opacity duration-600 hover:opacity-60 py-3"
            aria-label="Blackline Method, home"
          >
            BLACKLINE
          </Link>

          {/* Desktop navigation: the current page carries an amber reading point */}
          <div className="hidden lg:flex items-center gap-12">
            <nav className="flex items-center gap-9" aria-label="Main navigation">
              {NAV_LINKS.map((link) => {
                const current = isCurrent(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={current ? 'page' : undefined}
                    className={[
                      'group relative inline-flex items-center gap-2 py-3 whitespace-nowrap',
                      'font-sans text-[10.5px] font-medium tracking-[0.2em] uppercase transition-colors duration-600',
                      current ? 'text-offwhite' : 'text-label hover:text-offwhite',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        'h-[4px] w-[4px] rounded-full bg-amber transition-[opacity,transform] duration-600 ease-lux',
                        current ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
                      ].join(' ')}
                    />
                    <span className="bl-underline pb-1">{link.label}</span>
                  </Link>
                )
              })}
            </nav>
            <Button asChild size="sm">
              <Link href="/contact">request a consult</Link>
            </Button>
          </div>

          {/* Mobile trigger */}
          <button
            ref={triggerRef}
            className="lg:hidden text-offwhite/85 transition-colors duration-600 hover:text-offwhite -mr-3 p-3"
            onClick={open}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="bl-mobile-menu"
          >
            <Menu size={20} strokeWidth={1} />
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay (always mounted; shown via .is-open) */}
      <div
        id="bl-mobile-menu"
        ref={overlayRef}
        className={['fixed inset-0 z-[100] bg-ink flex flex-col lg:hidden', menuOpen ? 'is-open' : ''].join(' ')}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
        aria-hidden={!menuOpen}
      >
        <div className="bl-wrap flex items-center justify-between h-[var(--bl-header)] border-b border-hairline">
          <Link
            href="/"
            className="font-serif text-[13px] tracking-[0.42em] text-offwhite uppercase py-3"
            onClick={close}
            tabIndex={menuOpen ? 0 : -1}
          >
            BLACKLINE
          </Link>
          <button
            ref={closeRef}
            className="text-offwhite/80 transition-colors duration-600 hover:text-offwhite -mr-3 p-3"
            onClick={close}
            aria-label="Close menu"
            tabIndex={menuOpen ? 0 : -1}
          >
            <X size={20} strokeWidth={1} />
          </button>
        </div>

        <nav className="bl-wrap flex flex-col justify-center flex-1 gap-1" aria-label="Mobile navigation">
          {MOBILE_LINKS.map((link) => (
            <div key={link.href} className="overflow-hidden py-1 border-b border-hairline/70" data-menu-item>
              <Link
                href={link.href}
                data-menu-link
                aria-current={isCurrent(link.href) ? 'page' : undefined}
                className="flex items-center justify-between font-serif text-[2.75rem] leading-[1.2] font-light text-offwhite tracking-[-0.02em] lowercase transition-opacity duration-600 hover:opacity-70"
                onClick={close}
                tabIndex={menuOpen ? 0 : -1}
              >
                {link.label.toLowerCase()}
                {isCurrent(link.href) && <span aria-hidden="true" className="h-[6px] w-[6px] rounded-full bg-amber" />}
              </Link>
            </div>
          ))}
        </nav>

        <div className="bl-wrap pb-10 pt-8 space-y-6" data-menu-foot>
          <Button asChild size="lg" className="w-full">
            <Link href="/contact" onClick={close} tabIndex={menuOpen ? 0 : -1}>
              request a consult
            </Link>
          </Button>
          <p className="bl-label text-[10px]">Dallas, Texas · By appointment · Remote and in-person</p>
        </div>
      </div>
    </>
  )
}
