import type { Metadata } from 'next'
import Link from 'next/link'
import { FadeInSection } from '@/components/FadeInSection'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Testimonials — Blackline Method',
  description:
    'What athletes and families say about training with Coach Jarvis and the Tailored Training system.',
}

const TESTIMONIALS = [
  {
    stars: 5,
    quote:
      'We contacted Coach Jarvis for speed training but received so much more. He discussed our goals before the first session, performed a thorough evaluation, and tailored every session around them. In just 8 sessions, my son\'s 40-yard dash dropped by three-tenths of a second. By far the most effective trainers we\'ve worked with in over four years.',
    name: 'Keisha Crane',
    subtitle: 'Parent of a Tailored Training Athlete · Speed Training',
  },
  {
    stars: 5,
    quote:
      'Training with Coach Jarvis didn\'t just make me a better football player — it made me a better man. He taught lessons inside the drills: how to never give up and to always know someone\'s fighting to take your spot. The drill work and attitude he brought every day prepared me for whatever came, in a game or in life.',
    name: 'Jack Morse',
    subtitle: 'Brown University · Linebacker',
  },
  {
    stars: 5,
    quote:
      'Training with Tailored Training ended up being very similar to what I got from my coaches once I reached college. There was a clear distinction between the freshmen who showed up prepared and polished and the ones who didn\'t. I\'d highly recommend Jarvis — not just for the results, but for the motivation and mentorship he gives young athletes.',
    name: 'Foster Malloy',
    subtitle: 'Collegiate Athlete · D3',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 mb-6" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-amber text-sm" aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  )
}

export default function TestimonialsPage() {
  return (
    <div className="bg-black min-h-screen pt-40 pb-32">
      {/* Hero */}
      <section
        aria-label="Testimonials introduction"
        className="px-6 md:px-12 max-w-7xl mx-auto mb-32 md:mb-44"
      >
        <FadeInSection>
          <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
            testimonials
          </span>
          <h1 className="font-serif font-light text-offwhite lowercase leading-[1.05] tracking-wider text-[clamp(3rem,8vw,8rem)] mb-16 max-w-5xl">
            results in their own words.
          </h1>
          <p className="font-serif italic text-offwhite/40 text-xl leading-relaxed max-w-xl">
            Athletes and families who have trained with the Tailored Training system.
          </p>
        </FadeInSection>
      </section>

      {/* Testimonial grid */}
      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
      <section
        aria-label="Athlete testimonials"
        className="px-6 md:px-12 max-w-7xl mx-auto py-32 md:py-44"
      >
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <FadeInSection key={t.name} delay={0.1 * i}>
              <div className="border border-hairline p-8 h-full flex flex-col">
                <Stars count={t.stars} />
                <blockquote className="font-serif italic text-offwhite/60 text-base leading-relaxed mb-8 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <footer>
                  <p className="font-serif font-bold text-offwhite text-sm tracking-wide">
                    {t.name}
                  </p>
                  <p className="font-sans text-[11px] tracking-[0.12em] text-muted mt-1">
                    {t.subtitle}
                  </p>
                </footer>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mx-6 md:mx-12 h-px bg-hairline" aria-hidden="true" />
      <section
        aria-label="Contact CTA"
        className="px-6 md:px-12 max-w-7xl mx-auto pt-20 pb-10"
      >
        <FadeInSection>
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            <p className="font-serif text-xl text-offwhite/70 font-light tracking-wide">
              Ready to start?
            </p>
            <Button asChild className="shrink-0">
              <Link href="/contact">request a consult</Link>
            </Button>
          </div>
        </FadeInSection>
      </section>
    </div>
  )
}
