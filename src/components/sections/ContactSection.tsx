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
    <section aria-label="Contact">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-44">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          {/* Left: contact info */}
          <FadeInSection>
            <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20 mb-10">
              request a consult
            </span>
            <h1 className="font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05] text-[clamp(2.5rem,4.5vw,4.5rem)] mb-12">
              the first conversation.
            </h1>
            <div className="space-y-6 font-sans text-sm text-offwhite/40 tracking-wide leading-relaxed max-w-sm">
              <p>
                The initial consult is ninety minutes. We cover your history, your current state,
                your goals, and what has and hasn&apos;t worked. Nothing is prescribed in that session.
                What we leave with is a clear picture.
              </p>
              <p>
                Engagements are limited. We take a small number of clients. If there is mutual fit,
                we proceed.
              </p>
              <div className="pt-2 space-y-2">
                <a
                  href="mailto:layne@blacklinemethod.com"
                  className="block transition-colors duration-600 hover:text-amber"
                >
                  layne@blacklinemethod.com
                </a>
                <a
                  href="mailto:spencer@blacklinemethod.com"
                  className="block transition-colors duration-600 hover:text-amber"
                >
                  spencer@blacklinemethod.com
                </a>
              </div>
              <p className="text-offwhite/20 text-[11px] tracking-[0.1em] pt-2">
                Dallas, Texas · Remote and in-person · By appointment only.
              </p>
            </div>
          </FadeInSection>

          {/* Right: form or success state */}
          <FadeInSection delay={0.18}>
            {status === 'success' ? (
              <div className="flex flex-col justify-center h-full min-h-[320px]">
                <div className="w-8 h-px bg-amber mb-8" aria-hidden="true" />
                <p className="font-serif text-2xl text-offwhite/80 font-light tracking-wide mb-4">
                  Request received.
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
                aria-label="Consult request form"
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
                  <Label htmlFor="contact-message">Background and goals</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us about your background, current situation, and what you're trying to accomplish."
                    value={form.message}
                    onChange={update('message')}
                    required
                    rows={6}
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
                  {status === 'loading' ? 'Sending...' : 'Send request'}
                </Button>
              </form>
            )}
          </FadeInSection>
        </div>
      </div>
    </section>
  )
}
