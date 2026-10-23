import type { Metadata } from 'next'
import { ContactSection } from '@/components/sections/ContactSection'

export const metadata: Metadata = {
  title: 'Contact | Blackline Method',
  description:
    'Request a 90-minute private consult. Engagements are limited. Dallas, Texas. Remote and in-person, by appointment.',
}

export default function ContactPage() {
  return (
    <div className="bg-black min-h-screen">
      <ContactSection />
    </div>
  )
}
