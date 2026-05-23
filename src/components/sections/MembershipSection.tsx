import Link from 'next/link'
import { FadeInSection } from '@/components/FadeInSection'
import { Button } from '@/components/ui/button'

export function MembershipSection() {
  return (
    <section
      id="membership"
      className="bg-black border-t border-hairline"
      aria-label="Membership"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-44">
        <FadeInSection>
          <div className="max-w-2xl">
            <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
              membership
            </span>

            <h2 className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.75rem,5vw,5.5rem)] mb-12">
              membership is limited
            </h2>

            <div className="space-y-5 font-sans text-sm text-offwhite/50 leading-relaxed tracking-wide mb-14">
              <p>
                Blackline maintains a cap of 150 members. Not by accident —
                by design. Every schedule accommodated. Every session private.
                No crowds. No waiting.
              </p>
              <p>
                The application begins with a conversation. We ask about your
                history, your goals, and your schedule. If there is mutual fit,
                we proceed. Waitlist positions are held for sixty days.
              </p>
              <p>
                Membership is not for everyone. That is the point.
              </p>
            </div>

            <Button asChild size="lg">
              <Link href="#contact">request membership</Link>
            </Button>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
