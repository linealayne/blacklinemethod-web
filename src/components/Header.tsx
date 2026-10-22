'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { gsap, useGSAP } from '@/lib/gsap'
import { motionFlags } from '@/lib/flags'

const NAV_LINKS = [
  { label: 'Philosophy', href: '/philosophy' },
  { label: 'The Method', href: '/method' },
  { label: 'Process', href: '/process' },
  { label: 'Insights', href: '/insights' },
]

const MOBILE_LINKS = [...NAV_LINKS, { label: 'Contact', href: '/contact' }]

/** Mobile menu choreography */
const MENU = {
  open: 0.5,
  close: 0.22,
  linkStagger: 0.07,
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Build the overlay timeline once; play/reverse on toggle.
  useGSAP(
    () => {
      const overlay = overlayRef.current
      if (!overlay) return
      const links = overlay.querySelectorAll('[data-menu-link]')
      const foot = overlay.querySelector('[data-menu-foot]')
      const reduced = motionFlags().reduced
      const t = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      t.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduced ? 0 : MENU.open, ease: 'power2.out' })
      t.fromTo(
        links,
        { yPercent: 110 },
        { yPercent: 0, duration: reduced ? 0 : 0.9, stagger: reduced ? 0 : MENU.linkStagger, ease: 'expo.out' },
        reduced ? 0 : 0.12
      )
      t.fromTo(foot, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.6 }, reduced ? 0 : 0.45)
      tl.current = t
    },
    { scope: overlayRef }
  )

  const open = useCallback(() => {
    setMenuOpen(true)
    window.__lenis?.stop()
    document.body.style.overflow = 'hidden'
    tl.current?.timeScale(1).play()
    requestAnimationFrame(() => closeRef.current?.focus())
  }, [])

  const close = useCallback(() => {
    setMenuOpen(false)
    window.__lenis?.start()
    document.body.style.overflow = ''
    const t = tl.current
    if (t) t.timeScale(MENU.open / MENU.close).reverse()
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

  // Close on route change (links inside call close before navigating, but keep this as a guard)
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
          'transition-[background-color,border-color,backdrop-filter] duration-700 ease-out',
          scrolled ? 'bg-black/90 backdrop-blur-md border-b border-hairline' : 'bg-transparent border-b border-transparent',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-sm tracking-[0.35em] text-offwhite uppercase transition-opacity duration-600 hover:opacity-60 py-3"
            aria-label="Blackline Method, home"
          >
            BLACKLINE
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-10" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[11px] tracking-[0.2em] uppercase text-label transition-colors duration-600 hover:text-amber py-3 whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button asChild size="sm">
              <Link href="/contact">request a consult</Link>
            </Button>
          </div>

          {/* Mobile trigger */}
          <button
            ref={triggerRef}
            className="lg:hidden text-offwhite/80 transition-colors duration-600 hover:text-amber -mr-3 p-3"
            onClick={open}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="bl-mobile-menu"
          >
            <Menu size={20} strokeWidth={1.25} />
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay (always mounted; hidden via visibility) */}
      <div
        id="bl-mobile-menu"
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-ink flex flex-col lg:hidden"
        style={{ opacity: 0, visibility: 'hidden' }}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-hairline">
          <Link
            href="/"
            className="font-serif text-sm tracking-[0.35em] text-offwhite uppercase py-3"
            onClick={close}
            tabIndex={menuOpen ? 0 : -1}
          >
            BLACKLINE
          </Link>
          <button
            ref={closeRef}
            className="text-offwhite/80 transition-colors duration-600 hover:text-amber -mr-3 p-3"
            onClick={close}
            aria-label="Close menu"
            tabIndex={menuOpen ? 0 : -1}
          >
            <X size={20} strokeWidth={1.25} />
          </button>
        </div>

        <nav className="flex flex-col justify-center flex-1 px-6 gap-2" aria-label="Mobile navigation">
          {MOBILE_LINKS.map((link) => (
            <div key={link.href} className="overflow-hidden py-1">
              <Link
                href={link.href}
                data-menu-link
                className="block font-serif text-[2.6rem] leading-[1.15] font-light text-offwhite/85 tracking-wider lowercase transition-colors duration-600 hover:text-amber"
                onClick={close}
                tabIndex={menuOpen ? 0 : -1}
              >
                {link.label.toLowerCase()}
              </Link>
            </div>
          ))}
        </nav>

        <div className="px-6 pb-10 border-t border-hairline pt-8 space-y-6" data-menu-foot>
          <Button asChild size="lg" className="w-full" glow>
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
