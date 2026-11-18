---
name: Blackline Method
description: A private optimization practice in Dallas. Pass two, "the living sequence": a dark, precise site with one dramatic moment, a living double helix.
colors:
  black: "#080808"
  ink: "#040404"
  graphite: "#111110"
  offwhite: "#F2F1EC"
  amber: "#C8965A"
  amber-muted: "#A27A4A"
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

# Blackline Method: design system (pass two)

CLAUDE.md is the working manual and is kept in step with this file. Where they disagree, CLAUDE.md wins.

## Overview

Minimal but not bland. Near-black ground, off-white type, hairlines, generous space, and one dramatic moment: the hero, a living double helix of glowing particles. Everything else is quiet, precise, and still until a person acts on it.

## Typography

Two faces only.

- **Fraunces, set like the BLACKLINE wordmark** (weight 400, optical size pinned to 14, SOFT 0, uppercase, tracked) for all display type: hero, headlines, card titles, pillar names, tier names, the mobile menu, the footer wordmark. All-caps headlines are smaller than the old lowercase giants so they read confident, not shouting.
- **Inter** for everything that carries information. Labels, nav, and buttons are small, tracked, uppercase (the "DALLAS, TEXAS · BY APPOINTMENT" setting). Body is sentence case.
- Never: lowercase transforms, italic display, a third typeface.

## Colour

- Base: black #080808, greys, off-white #F2F1EC.
- Amber #C8965A is the primary accent (hover underlines, numbers, active points, focus).
- Teal #2FA39A and violet #7A6CF2 are used richly inside the hero scene only. Outside the hero, teal is a rare secondary accent: a decoded card's edge glow, the selected pillar's ring, the contact success point. Violet never leaves the hero.
- No gradients on text. No rainbow.

## Layout

- `.bl-wrap` container (1440px, 24/48px gutters); `.bl-folio` margin-column grid for section labels; nothing sticks.
- Section tops: a hairline with a small registration cross at each end.
- Hero: headline lower left, label at left under a hairline, lead and consult button at right; the scene behind and beside the type with vignettes behind the text.

## Motion

- No scroll animation: no pinning, scrubbing, parallax, or sticky labels. The only scroll-related motion is a one-time 0.5s fade and rise as an element enters view.
- Time-based: the hero scene (idle rotation, rung pulse, scan sweep, colour breathing) and the method wheel (34s per turn).
- Action-based: card flips with a decode, wheel hold and release, link underlines, button fill sweep, the hero's tilt, scatter, and click pulse.
- Once: the hero intro (first homepage visit per session, about 3s, skippable) and the footer load-in.
- Reduced motion: everything static and readable; the hero shows a rendered still.

## Components

- **Buttons:** hairline frame, label face; the fill sweeps in from the left on hover and out to the right; text inverts to black.
- **Links:** label face with a resting low-contrast underline drawn amber on hover, and a drawn 1px arrow that extends.
- **Inputs:** underline-only, amber on focus.
- **Sequence cards (principles):** hairline cards. Front: amber number, a base sequence in display caps, a unique helix fragment, the title. Back: the title (decoded from A T G C during the flip), the full description, a teal edge glow.
- **Method wheel:** a ring with tick marks, four pillar nodes as real buttons, an amber front marker, "you" at the centre. Selected: amber node, teal ring, brighter label.
- **Footer:** contacts in Inter, link columns, a hairline with one amber reading point, the full-width wordmark; one-time load-in.

## Do

- Keep every word of copy; change casing only.
- Spend boldness in the hero. Keep the rest disciplined.
- Keep all text real HTML; decoration is aria-hidden.

## Don't

- Don't tie anything to scroll position.
- Don't use teal or violet as decoration outside the hero.
- Don't add a third typeface or italic display.
