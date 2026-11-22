'use client'

import { useState } from 'react'
import { Reveal } from '@/components/motion/Reveal'
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const validate = (f: FormState) => {
    const errors: Partial<Record<keyof FormState, string>> = {}
    if (!f.name.trim()) errors.name = 'Please add your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.email = 'Please check the email address.'
    if (!f.message.trim()) errors.message = 'A few lines on your background and goals helps us prepare.'
    return errors
  }

  const update = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errors = validate(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      const first = Object.keys(errors)[0] as keyof FormState
      const el = document.getElementById(`contact-${first}`)
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el?.focus({ preventScroll: true })
      return
    }
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
        let message: string | null = null
        try {
          const data = (await res.json()) as { error?: string }
          if (res.status === 400 && data?.error) message = data.error
        } catch {
          /* no JSON body */
        }
        setErrorMessage(message)
        setStatus('error')
      }
    } catch {
      setErrorMessage(null)
      setStatus('error')
    }
  }

  return (
    <section aria-label="Contact">
      <div className="bl-wrap pt-36 md:pt-48 pb-24 md:pb-36">
        <div className="grid md:grid-cols-2 gap-14 md:gap-24">
          {/* Left: contact info */}
          <div>
            <Reveal as="p" className="bl-label bl-tick mb-10">
              request a consult
            </Reveal>
            <Reveal
              as="h1"
              className="bl-h2 mb-12"
            >
              the first conversation.
            </Reveal>
            <Reveal stagger delay={0.08} className="space-y-6 bl-body max-w-sm">
              <p>
                The initial consult is ninety minutes. We cover your history, your current state,
                your goals, and what has and hasn&apos;t worked. Nothing is prescribed in that session.
                What we leave with is a clear picture.
              </p>
              <p>
                Engagements are limited. We take a small number of clients. If there is mutual fit,
                we proceed.
              </p>
              <div className="pt-2 flex flex-col items-start">
                <a
                  href="mailto:layne@blacklinemethod.com"
                  className="group inline-flex items-center min-h-[44px] font-sans text-[17px] md:text-[18px] text-offwhite/90 transition-colors duration-500 hover:text-offwhite"
                >
                  layne@blacklinemethod.com
                </a>
                <a
                  href="mailto:spencer@blacklinemethod.com"
                  className="group inline-flex items-center min-h-[44px] font-sans text-[17px] md:text-[18px] text-offwhite/90 transition-colors duration-500 hover:text-offwhite"
                >
                  spencer@blacklinemethod.com
                </a>
              </div>
              <p className="bl-label text-[10px] pt-2">
                Dallas, Texas · Remote and in-person · By appointment only.
              </p>
            </Reveal>
          </div>

          {/* Right: form or success state */}
          <Reveal delay={0.08} className="md:pt-4">
            {status === 'success' ? (
              <div className="flex flex-col justify-center h-full min-h-[320px]" role="status">
                <span className="block h-[7px] w-[7px] rounded-full bg-teal shadow-[0_0_16px_3px_rgb(var(--bl-teal-rgb)/0.45)] mb-8" aria-hidden="true" />
                <p className="bl-h3 mb-4">
                  Request received.
                </p>
                <p className="font-sans text-sm text-body tracking-wide leading-relaxed">
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
                    aria-invalid={fieldErrors.name ? true : undefined}
                    aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                  />
                  {fieldErrors.name && (
                    <p id="contact-name-error" className="font-sans text-[12px] text-tan tracking-wide">{fieldErrors.name}</p>
                  )}
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
                    onBlur={() => {
                      const trimmed = form.email.trim()
                      const bad = trimmed.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
                      setFieldErrors((prev) => ({ ...prev, email: bad ? 'Please check the email address.' : undefined }))
                    }}
                    required
                    disabled={status === 'loading'}
                    aria-invalid={fieldErrors.email ? true : undefined}
                    aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                  />
                  {fieldErrors.email && (
                    <p id="contact-email-error" className="font-sans text-[12px] text-tan tracking-wide">{fieldErrors.email}</p>
                  )}
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
                    aria-invalid={fieldErrors.message ? true : undefined}
                    aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                  />
                  {fieldErrors.message && (
                    <p id="contact-message-error" className="font-sans text-[12px] text-tan tracking-wide">{fieldErrors.message}</p>
                  )}
                </div>

                {status === 'error' && (
                  <p
                    className="font-sans text-[12px] text-tan tracking-wide"
                    role="alert"
                  >
                    {errorMessage ?? 'Something went wrong. Please try again or email us directly.'}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full sm:w-auto"
                >
                  {status === 'loading' ? 'Sending...' : 'Send request'}
                </Button>
                <p className="font-sans text-xs text-body-dim tracking-wide leading-relaxed">
                  Read by Layne and Spencer only. We reply within two business days.
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
