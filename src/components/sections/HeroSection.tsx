import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section
      className="relative h-screen bg-black flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* HERO_SCROLL_ANIMATION_PLACEHOLDER - will be replaced with 30-frame canvas scroll sequence.
          The canvas element should be absolutely positioned to fill this div and driven by
          window.scrollY progress mapped to the frame index. See /sequence/ for source frames. */}
      <div
        id="hero-scroll-animation-placeholder"
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.5rem,7vw,7rem)]">
          the standard for<br className="hidden sm:block" /> private training
        </h1>

        <p className="mt-8 font-sans text-offwhite/35 uppercase tracking-[0.3em] text-[11px]">
          dallas design district&nbsp;&nbsp;·&nbsp;&nbsp;by appointment
        </p>

        <div className="mt-12">
          <Button asChild size="lg">
            <Link href="#membership">request membership</Link>
          </Button>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2" aria-hidden="true">
        <div className="w-px h-14 bg-gradient-to-b from-offwhite/0 to-offwhite/15 mx-auto" />
      </div>
    </section>
  )
}
