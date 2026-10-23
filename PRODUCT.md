# Product

<!-- impeccable:product-schema 1 -->

<!-- Provenance: written during the BL1 premium session from the owner's written brief (session BL1) and the existing style-bible.md. No live interview was possible in this unattended session; facts marked [inferred] come from the brief or the codebase and should be confirmed by Layne. -->

## Platform

web

## Users

- Primary: self-directed adults (men and women) in and around Dallas, Texas, and remote clients elsewhere, who are not sick but are not performing at the level they should. They have usually been told "everything is in range" and left without a next step. [from brief and style bible]
- Situation: evaluating a private, by-appointment practice. They are intelligent, skeptical of marketing, and already under physician care for anything clinical. [from style bible]
- Job: decide whether to request the first consult. Secondary job: understand how Blackline thinks before committing (the Insights essays exist for this). [inferred]

## Product Purpose

Blackline Method is a private optimization practice: a relationship-driven coaching practice working across hormones, training, nutrition, and the structure of how a client lives. It is not a gym, not a clinic, not a facility, and does not prescribe or dispense medication. The site exists to express the positioning, demonstrate how the practice thinks, and convert a small number of well-fitted visitors into consult requests. Success is a qualified consult request, not traffic. [from brief and style bible]

## Positioning

Blackline captures an opportunity the healthcare system leaves open. The common belief is that the doctor's office and a prescription are the whole answer. Blackline challenges that: it is a new approach to modern health built around the individual client rather than around the system, the clock, or the population average.

It does not replace medicine or tell anyone to avoid their doctor. It works in the space conventional care was never built for: going from "nothing is wrong" to performing at the level you should, with prescription intervention coordinated with physicians only when it is truly appropriate rather than as the default. [from brief, section 1]

Mechanism a neighbor cannot truthfully copy: symptoms are read first; bloodwork is read in context against symptoms, history, and goals rather than population reference ranges; four domains are treated as one system; the client is taught to run their own biology rather than be managed. [from style bible]

## Operating Context

- Engagement shape: a ninety-minute intake consult, then a written protocol, then ongoing recalibration (check-ins, re-testing, adjustment). The first ninety days establish the baseline. [from site copy]
- Three engagement tiers (Foundation, Optimization, Comprehensive) determined in the consult; pricing is a conversation, never on the site. [from site copy]
- Hormone optimization guidance is provided by Spencer; pharmaceutical intervention, when indicated, is coordinated with a licensed physician. [from style bible]
- Remote and in-person, by appointment. No physical street address is published. [from style bible]
- Contact flow: the /contact form posts to /api/contact which emails both founders through Resend. Email addresses are published in the footer and on /contact. [from code]

## Capabilities and Constraints

- Stack: Next.js 14 App Router, React 18, Tailwind 3, deployed on Vercel. Upgrading Next or React requires the owner's sign-off. [from code and brief]
- Routes that must keep working unchanged: /, /philosophy, /method, /process, /insights, /insights/[slug], /contact, /api/contact, sitemap, robots, opengraph image. [from brief]
- Hard copy limits (binding): no new medical claims, no promised results, no statistics, no testimonials, no credentials, no prices, nothing that discourages seeing a doctor or taking prescribed medication, no em dashes in new or edited copy, keep existing physician-coordination language. [from brief, section 2]
- Critical content rule (binding, legal): never name any pharmaceutical, peptide, hormone-by-protocol, supplement brand, dose, or compound anywhere on the site. Naming a lab marker for education is permitted. [from style bible]
- Never state a member or client cap. Use "engagements are limited" and "we take a small number of clients". [from style bible]
- The planned physical facility (the Dallas space in references/) does not exist yet and must not appear on the site. [from style bible]
- Positioning critique is structural, never personal: never "broken medical system", never anti-doctor, never fear-based. [from brief and style bible]
- Undecided: Instagram handle for the footer; real Open Graph image; whether RESEND_API_KEY is configured in production. [from style bible TODOs]

## Brand Commitments

- Name: Blackline Method. Wordmark: BLACKLINE, letter-spaced uppercase serif. [from code]
- Voice: confident, precise, calm, slightly provocative. Short declarative lines. Periods, not exclamation points. Never enthusiastic, never salesy. Reference line: "Engagements are limited. That is by design." [from brief and style bible]
- Words never used in copy: elevate, premium, luxury, transform, unleash, unlock, experience the difference, your best self, wellness journey, holistic, cutting-edge, game-changing, world-class, unparalleled, best-in-class. The retired tagline "Train. Recover. Heal." is never used. [from style bible]
- Binding visual constraints volunteered by the owner (recorded, not expanded): near-black background, off-white text, amber accent; lowercase serif headlines (Fraunces), sans body (Inter); restrained tone. One or two closely related tones may be added as documented tokens. [from brief, section 3]
- Feeling to produce: a private members' practice. Quiet confidence. Nothing loud. Every detail considered. [from brief]

## Evidence on Hand

- Four long-form Insights essays in src/content/insights (real, written by the founders). [from code]
- references/: 18 AI-rendered concept images of a future private training facility (facade, floor, lobby, recovery). sequence/: 2 frames of an AI-rendered facade sequence. These describe a facility that does not yet exist and are mood references only; per the content rule they do not ship on the site. [from repo inspection]
- Absent, and must not be fabricated: testimonials, client counts, outcome statistics, credentials, prices, press. [from brief]

## Product Principles

1. The individual over the average. Every claim, visual, and interaction centers one person's biology, never a population.
2. Structural, never personal. The gap in conventional care is a design fact about the system, not a failing of physicians; the site never argues against medicine.
3. Demonstrate thinking, do not sell. The essays, the method, and the process show how the practice reasons; the only ask is a conversation.
4. Scarcity by design, stated quietly. Limited engagements are a fact of how the practice works, never a pressure tactic.
5. Teach, do not manage. The client should leave able to run their own system.

## Accessibility & Inclusion

- Small uppercase labels and body text must meet WCAG AA contrast on the near-black ground. [from brief, section 4]
- prefers-reduced-motion and no-WebGL visitors get a calm static site with everything readable and usable; 3D and pinned motion are decoration only, and all text stays real HTML. [from brief, section 7]
- Interactive explainers are keyboard accessible. [from brief, section 5d]
