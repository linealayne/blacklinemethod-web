import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Constructed per request so builds and previews without RESEND_API_KEY
// still compile; the key is read from the environment at send time.
function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body as {
      name?: string
      email?: string
      message?: string
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      )
    }

    const resend = getResend()
    if (!resend) {
      return NextResponse.json(
        { error: 'Email delivery is not configured.' },
        { status: 500 }
      )
    }

    const { error } = await resend.emails.send({
      from: 'Blackline Method <hello@blacklinemethod.com>',
      to: ['layne@blacklinemethod.com', 'spencer@blacklinemethod.com'],
      replyTo: email.trim(),
      subject: `Consult request from ${name.trim()}`,
      text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
    })

    // The Resend SDK reports failures here rather than throwing.
    if (error) {
      return NextResponse.json(
        { error: 'Failed to send your request. Please try again.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    )
  }
}
