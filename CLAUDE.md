# Blackline Method: working notes for Claude

Blackline Method is a live, real business: a private optimization practice in Dallas (hormones, training, nutrition, and the structure of how a client lives). This file is the operating manual for the site. PRODUCT.md holds product truth, DESIGN.md holds the visual system, style-bible.md holds the editorial rules. Read all three before touching copy or design.

## Do not change without Layne asking (binding)

- **The gene's ripples.** The amber pulse that travels down the rungs one base pair at a time, the teal scan sweep, and the click pulse in the hero scene: their timing (`pulseRate`, `scanEvery`, `scanDuration`, `clickPulseDuration` in `helix-config.ts`), their colour (`--bl-ember-rgb`), and their shader code in `HelixScene.ts`. Layne loves these exactly as they are.
- **The rotating pillars gene.** The home page section "Four pillars. One system.": the gene that turns continuously and brings each pillar's node to the front in order, the one-pillar-at-a-time cross-fade beside it, the 01 to 04 index, the pause control, the phone layout with swipe, and the fact that the section is exactly one screen from 1024px (`components/pillars/`, `MethodSection.tsx`, "The rotating gene" in `globals.css`). It is a staple of the site. Tuning knobs exist in `pillars-config.ts`, but do not change how it looks, moves, or is laid out unless Layne asks.
- **The card flip.** The principle cards flip on hover, focus, or tap, and the title decodes from A T G C as the card turns (`PrinciplesSection.tsx`, `.bl-card` in `globals.css`). Restyle around it if asked; never remove or re-time the flip or the decode.

## Positioning (the site must make visitors feel this)

- Blackline captures an opportunity the healthcare system leaves open. The common belief is that the doctor's office and a prescription are the whole answer. Blackline challenges that: a model of care built around the individual client rather than the system, the clock, or the population average.
- It does not replace medicine or tell anyone to avoid their doctor. It works in the space conventional care was never built for: from "nothing is wrong" to performing at the level you should, with prescription intervention coordinated with physicians only when it is truly appropriate, never as the default.
- High end, private, one of a kind. Limited clients by design. The feeling is a private members' practice: quiet confidence, nothing loud or salesy, every detail considered.
- Voice: confident, precise, calm, slightly provocative. Short declarative lines. Never combative, never anti-doctor, never fear-based. Headlines end with a period; they are set in display capitals by CSS (the source text keeps its original casing).

## Copy rules (binding)

- No medical claims, promised results, statistics, testimonials, credentials, or prices. Nothing that discourages seeing a doctor or taking prescribed medication. Keep the existing physician-coordination language.
- Never name a pharmaceutical, peptide, hormone-by-protocol, supplement brand, dose, or compound. Naming a lab marker for education is fine.
- No em dashes in new or edited copy (use a period or a comma). Pre-existing article bodies still contain some; leave them unless editing that line.
- Never state a client cap. Use "engagements are limited" or "we take a small number of clients".
- The planned facility (references/) does not exist yet and never appears on the site.
- Banned words: elevate, premium, luxury, transform, unleash, unlock, experience the difference, your best self, wellness journey, holistic, cutting-edge, game-changing, world-class, unparalleled, best-in-class.

## Stack and commands

- Next.js 14.2 App Router, React 18, Tailwind 3, TypeScript. Deployed on Vercel (production = `main`). Do not upgrade Next or React without asking.
- Motion: gsap 3.15 core (Draggable loads on demand for the range explainer only). No ScrollTrigger, no Lenis, no smooth scrolling. Hero: three 0.160 (plain three.js, no React renderer, no drei, no postprocessing).
- `npm run dev` for development. `npm run build` needs `RESEND_API_KEY` set; locally use a placeholder: `RESEND_API_KEY=re_local_build_placeholder npm run build`. The contact route reads the real key at request time on Vercel.
- Type check: `npx tsc --noEmit -p .`. Lint: `npm run lint`.
- Playwright is a dev dependency (`npx playwright install chromium` once). Scripts live in `.playwright-mcp/` (gitignored, so they may need recreating): `shoot.js <outdir> <base>` (every page, 1440 and 390, top and full page), `frames.js <outdir> <url> <w> <h> <ms,ms,...>` (timed frames from a fresh session: the loading sequence; `REDUCED=1` for reduced motion), `sect.js <outdir> <url> <w> <h> name=selector[@hover|@full]` (one section, optionally hovered or tapped), `checks.js <base>` (overflow at 1440/1024/768/390/375, 44px tap targets, card title reflow, scroll hijack, reduced motion, loader handoff position, once per session, skip), `lh.sh <url> <name> [runs]` (Lighthouse mobile), `rebuild.sh` (build and serve on 3017), `rotor.js <outdir> <base> <w> <h> [ms,ms,...]` (the pillars section at several moments, and whether it fits one screen; `JUMP=n`, `SWIPE=1`, `REDUCED=1`), `cards.js <outdir> <base> <w> <h>` (the three card genes over time, that they pause off screen, a flip), `email-preview.ts` (run with `npx tsx`, writes the consult email) and `email-shot.js` (screenshots it), `email-assets.js` (renders the two email PNGs). Launch Chromium with `--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist` on this Windows machine (`--use-angle=metal` on a Mac) to get the real GPU headless.
- Port 3000 on this machine belongs to another project; use 3017 for `next start` and 3018 for `next dev`. Stop `next dev` before building (they share `.next`).
- Rollback points: git tag `pre-revamp-live` (the site before the revamp) and `pre-round2` (before the rotating pillars gene, the living card genes, and the branded email).

## Design system (pass three, "one palette")

Minimal, dark, precise, with one dramatic moment (the hero gene). Everything else on the site is lit by that gene: the same two glows, the same particles, at a fraction of the strength.

**Two typefaces, no others.**

- Display: Fraunces, set exactly as the nav wordmark renders: weight 400, optical size 14, SOFT 0, uppercase, tracked. That is Google's static 400 file, which is what `layout.tsx` loads (18 KB instead of the 118 KB variable font; same glyphs and widths). Only weight 400 exists: do not set display type bold or italic. Used for every headline, card title, pillar name, tier name, the menu, and the footer wordmark. Utilities in `globals.css` (`@layer components`): `.bl-display` (hero only, clamp 2.35rem to 6.1rem, 0.045em), `.bl-h1` (page titles, to 4.6rem, 0.055em), `.bl-h2` (section statements, to 3rem, 0.065em), `.bl-h3` (to 2.1rem, 0.07em), `.bl-title` (entries, to 1.3rem, 0.11em), `.bl-serif-caps` (the face without a size), `.bl-wordmark` (13px, 0.42em: the nav logo).
- Text: Inter. Labels, nav, buttons: `.bl-label` (10.5px, 500, 0.2em, uppercase), the face of "DALLAS, TEXAS · BY APPOINTMENT". Body: `.bl-body` (14.5/15.5px, sentence case) and `.bl-lead` (17/18.5px, sentence case).
- No lowercase transforms, no italic display type. Casing changes are CSS only.

**Colour: one palette, defined once.** Every colour is an RGB triplet in `:root` in `src/app/globals.css` (`--bl-<name>-rgb`). `tailwind.config.ts` only points at those variables (`text-tan/60`, `bg-teal`, `border-hairline` all resolve to them), and the hero scene reads the same variables at start-up. Never write a hex or `rgba()` literal in a component: use a Tailwind token class or `rgb(var(--bl-<name>-rgb) / <alpha>)`.

| token | value | role |
| --- | --- | --- |
| black | #080808 (8 8 8) | page ground |
| ink | #040404 | loading screen, route veil, mobile menu |
| graphite | #111110 | ghost-button hover fill |
| offwhite (bone) | #F2F1EC (242 241 236) | type, primary button |
| tan | #D0AE82 (208 174 130) | the warm accent: text highlights (numbers, small labels), reading points on rules, lit pillar nodes, link underlines on hover, focus rings, form errors, the loading line |
| tan-muted | #AC906A | "Optimal for you" label |
| teal | #2FA39A (47 163 154) | the gene's first glow. Used as light: the particle that starts each section rule, live and selected states, card edge glow, strand illustrations, the contact success point |
| violet | #7A6CF2 (122 108 242) | the gene's second glow. Always paired with teal: rule gradients, card and page glows, strand illustrations |
| ember | #C8965A (200 150 90) | the ripple that travels along the rungs of a living gene (the hero, the pillars gene, the card genes) ONLY. Not an interface colour. Do not change it |
| hairline / rule-strong | #262624 / #5E5E5B | rules and borders / input underlines |
| label / label-strong / lead / body / body-dim | #8C8A84 / #C9C7C0 / #B9B8B2 / #9C9B96 / #85847F | text greys (all AA on black) |

`--bl-strand` is the teal-to-violet gradient used for short lit rules. Teal and violet are light, never paint: no teal or violet text, no solid fills, no gradients on type. Nothing blue or orange exists outside this table. The favicon and the Open Graph image keep their own marks.

**The gene's language outside the hero** (all static or answering a person; nothing is scroll-driven):

- Section rules (`.bl-rule`): a hairline that starts as a short teal-to-violet length. Its ends (`.bl-cross`) are single glowing particles, teal on the left, violet on the right.
- Inner pages (`.bl-page` on the page wrapper): a sparse still particle field and a soft violet and teal glow behind the page title. `.bl-glow` does the same for the closing statement. Pure CSS.
- `components/Strand.tsx`: the helix drawn small and still, as particles. `HelixFragment` (the still form of the card genes) and `StrandRail` (an endless strand as an SVG pattern, vertical or horizontal: the /method index and the static pillar list). `components/LivingStrand.tsx` is the same fragment alive on a small 2D canvas (the cards). Use these for any new illustration.
- Hover and selected states glow teal (nav's current-page particle, pillar node ring, card edge).

**Layout and detail.** `.bl-wrap` (max 1440px, 24/48px gutters). `.bl-folio` (a 3/12 margin column for the section label, 9/12 content; nothing sticks). Static film grain (`#bl-grain`, 0.035). Links: `.bl-link` + `.bl-underline` (resting low-contrast underline, drawn in tan on hover) + `.bl-arrow` (a drawn 1px arrow that extends). Buttons (`ui/button.tsx`): hairline frame, the fill sweeps in from the left on hover and out to the right on leave, text inverts; every size is at least 44px tall. Inputs are underline-only, tan on focus.

## No scroll animation (binding)

Nobody should ever feel stuck or hijacked while scrolling. No pinning, no scroll-scrubbed timelines, no parallax, no sticky section labels, no smooth-scroll libraries. The only scroll-related motion is a one-time 0.5s fade and 12px rise when an element first enters view (`Reveal`, CSS-driven, never delays content, off for reduced motion). Everything else that moves is time-based (the hero, the rotating pillars gene, the card genes: all of them stop when off screen) or answers a person's action (card flips, hovers, the pillar index).

## Motion system

Flags are set on `<html>` before first paint by the inline script in `src/lib/flags.ts`: `bl-motion` or `bl-reduced`, `bl-nowebgl`, `bl-desktop`, and on the first page of a session `bl-intro` (then `bl-intro-b`, then `bl-intro-done`) or, with reduced motion, `bl-fade`. Later `bl-hydrated`. sessionStorage key `bl-intro-seen`. `useMotion()` (MotionProvider) exposes `mounted`, `reduced`, `webgl`, `introDone`.

### The loading sequence (spec)

Once per session (sessionStorage), on whichever page is opened first, when motion is allowed. About 3 seconds. `components/motion/Loader.tsx` is server-rendered markup; the whole sequence is CSS (`globals.css`, "The loading sequence") driven by classes the inline flags script sets on a clock, so it runs before React hydrates. Timings live in `INTRO` (`src/lib/flags.ts`) and the matching CSS delays; change them together.

| time | what happens |
| --- | --- |
| 0.10s | Dark screen (`ink`). BLACKLINE types out one letter every 0.09s in the centre, set exactly as the header logo (`.bl-wordmark`). The small tan loading line fills beneath it. |
| 1.15s (`bl-intro-b`) | The line fades; the wordmark slides up and left onto the header logo over 0.8s. |
| 1.45s | The dark screen lifts (0.5s). On the homepage the gene starts to form: scattered particles drift together into the helix (`introDuration` 1.5s), then the ripples begin. |
| 1.70s | The hero headline rises word by word through masks; the rule draws; the label and lead fade up. |
| 3.00s (`bl-intro-done`) | The overlay is removed and the real header logo shows in the same pixels. |

- **No jump, no font swap:** the loader wordmark is laid out in the header logo's exact resting place (same wrapper, class, padding, and the shared `WordmarkLetters` spans) and only a CSS transform puts it in the centre. `checks.js` asserts the two boxes match to 0.05px.
- **No layout shift:** the page is fully laid out and painted under the opaque screen from the first frame; the reveal only uses transform and opacity.
- **Skip:** any click, key, wheel, touch, or scroll jumps straight to the final state (`bl:intro-skip`, then `bl:intro-done` events); the gene finishes forming in 0.4s.
- **Reduced motion:** no loader, no typing. One 0.5s fade of the page (`bl-fade`) with the gene already formed (the static still).
- No WebGL: the sequence still plays; the hero shows the still.

### Everything else

- `Reveal` (`motion/Reveal.tsx`): the one-time entrance. `stagger` animates children 0.06s apart (max 0.18s). Content shows after 2.5s if JS never arrives.
- `PageTransition`: fade through black between routes (0.22s in, 0.3s out).
- Mobile menu: CSS (`#bl-mobile-menu.is-open`), display-caps links slide up through masks.
- `useGsapEffect` loads gsap after the first interaction; only the range explainer uses it (Draggable).
- Reduced motion: no loading sequence, the static hero still, cards show their back content with still strands, the pillars as a static strand with all four listed in full, no grain drift.

## The hero: "the living sequence" (`src/components/hero/`)

- `helix-config.ts`: every tuning constant (`HELIX`: geometry, counts per device tier, sizes, camera, layout for desktop and phone, idle motion, intro timing, interaction feel, DPR cap). **Tune here**, except the ripples (see the top of this file).
- `HelixScene.ts`: plain three.js. One `Points` object for both strands and the rung particles (spins), one for the ambient field (world space), `LineSegments` for rungs and backbones, three tilted scan rings with travelling bright arcs, a scan ring that sweeps down the strand every `scanEvery` seconds, a breathing glow plane. All animation runs in the vertex shaders from uniforms: formation from scattered particles (per-particle stagger and swirl; held at the scattered state until `holdUntil` while the loading screen is up), the ember rung pulse one at a time down the strand, teal scan band, click pulse, cursor scatter (screen-space push that springs back), colour breathing between teal and violet. Colours are read from the CSS tokens. The helix tilts toward the cursor with a damped spring. DPR capped at 2 and stepped down to 1.25 once if frames average over 22ms. `dispose()` frees every geometry and material and loses the context.
- `helix.worker.ts`: one worker script for both gene scenes (the hero, and the pillars gene via `init-pillars`), so three.js is downloaded once. The scene runs in a web worker on an OffscreenCanvas wherever the browser supports it, so three.js evaluation, shader compilation, and every frame stay off the page's main thread (this is what keeps the Lighthouse mobile score at or above the old site's; do not move it back). `HelixScene.ts` therefore touches no DOM and no `window`: sizes, colours, and pointer positions are passed in. Without OffscreenCanvas, or if the worker cannot get a context, the same scene runs on the main thread.
- `HeroHelix.tsx`: the React wrapper (loaded with `next/dynamic`, `ssr: false`). Starts the worker (or the main-thread fallback), reads the palette tokens, picks the device tier (phones always get the lighter `low` or `mid` particle counts), runs the scene only while the hero is on screen and the tab is visible, re-measures on resize, wires input (pointer: tilt, scatter, click pulse; touch: horizontal drag tilts with `touch-action: pan-y` so vertical drags always scroll the page, tap pulses; nothing calls preventDefault). Context loss falls back to the still. There are no labels, bars, or connector lines over the gene.
- `HeroSection.tsx`: two things only. The headline, lower left, and beneath a hairline one quiet row: "Dallas, Texas · By appointment" under the headline's left edge and the one-sentence description on the right under the gene, on a shared baseline (stacked on phones). No button in the hero: "Request a consult" lives in the header (and the mobile menu). Static fallback: `.bl-helix-still` with `public/hero/helix-desktop.jpg` and `helix-mobile.jpg`, only downloaded when reduced motion, no WebGL, or a runtime failure applies.

## Interactive sections

- `PrinciplesSection` (the three cards): `CARDS` knobs (decode timing, the gene on each card). Front: number, a living gene (`LivingStrand`), the title. Back: number, a small living gene that sends one ripple from its start on the flip, the decoding title, the description, a teal and violet edge glow. Each card's gene turns continuously with an ember ripple along its rungs, and the three differ on purpose (`CARDS.fragments`): 01 is the slowest with the fewest twists and teal leading, 02 the middle pace with violet leading, 03 wound tighter, a little faster, and denser. They draw only while on screen; all canvases share one animation frame; reduced motion gets the still `HelixFragment`. Hover or keyboard focus flips a card in 3D (desktop); touch: tap flips, tap again flips back, with a "Tap to reveal" hint on touch devices only. The title types with zero reflow: each character sits in a cell already as wide as its final glyph (`DecodeTitle`, `.bl-decode-cell`), so line breaks and height are final before the first letter changes. Description text always in the DOM.
- **The rotating pillars gene** (`components/pillars/`, PROTECTED, see the top of this file). `PillarScene.ts` is the hero's gene seen closer: it imports the hero's shaders, so the ember pulse, the teal scan sweep, and the bright front are identical, and adds four nodes on the strands. The gene turns once every 8.8 seconds (`turnSeconds`). The nodes sit a quarter turn apart, so the turn is the clock: every 1.25 turns (11 seconds) the next node comes to the front, lights in tan, and that pillar's number, name, and description cross-fade in beside it (`PillarGene.tsx`). Only one pillar's text shows at a time; all four stay in the DOM as real text for screen readers. The 01 to 04 index jumps to a pillar and the gene springs the short way round to that node. Time-based, never scroll-driven. The turn rests while the pointer or keyboard focus is on the text or index, stops with the pause control (WCAG 2.2.2), and the scene sleeps off screen or in a hidden tab. Nothing is downloaded or started until the section is close to the viewport, so it costs the first load nothing. Desktop (1024px and up): the section is exactly one screen below the header (`min-height: calc(100svh - var(--bl-header))`; it only grows if the viewport is too short for the text). Below 1024px: the gene lies across the top, the active pillar's text sits under it, the index is four tappable dots, and a horizontal swipe changes pillar (`touch-action: pan-y`, vertical drags scroll the page); it fits one screen at 390x844. Phones get the `low` or `mid` particle counts. Reduced motion, no WebGL, or no JavaScript: `PillarStrand` (a still strand with all four pillars listed in full) shows instead; the switch is CSS on the `<html>` flags.
- `PillarStrand` (`components/PillarStrand.tsx`): the still fallback above. `PillarStrandNav` on /method is the same strand laid horizontally as four links that jump to each pillar's section; leave it as it is.
- `RangeExplainer`: `RANGE` knobs; draggable marker with role="slider".
- `ProcessTimeline`: static; hovering a step lights its point.
- `Footer`: one-time load-in when it enters view (hairlines draw, wordmark letters rise with a 0.045s stagger, contacts and links fade up in sequence, about 1.3s).

## Sections

Homepage order: hero (the living sequence), a different model of care, principles (cards), optimal is not a range, the method (the rotating pillars gene), the process timeline, the practice (two hairline-divided columns for Layne and Spencer with a large faint initial; `PracticeCards` is reused on /philosophy; drop portraits at `public/team/layne.jpg` and `public/team/spencer.jpg` and wire them into `PracticeSection.tsx`), insights, closing CTA.

## Email

The site sends one email: the consult request notification from `/api/contact` (Resend). Recipients, sender, and subject live in the route; do not change them without asking. The body is `consultRequestEmail()` in `src/lib/email.ts`: branded HTML plus a plain-text twin. Email rules: table layout, every style inline, a `bgcolor` on every cell, dark only (`color-scheme` metas so mail apps do not invert it), everything a visitor typed is HTML-escaped. The BLACKLINE wordmark (in the site's Fraunces) and the still gene are PNGs at `public/email/wordmark.png` and `public/email/gene.png`, referenced by absolute URL on blacklinemethod.com, so they must be deployed before an email that uses them is sent. Regenerate them with `.playwright-mcp/email-assets.js`. Colours are the palette tokens written out as hex (email has no CSS variables); if a token changes, change it there too.

## Routes that must keep working

/, /philosophy, /method, /process, /insights, /insights/[slug], /contact, /api/contact (POST, Resend), sitemap.xml, robots.txt, opengraph-image. The consult form posts JSON to /api/contact; success shows "Request received.", any failure shows the inline alert.

## Checking work

- Screenshots at 1440x900 and 390x844 at minimum (also 1920x1080, 1280x720, 1024, 768x1024, 375x667 when layout changes). Settle reveals before judging a capture (scroll through once).
- Run `checks.js` after touching the loader, hero, cards, pillars, or anything scroll-related, and `rotor.js` after touching the pillars section (it must report `fits: true` at 1440x900, 1024x768, and 390x844).
- Lighthouse: mobile preset, three-run medians at least (scores swing by ten points run to run). Compare like with like: a Vercel deployment against a Vercel deployment, or two local `next start` builds on different ports, never local against production. Preview deployments sit behind Vercel login, so Lighthouse cannot reach them. Baseline when this pass shipped: old site 96, new site 97 (local, five interleaved runs).
