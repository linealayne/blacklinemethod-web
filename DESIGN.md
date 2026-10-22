---
name: Blackline Method
description: A private optimization practice in Dallas, rendered as a quiet members' room after hours.
colors:
  black: "#0A0A0A"
  ink: "#060606"
  offwhite: "#F5F5F0"
  amber: "#C8965A"
  amber-muted: "#A27A4A"
  gold: "#E2C48F"
  hairline: "#2A2A2A"
  label: "#8C8A84"
  body: "#9C9B96"
  body-dim: "#85847F"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.75rem, 7vw, 7rem)"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "0.025em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.5rem, 4.8vw, 5rem)"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "0.025em"
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.4rem, 2.5vw, 2rem)"
    fontWeight: 300
    lineHeight: 1.15
    letterSpacing: "0.025em"
  lead:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: "0.025em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0.025em"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.3em"
rounded:
  hairline: "1px"
  dot: "9999px"
spacing:
  gutter: "24px"
  gutter-md: "48px"
  stack-sm: "32px"
  stack: "64px"
  section: "96px"
  section-md: "128px"
  container: "1280px"
components:
  button-primary:
    backgroundColor: "transparent"
    textColor: "{colors.amber}"
    typography: "{typography.label}"
    rounded: "{rounded.hairline}"
    padding: "12px 32px"
  button-primary-hover:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.black}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.body}"
    rounded: "{rounded.hairline}"
    padding: "12px 32px"
  button-ghost-hover:
    textColor: "{colors.amber}"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.offwhite}"
    rounded: "{rounded.hairline}"
    padding: "8px 16px"
    height: "48px"
  link-quiet:
    textColor: "{colors.amber-muted}"
    typography: "{typography.label}"
  link-quiet-hover:
    textColor: "{colors.amber}"
  nav-link:
    textColor: "{colors.label}"
    typography: "{typography.label}"
  nav-link-hover:
    textColor: "{colors.amber}"
---

# Design System: Blackline Method

## Overview

**Creative North Star: "The After-Hours Study"**

A private practice should feel like a room you were let into, not a page you landed on. The whole system is one dark room lit by a single warm lamp: near-black walls, off-white paper, and amber light used only where a hand would rest. Nothing is loud. Headlines are set lowercase in a light serif so that even the biggest statement reads as a quiet voice, and body copy sits in a neutral sans that stays out of the way. Density is low on purpose; the calm is the point, but every empty region is sized, never leftover.

Motion is the room's atmosphere rather than its furniture. Text arrives line by line through a mask, as if a page were being turned; body copy rises a hand's width and settles. The two three-dimensional moments (dust gathering into a double helix behind the opening line, and four pillars orbiting "you") are decoration behind real HTML, and the page must be complete, readable, and usable with both switched off. Reduced motion means a still room: nothing hidden, nothing pinned, nothing drifting.

Confirmed rejections: no imagery of a facility, no stock photography, no gradients as decoration (the hero vignette and scroll cue are transparency ramps), no bright accents beyond amber and its two tonal relatives, no exclamation marks, and none of the category's sales vocabulary (see PRODUCT.md).

**Key Characteristics:**
- One warm accent (amber) and its two tones (muted amber for small labels, gold for the glowing point and hover light); everything else is black, off-white, and warm grey.
- Lowercase light serif headlines; sentence-case Inter body; tracked uppercase 11px labels that stay quiet but clear 4.5:1.
- Hairlines, not boxes. Depth comes from light (soft amber glow, additive particles), never from drop shadows.
- Slow, precise easing (expo and power3 out); never bouncy; reveals once, on scroll.
- Two 3D moments only. Nothing else competes with them.

## Colors

A near-black room with warm paper and a single amber lamp; greys are warmed toward the paper, never cold.

### Primary
- **Amber** (#C8965A): the accent. Button strokes and hover fills, the drawn timeline line, the orbit ring, the loader rule, large labels, focus rings. Used on well under ten percent of any screen.
- **Muted Amber** (#A27A4A): amber at small-label strength. Section labels in amber, quiet links ("Explore the full method"), category tags, pillar names. Passes 5.1:1 on black so 10px to 11px tracked text stays readable.
- **Gold** (#E2C48F): the highlight. The glowing "you" point, the warm third of the hero particles, hover light on buttons and the active orbit node. Never for text blocks.

### Neutral
- **Black** (#0A0A0A): every page ground and the hero canvas clear colour.
- **Ink** (#060606): the deeper black for the loader, the route veil, and the mobile menu, so an overlay reads as a layer in front of the room rather than more wall.
- **Off-white** (#F5F5F0): headlines, the wordmark, input text, the brightest statement in a contrast pair.
- **Body** (#9C9B96): primary body copy (7.2:1).
- **Body Dim** (#85847F): secondary body copy, deks, footer meta, placeholders (5.4:1).
- **Label** (#8C8A84): quiet uppercase labels, section numbers, nav links at rest, footer links (5.7:1).
- **Hairline** (#2A2A2A): every rule, divider, border, and input stroke.

### Named Rules
**The One Lamp Rule.** Amber is light, not paint. It appears as a stroke, a line, a glow, or a word; it never fills a region larger than a button.

**The Warm Grey Rule.** Secondary text is tinted toward the paper (#F5F5F0), never toward blue. Every grey on this site is a step between the wall and the page.

**The AA Floor Rule.** No text smaller than 18px drops below 4.5:1 on #0A0A0A. Off-white opacity utilities below 60% are not used for small text; use the named tokens instead.

## Typography

**Display Font:** Fraunces (with Georgia, serif), weights 300 and 400, normal and italic.
**Body Font:** Inter (with system-ui, sans-serif), weights 400, 500, 600.

**Character:** A light, slightly soft serif set lowercase against a neutral sans. The serif carries every statement and every italic aside; the sans carries information and controls. The pairing reads as a handwritten line of argument above typed notes.

### Hierarchy
- **Display** (300, clamp(2.75rem, 7vw, 7rem), 1.05): the hero line and page titles. Always lowercase, always ends with a period. Tracked +0.025em.
- **Headline** (300, clamp(2.5rem, 4.8vw, 5rem), 1.05): section statements. The pinned principles go larger (clamp(2.9rem, 9vw, 8.5rem)) because each one owns the screen alone.
- **Title** (300, clamp(1.4rem, 2.5vw, 2rem), 1.15): article titles in lists, the contrast pairs in "a different model of care" (1.6rem to 2.1rem).
- **Lead** (300 italic, 1.125rem to 1.25rem, 1.6): the italic serif aside under a title, set in Body or Body Dim.
- **Body** (400, 15px desktop, 14px phones, 1.65, +0.025em): paragraphs, capped at a 28rem measure (about 65ch). Articles use 16px to 17px at 1.85 inside a 640px column.
- **Label** (400, 11px, 0.3em tracking, uppercase): section labels, numbers, nav, tags, button text. 10px only inside tight diagrams.

### Named Rules
**The Lowercase Rule.** Headlines are lowercase and end with a period. The period is the brand's full stop: declarative, never enthusiastic.

**The Quiet Label Rule.** A label is quieter than the headline it introduces, but it is never invisible: Label grey or Muted Amber, never an opacity below the AA floor.

## Layout

One container (max 1280px) with 24px gutters on phones and 48px from 768px. Sections stack with 96px of vertical padding on phones and 128px on desktop, separated by a hairline rule at the top of each section; the homepage pinned sections (principles, method) instead fill one viewport and are scrubbed over 250% to 320% of viewport height. Two-column sections use a single 2-column grid with 48px to 96px column gaps that collapse to one column below 768px; on phones the method orbit sits above its text and only the orbit block is pinned, so the heading scrolls normally.

Rhythm inside a section: label, then 32px, then headline, then 32px, then body or the section's device. More space above a heading than below it. Lists of entries (insights, steps) are divided by hairlines with 36px to 48px of padding, never cards. The desktop navigation appears from 1024px; below that the full-screen menu takes over, because at tablet widths the five nav items and the consult button cannot share a row.

## Elevation & Depth

Flat by default. There are no drop shadows anywhere in the system; surfaces are separated by hairlines and by the three blacks (ink behind black behind content). Depth is expressed as light: the additive particle field with depth fade, the soft radial glow on the orbit's centre point, a 48px amber halo under a hovered primary button, and a 16px amber glow on a timeline dot once the line reaches it. The hero also uses a soft radial darkening behind the headline so the words always sit in front of the particles.

### Named Rules
**The Light Not Shadow Rule.** If something needs to come forward, give it a warm glow or a brighter stroke. Never a grey shadow.

## Shapes

Rectilinear with 1px corners. Buttons, inputs, and tier panels are hairline-stroked rectangles with a 1px radius so edges render cleanly. The only circles are points: timeline dots, orbit nodes, the slider thumb, and the glowing "you". The signature silhouette is the thin line: a drawn rule under the loader wordmark, the contrast rule between "the system" and "blackline", the timeline, the orbit ring, and the 1px underline that draws under a hovered title.

## Components

### Buttons
- **Shape:** hairline rectangle, 1px radius; 12px 32px padding (default), 16px 48px (large), 8px 20px (small); uppercase 12px label, 0.2em tracking.
- **Primary:** amber stroke and amber text on transparent; hover fills amber with black text and (with `glow`) a 48px amber halo; active scales to 0.98 in 150ms.
- **Ghost:** hairline stroke with body-grey text; hover turns stroke and text amber.
- **Magnetic (closing CTA only, desktop pointers only):** the button follows the pointer by 28 percent inside a 56px zone and eases back on leave.

### Inputs / Fields
- **Style:** transparent, hairline stroke, 48px tall, 16px side padding, off-white text, Body Dim placeholder, amber caret.
- **Focus:** stroke turns amber (no ring). Every other focusable element gets a 1px amber outline offset 3px.
- **Disabled:** 40 percent opacity.

### Navigation
- Fixed 80px bar; transparent until 100px of scroll, then black at 90 percent with a blur and a hairline. Wordmark is the serif BLACKLINE tracked 0.35em. Desktop links are Label grey, amber on hover, from 1024px. Below that: a hamburger opens a full-screen Ink overlay whose five lowercase serif links slide up through masks in sequence; Escape closes; focus moves to the close control and returns to the trigger.

### Section label and headline
- Label (bl-label), 32px, then a lowercase serif headline revealed line by line through masks (SplitReveal). Body copy follows with a fade-and-rise (Reveal). Both fire once, when the element passes 86 percent of the viewport.

### Contrast pair (a different model of care)
- Three rows divided by hairlines: "the system" line on the left in off-white at 85 percent, a short amber rule, the "blackline" line on the right. As rows reveal, the left side dims to 42 percent while the right brightens to full.

### Illustrative range (optimal is not a range)
- A 56px track with a wide hairline reference band and a narrower amber-tinted optimal band; a 1px off-white marker with a dot that can be dragged or moved with arrow keys; a serif status line that crossfades between three states. Labelled "Illustrative"; carries no numbers.

### Timeline
- A hairline rail (horizontal from 768px, vertical on phones) with an amber line that draws as the section is scrolled; each dot lights amber with a 16px glow and its text rises from 22 percent opacity as the line reaches it; a bracket labelled "the first ninety days" spans the first two steps on desktop.

### Entry list (insights)
- Hairline-divided rows; muted-amber category tag, serif title, Body Dim dek, "Read →" on the right. Hover draws a 1px amber underline under the title, nudges the arrow 4px, and lifts the row 2px. No layout shift.

### Signature: the two 3D moments
- **Hero field:** 4,200 points on desktop (1,500 on phones), amber and gold, additive, dpr capped at 1.5, drifting as dust, gathering into a slowly rotating double helix over 5.5 seconds after the loader, breathing, pushed by the cursor, loosening and fading as the hero scrolls away. Bloom on desktop only. Behind a radial darkening so the headline always reads.
- **Orbit:** a gold "you" point with a soft glow, four amber nodes on a tilted ring (one thin amber line, one fainter dashed halo), labels in Label grey that turn gold when in front. Scrubbed by scroll on the homepage; slow idle rotation on /method. Static SVG diagram when WebGL or motion is unavailable.

## Do's and Don'ts

### Do:
- **Do** set every headline lowercase in Fraunces 300 and end it with a period.
- **Do** use the named greys (Label #8C8A84, Body #9C9B96, Body Dim #85847F) for small text; they are the AA floor.
- **Do** reveal text once with a masked line reveal (headlines) or a 24px rise (body), eased with expo.out or power3.out over about a second.
- **Do** separate content with 1px hairlines (#2A2A2A) and 96px to 128px of section padding.
- **Do** keep every 3D or scroll device decorative: real HTML underneath, aria-hidden on the canvas, a static fallback for reduced motion and no WebGL.
- **Do** keep touch targets at least 44px tall for links in lists and the footer.

### Don't:
- **Don't** add a colour outside the ten tokens, or use amber as a fill larger than a button.
- **Don't** use off-white at opacities below 60 percent for text under 18px.
- **Don't** add drop shadows, cards with backgrounds, rounded corners above 1px (except dots), or gradients as decoration.
- **Don't** add a third 3D moment, autoplaying motion inside body copy, or bouncy easing.
- **Don't** write an em dash in new copy; use a period or a comma.
- **Don't** show any facility imagery, testimonials, statistics, prices, credentials, or compound names.
