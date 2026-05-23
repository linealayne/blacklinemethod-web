'use client'

import { useState } from 'react'
import { FadeInSection } from '@/components/FadeInSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type FormState = { name: string; email: string; message: string }
type Status = 'idle' | 'loading' | 'success' | 'error'

const INITIAL_FORM: FormState = { name: '', email: '', message: '' }

export function ContactSection() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [status, setStatus] = useState<Status>('idle')

  const update = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus('success')
        setForm(INITIAL_FORM)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      id="contact"
      className="bg-black border-t border-hairline"
      aria-label="Contact"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-44">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          {/* Left: contact info */}
          <FadeInSection>
            <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
              contact
            </span>
            <h2 className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.5rem,4.5vw,4.5rem)] mb-12">
              get in touch
            </h2>
            <div className="space-y-5 font-sans text-sm text-offwhite/40 tracking-wide leading-relaxed">
              <div>
                <p>2401 Dragon St</p>
                <p>Dallas, TX 75207</p>
              </div>
              <div>
                <a
                  href="mailto:info@blacklinemethod.com"
                  className="transition-colors duration-600 hover:text-amber"
                >
                  info@blacklinemethod.com
                </a>
              </div>
              <p className="text-offwhite/20 text-[11px] tracking-[0.1em] pt-2">
                By appointment only.
              </p>
            </div>
          </FadeInSection>

          {/* Right: form or success state */}
          <FadeInSection delay={0.18}>
            {status === 'success' ? (
              <div className="flex flex-col justify-center h-full min-h-[320px]">
                <div className="w-8 h-px bg-amber mb-8" aria-hidden="true" />
                <p className="font-serif text-2xl text-offwhite/80 font-light tracking-wide mb-4">
                  Message received.
                </p>
                <p className="font-sans text-sm text-offwhite/35 tracking-wide leading-relaxed">
                  We will be in touch within two business days.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-7"
                noValidate
                aria-label="Contact form"
              >
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={update('name')}
                    required
                    disabled={status === 'loading'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={update('email')}
                    required
                    disabled={status === 'loading'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us about your background and goals."
                    value={form.message}
                    onChange={update('message')}
                    required
                    rows={5}
                    disabled={status === 'loading'}
                  />
                </div>

                {status === 'error' && (
                  <p
                    className="font-sans text-[11px] text-amber/70 tracking-wide"
                    role="alert"
                  >
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full sm:w-auto"
                >
                  {status === 'loading' ? 'Sending...' : 'Send message'}
                </Button>
              </form>
            )}
          </FadeInSection>
        </div>
      </div>
    </section>
  )
}
