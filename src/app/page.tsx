import { HeroSection } from '@/components/sections/HeroSection'
import { PhilosophySection } from '@/components/sections/PhilosophySection'
import { SpaceSection } from '@/components/sections/SpaceSection'
import { MembershipSection } from '@/components/sections/MembershipSection'
import { ContactSection } from '@/components/sections/ContactSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PhilosophySection />
      <SpaceSection />
      <MembershipSection />
      <ContactSection />
    </>
  )
}
