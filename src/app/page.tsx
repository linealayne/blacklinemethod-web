import { HeroSection } from '@/components/sections/HeroSection'
import { DifferentModelSection } from '@/components/sections/DifferentModelSection'
import { PrinciplesSection } from '@/components/sections/PrinciplesSection'
import { RangeExplainer } from '@/components/sections/RangeExplainer'
import { MethodSection } from '@/components/sections/MethodSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { InsightsTeaserSection } from '@/components/sections/InsightsTeaserSection'
import { ClosingSection } from '@/components/sections/ClosingSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DifferentModelSection />
      <PrinciplesSection />
      <RangeExplainer />
      <MethodSection />
      <ProcessSection />
      <InsightsTeaserSection />
      <ClosingSection />
    </>
  )
}
