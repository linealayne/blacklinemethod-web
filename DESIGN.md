---
name: Blackline Method
description: A private optimization practice in Dallas. Pass three, "one palette": a dark, precise site lit throughout by its one dramatic moment, a living double helix.
colors:
  black: "#080808"
  ink: "#040404"
  graphite: "#111110"
  offwhite: "#F2F1EC"
  tan: "#D0AE82"
  tan-muted: "#AC906A"
  ember: "#C8965A"
  teal: "#2FA39A"
  violet: "#7A6CF2"
  hairline: "#262624"
  label: "#8C8A84"
  body: "#9C9B96"
  body-dim: "#85847F"
typography:
  wordmark:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "13px"
    fontWeight: 400
    fontVariationSettings: "'opsz' 14, 'SOFT' 0"
    letterSpacing: "0.42em"
    textTransform: "uppercase"
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.35rem, 6vw, 6.1rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "0.045em"
    textTransform: "uppercase"
  h1:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.05rem, 4.6vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "0.055em"
    textTransform: "uppercase"
  h2:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.65rem, 3.05vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "0.065em"
    textTransform: "uppercase"
  h3:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.35rem, 2.2vw, 2.1rem)"
    fontWeight: 400
    lineHeight: 1.16
    letterSpacing: "0.07em"
    textTransform: "uppercase"
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.05rem, 1.4vw, 1.3rem)"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.11em"
    textTransform: "uppercase"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.2em"
    textTransform: "uppercase"
  lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "17px / 18.5px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14.5px / 15.5px"
    fontWeight: 400
    lineHeight: 1.7
  article:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px / 17px"
    fontWeight: 400
    lineHeight: 1.85
rounded:
  hairline: "1px"
  dot: "9999px"
spacing:
  gutter: "24px"
  gutter-md: "48px"
  section: "96px"
  section-md: "128px"
  container: "1440px"
---

# Blackline Method: design system (pass three)

CLAUDE.md is the working manual and is kept in step with this file. Where they disagree, CLAUDE.md wins.

## Overview

Minimal but not bland. Near-black ground, bone type, hairlines, generous space, and one dramatic moment: the hero, a living double helix of glowing particles. The rest of the site is lit by that gene: its two glows, its particles, its strand, at a fraction of the strength.

## Typography

Two faces only.

- **Fraunces, set like the BLACKLINE wordmark** (weight 400, optical size pinned to 14, SOFT 0, uppercase, tracked) for all display type.
- **Inter** for everything that carries information. Labels, nav, and buttons are small, tracked, uppercase. Body is sentence case.
- Never: lowercase transforms, italic display, a third typeface.

## Colour

One palette, defined once as CSS variables in `globals.css` and referenced everywhere (Tailwind, components, the hero scene).

- Ground: black #080808, ink, graphite, hairline.
- Type: bone #F2F1EC and the greys.
- Warm accent: tan #D0AE82. Text highlights, reading points on rules, lit nodes, link underlines, focus, the loading line.
- Light accents: teal #2FA39A and violet #7A6CF2, the gene's two glows. Used as light only (glows, live states, particles, strand illustrations), always quiet outside the hero.
- Ember #C8965A belongs to the ripple inside the hero gene and nowhere else.
- No gradients on text. No stray blue or orange.

## Layout

- `.bl-wrap` container (1440px, 24/48px gutters); `.bl-folio` margin-column grid for section labels; nothing sticks.
- Section tops: a hairline that begins as a short teal-to-violet length, with a glowing particle at each end.
- Hero: headline lower left; beneath a hairline, the place label at left and the one-sentence description at right. No button.
- Inner pages: a sparse still particle field and a soft glow behind the title.

## Motion

- No scroll animation: no pinning, scrubbing, parallax, or sticky labels. The only scroll-related motion is a one-time 0.5s fade and rise as an element enters view (pillar nodes light with it).
- Time-based: the hero scene (idle rotation, rung ripple, scan sweep, colour breathing).
- Action-based: card flips with a decode, pillar node rings, link underlines, button fill sweep, the hero's tilt, scatter, and click pulse.
- Once per session: the loading sequence (the wordmark types, slides to the header, the headline rises, the gene forms; about 3s, skippable). Once: the footer load-in.
- Reduced motion: everything static and readable; a single fade; the hero shows a rendered still.
- The gene's ripples and the card flip are not to be changed unless Layne asks.

## Components

- **Buttons:** hairline frame, label face; the fill sweeps in from the left on hover and out to the right; text inverts to black. At least 44px tall.
- **Links:** label face with a resting low-contrast underline drawn tan on hover, and a drawn 1px arrow that extends.
- **Inputs:** underline-only, tan on focus.
- **Principle cards:** hairline cards with a strand of light on the top edge. Front: tan number, a particle strand, the title. Back: the title (decoded from A T G C during the flip, with zero reflow), the description, a teal and violet edge glow.
- **The rotating pillars gene (home page, protected):** the hero's gene seen closer, turning once every 8.8 seconds with four pillar nodes on its strands. The active node glows tan at the front and that pillar's number, name, and description cross-fade in beside it, one at a time; a 01 to 04 index jumps between them, with a pause control. One screen tall from 1024px; stacked with a horizontal gene, index dots, and swipe below that. Reduced motion or no WebGL: the pillar strand below.
- **Card genes:** each principle card carries a small living gene (slow turn, ember ripple along the rungs); the three differ slightly in pace, twist, leading strand, and density. Still under reduced motion.
- **Pillar strand (the static fallback, and the /method index):** four nodes on one particle strand, each with its number, name, and description. Lit: tan node with a teal and violet halo; hover adds a teal ring.
- **Email:** the consult notification is branded HTML (`src/lib/email.ts`): near-black, the wordmark and a still gene as hosted PNGs, tan accent, spaced-caps labels, label and value rows.
- **Footer:** contacts in Inter, link columns, a hairline with one tan reading point, the full-width wordmark; one-time load-in.

## Do

- Keep every word of copy; change casing only.
- Spend boldness in the hero. Keep the rest disciplined.
- Keep all text real HTML; decoration is aria-hidden.
- Use the tokens. Use `Strand.tsx` for illustration.

## Don't

- Don't tie anything to scroll position.
- Don't use teal or violet as paint (text, fills). They are light.
- Don't write a colour literal in a component.
- Don't add a third typeface or italic display.
