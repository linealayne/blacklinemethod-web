# Blackline Method — Style Bible

## Brand Identity

**Name:** Blackline Method  
**Type:** Private optimization practice  
**Location:** Dallas, Texas — remote and in-person, by appointment  
**Founders:** Layne Dowdy and Spencer (last name omitted here — use first names only in copy)  
**Contact:** layne@blacklinemethod.com / spencer@blacklinemethod.com  

Blackline is not a gym. It is not a clinic. It is not a facility. It is a relationship-driven coaching practice that operates at the intersection of four domains: hormones, training, nutrition, and the structure of how a client lives.

---

## Positioning

Blackline is a private optimization practice for men and women who want to run their own biology — not be managed by a system that only acts after something breaks. It is not a gym. It is not a clinic. It is a relationship-driven coaching practice that operates where four domains meet: hormones, training, nutrition, and the structure of how a client lives. Symptoms are read first. Bloodwork is read in context against symptoms, history, and goals — not against population reference ranges. Protocols are designed around how a client actually lives. Hormone optimization guidance is provided by Spencer; pharmaceutical intervention, when indicated, is coordinated with a licensed physician. The goal is to teach clients to understand and operate their own systems, not to make them dependent on a provider.

---

## Voice Rules

### Tone
- Declarative, never enthusiastic.
- Periods, not exclamation points.
- Confident and restrained.
- The implied reader is intelligent, self-directed, and skeptical of marketing.
- "Engagements are limited. That is by design." is the reference tone.

### Words to use
- optimization, protocol, system, biology, private, by appointment, individual, context, synthesis, calibration, substrate, domain, marker, panel

### Words to never use
- elevate, premium, luxury, transform, unleash, unlock, experience the difference
- your best self, wellness journey, holistic, cutting-edge, game-changing
- Train. Recover. Heal. (retired tagline — do not use)
- world-class, unparalleled, best-in-class

### Structural rules
- Lowercase headlines (it is part of the visual identity — do not capitalize)
- No member count cap stated anywhere. Use: "engagements are limited," "we take a small number of clients," "by application only"
- No physical street address anywhere in the codebase
- Critique of standard medical care is always structural, never personal. Never say "broken medical system" or attack physicians as individuals. The system was built for triage; it was simply never built for optimization.

---

## Critical Content Rule

**This site must not name any pharmaceutical, peptide, hormone-by-protocol, supplement-by-brand, dose, or compound.**

Not anywhere. Not in Insights articles, not in page copy, not in comments.

- No "TRT"
- No "GLP-1"
- No peptides by name (no TB-500, no BPC-157, no nothing)
- No specific dosing
- No brand names

**Permitted:** discussing hormone optimization in general terms, naming lab markers when explaining what they are and what they measure (e.g., SHBG, LH, FSH, estradiol, HDH, TSH, free T3 — education about the marker is fine, protocol design is not).

This rule is non-negotiable for legal and brand reasons.

---

## Palette

Pulled from `tailwind.config.ts`:

| Name      | Hex       | Usage                                    |
|-----------|-----------|------------------------------------------|
| black     | `#0A0A0A` | All backgrounds                          |
| offwhite  | `#F5F5F0` | Primary text, logo                       |
| amber     | `#C8965A` | Accents, eyebrows, hover states, dividers|
| hairline  | `#2A2A2A` | Borders, dividers                        |
| muted     | `#6B6B6B` | Secondary text                           |

No new colors. No gradients (except the hero scroll cue fade, which is a transparency ramp, not a color gradient).

---

## Typography

**Serif — Headlines and editorial body:** Fraunces  
- Weight: 300 (light), 400  
- Style: normal + italic  
- Applied as: `font-serif`  
- Use: all headlines (lowercase), italic deks in Insights, pull quotes  

**Sans — UI labels, body copy, navigation:** Inter  
- Weight: 400, 500, 600  
- Applied as: `font-sans`  
- Use: all navigation, labels, body paragraphs, form elements  

**Headline sizing:** `clamp(2.75rem, 5vw, 5.5rem)` for section h2, `clamp(3rem, 8vw, 8rem)` for hero and page h1.  
**Article body:** 16–17px, max-width ~640px, line-height ~1.85.

---

## Insights Editorial Guardrails

### Categories
- Diagnostic Philosophy
- Endocrinology
- Diagnostics
- Training & Physiology

### Article rules
- Essays only. Not listicles. Not "5 tips." Not "ultimate guides."
- 500–800 words. Well-written and readable.
- No invented statistics. Write around a claim that needs a number to be credible — don't fabricate it.
- Same voice as the marketing pages: declarative, restrained, confident.
- No compound names, doses, or protocols (see Critical Content Rule above).
- Each article ends with a byline ("Written by Layne" or "Written by Spencer") and a CTA to /contact.

---

## What the Site Is Not

- Not a gym
- Not a clinic
- Not a supplement company
- Not a physical facility (the 28,000 sqft Dallas space is a long-term vision — it does not exist yet and must not appear on the site)
- Not a membership-based business in the traditional sense (no membership page, no cap stated, no "150 members" language)

---

## Component Design System

### Section rhythm
- Eyebrow: `font-sans text-[10px] tracking-[0.3em] uppercase text-offwhite/20`, margin-bottom: 10 (2.5rem)
- H2: `font-serif font-light text-offwhite lowercase tracking-wider leading-[1.05]`
- Body: `font-sans text-sm text-offwhite/50 leading-relaxed tracking-wide`
- Section padding: `py-32 md:py-44`
- Max content width: `max-w-7xl mx-auto px-6 md:px-12`

### Dividers
- Standard: `h-px bg-hairline`
- Accent: `.hairline-amber` (amber tint)

### Fade animation
- `FadeInSection` wraps all sections — opacity 0 → 1, y 28 → 0, duration 0.9s, easing `[0.22, 1, 0.36, 1]`
- Stagger with `delay` prop (0.08–0.18 increments)

### Button system
- All buttons: `src/components/ui/button.tsx` — do not create alternate button styles
- CTA text: "request a consult" (lowercase, link to /contact only)

---

## TODOs at Launch

- [ ] Set `RESEND_API_KEY` in Vercel environment variables to enable email delivery from contact form
- [ ] Verify domain `blacklinemethod.com` in Resend before sending emails
- [ ] Add Instagram handle to footer once confirmed
- [ ] Add Open Graph image (`/opengraph-image.tsx` already scaffolded — needs real visual)
