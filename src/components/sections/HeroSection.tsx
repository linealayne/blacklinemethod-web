import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section
      className="relative h-screen bg-black flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Hero content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(2.5rem,7vw,7rem)]">
          run your own biology.
        </h1>

        <p className="mt-8 font-sans text-offwhite/35 uppercase tracking-[0.3em] text-[11px]">
          Dallas, Texas&nbsp;&nbsp;·&nbsp;&nbsp;By appointment
        </p>

        <p className="mt-6 font-serif italic text-offwhite/30 text-base md:text-lg tracking-wide max-w-md mx-auto">
          a private optimization practice for hormones, training, nutrition, and the way you live.
        </p>

        <div className="mt-12">
          <Button asChild size="lg">
            <Link href="/contact">request a consult</Link>
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
