# Blackline Method: working notes for Claude

Blackline Method is a live, real business: a private optimization practice in Dallas (hormones, training, nutrition, and the structure of how a client lives). This file is the operating manual for the site. PRODUCT.md holds product truth, DESIGN.md holds the visual system, style-bible.md holds the editorial rules. Read all three before touching copy or design.

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

- Next.js 14.2 App Router, React 18, Tailwind 3, TypeScript. Deployed on Vercel. Do not upgrade Next or React without asking.
- Motion: gsap 3.15 core (Draggable loads on demand for the range explainer only). No ScrollTrigger, no Lenis, no smooth scrolling. Hero: three 0.160 (plain three.js, no React renderer, no drei, no postprocessing).
- `npm run dev` for development. `npm run build` needs `RESEND_API_KEY` set; locally use a placeholder: `RESEND_API_KEY=re_local_build_placeholder npm run build`. The contact route reads the real key at request time on Vercel.
- Type check: `npx tsc --noEmit -p .`. Lint: `npm run lint`.
- Playwright is a dev dependency; scripts live in `.playwright-mcp/` (gitignored): `shoot.js <outdir> <base>` (every page, both sizes), `hero2.js <outdir> [w h m]` (intro frames, `PORT` env), `idle.js` (idle frames), `checks2.js <base> [scroll|cards|wheel|frames|reduced]` (behaviour checks), `overflow.js <base>`, `copycheck2.js <prod> <local>` (word-for-word copy check), `still.js <base>` (re-renders the static hero stills in `public/hero/`). Launch Chromium with `--use-angle=metal --enable-gpu --ignore-gpu-blocklist` to get the real GPU headless.
- Port 3000 on this machine belongs to another project; use 3017 for `next start` and 3018 for `next dev`. Stop `next dev` before building (they share `.next`).

## Design system (pass two, "the living sequence")

Minimal, dark, precise, with one dramatic moment (the hero). A private practice that reads like a lab report set by a type foundry.

**Two typefaces, no others.**

- Display: Fraunces, set exactly as the nav wordmark renders: weight 400, optical size pinned to 14 (`font-optical-sizing: none; font-variation-settings: 'opsz' 14, 'SOFT' 0`), uppercase, tracked. Used for every headline, card title, pillar name, tier name, the menu, and the footer wordmark. Utilities in `globals.css` (`@layer components`): `.bl-display` (hero only, clamp 2.35rem to 6.1rem, 0.045em), `.bl-h1` (page titles, to 4.6rem, 0.055em), `.bl-h2` (section statements, to 3rem, 0.065em), `.bl-h3` (to 2.1rem, 0.07em), `.bl-title` (entries, to 1.3rem, 0.11em), `.bl-serif-caps` (the face without a size), `.bl-wordmark` (13px, 0.42em: the nav logo).
- Text: Inter. Labels, nav, buttons: `.bl-label` (10.5px, 500, 0.2em, uppercase), the face of "DALLAS, TEXAS · BY APPOINTMENT". Body: `.bl-body` (14.5/15.5px, sentence case) and `.bl-lead` (17/18.5px, sentence case; it replaced the italic serif aside).
- No lowercase transforms, no italic display type. Casing changes are CSS only, except where body copy was lowercase in the source (the hero subline and the leads), which was re-cased to sentence case.

**Colour** (tailwind.config.ts and `:root`):

| token | value | use |
| --- | --- | --- |
| black | #080808 | page ground |
| ink | #040404 | route veil, mobile menu |
| graphite | #111110 | ghost-button hover fill |
| offwhite | #F2F1EC | type, primary button |
| amber | #C8965A | the primary accent: link underlines on hover, card numbers, the wheel's active node and marker, timeline points, the footer reading point, focus rings, form errors |
| amber-muted | #A27A4A | "Optimal for you" label |
| teal | #2FA39A | hero scene; elsewhere only a decoded card's edge glow, the selected pillar's ring, the contact success point |
| violet | #7A6CF2 | hero scene only |
| hairline | #262624 | rules, borders |
| label / body / body-dim | #8C8A84 / #9C9B96 / #85847F | text greys (all AA on black) |

No gradients on text, no rainbow. Teal and violet are rich only inside the hero.

**Layout and detail.** `.bl-wrap` (max 1440px, 24/48px gutters). `.bl-folio` (a 3/12 margin column for the section label, 9/12 content; nothing sticks). Section tops are a hairline with small registration crosses (`.bl-cross`) at each end. Static film grain (`#bl-grain`, 0.035). Links: `.bl-link` + `.bl-underline` (resting low-contrast underline, drawn in amber on hover) + `.bl-arrow` (a drawn 1px arrow that extends). Buttons (`ui/button.tsx`): hairline frame, the fill sweeps in from the left on hover and out to the right on leave, text inverts. Inputs are underline-only, amber on focus.

## No scroll animation (binding)

Nobody should ever feel stuck or hijacked while scrolling. No pinning, no scroll-scrubbed timelines, no parallax, no sticky section labels, no smooth-scroll libraries. The only scroll-related motion is a one-time 0.5s fade and 12px rise when an element first enters view (`Reveal`, CSS-driven, never delays content, off for reduced motion). Everything else that moves is time-based (the hero, the method wheel) or answers a person's action (card flips, hovers).

## Motion system

Flags are set on `<html>` before first paint by the inline script in `src/lib/flags.ts`: `bl-motion` or `bl-reduced`, `bl-nowebgl`, `bl-desktop`, `bl-intro` (first homepage visit this session on a motion + WebGL client), later `bl-hydrated` and `bl-intro-done` (`finishIntro()`). sessionStorage key `bl-intro-seen`. `useMotion()` (MotionProvider) exposes `mounted`, `reduced`, `webgl`, `introDone`.

- `Reveal` (`motion/Reveal.tsx`): the one-time entrance. `stagger` animates children 0.06s apart (max 0.18s). Content shows after 2.5s if JS never arrives.
- `PageTransition`: fade through black between routes (0.22s in, 0.3s out).
- Mobile menu: CSS (`#bl-mobile-menu.is-open`), display-caps links slide up through masks.
- `useGsapEffect` loads gsap after the first interaction; only the range explainer uses it (Draggable).
- Reduced motion: no intro, the static hero still, cards show their back content, a still wheel (pillars still selectable), no grain or HUD drift.

## The hero: "the living sequence" (`src/components/hero/`)

- `helix-config.ts`: every tuning constant (`HELIX`: geometry, counts per device tier, sizes, camera, layout for desktop and phone, idle motion, intro timing, interaction feel, DPR cap; `HUD`: the four biomarker labels and where their leader lines land). **Tune here.**
- `HelixScene.ts`: plain three.js. One `Points` object for both strands and the rung particles (spins), one for the ambient field (world space), `LineSegments` for rungs and backbones, three tilted scan rings with travelling bright arcs, a scan ring that sweeps down the strand every `scanEvery` seconds, a breathing glow plane. All animation runs in the vertex shaders from uniforms: intro convergence from depth (per-particle stagger and swirl), amber rung pulse one at a time down the strand, teal scan band, click pulse, cursor scatter (screen-space push that springs back), colour breathing between teal, violet, and amber. The helix tilts toward the cursor with a damped spring. DPR capped at 2 and stepped down to 1.25 once if frames average over 22ms. `dispose()` frees every geometry and material and loses the context.
- `HeroHelix.tsx`: the React wrapper (loaded with `next/dynamic`, `ssr: false`). Picks the device tier, runs the scene only while the hero is on screen and the tab is visible, re-measures on resize, wires input (pointer: tilt, scatter, click pulse; touch: horizontal drag tilts with `touch-action: pan-y` so vertical drags always scroll the page, tap pulses; nothing calls preventDefault), the intro skip (any click, tap, wheel, or key), and draws the HUD leader lines each frame. Context loss falls back to the still.
- `HeroSection.tsx`: the composition (headline lower left, label, lead, and consult button on the right) over the scene, with vignettes for legibility. Copy carries `data-intro` and resolves in when the helix locks (`globals.css`, "Hero intro"; CSS safety reveal after 5s). Static fallback: `.bl-helix-still` with `public/hero/helix-desktop.jpg` and `helix-mobile.jpg` (rendered from the live scene by `.playwright-mcp/still.js`), only downloaded when reduced motion, no WebGL, or a runtime failure applies.

## Interactive sections

- `PrinciplesSection` (sequence cards): `CARDS` knobs (scramble timing, base strands, helix fragment shapes). Hover or keyboard focus flips a card in 3D (desktop) while its title decodes from A T G C; touch: tap flips, tap again flips back, with a "Tap to reveal" hint on touch devices only. Description text always in the DOM.
- `MethodWheel` (`components/MethodWheel.tsx`): `WHEEL` knobs (`period` 34s per turn, `stopEase`, `resumeEase`, `resumeAfterMs`, radius, label gap, compact geometry under 520px). Time-based rotation; the fixed amber marker picks the active pillar and `onActive` crossfades the panel in `MethodSection`. Hover or focus holds a pillar (amber node, teal ring, label brightens); leaving eases back to speed from where it stopped. Touch: tap holds, tap empty space or wait 4.2s to resume. Pauses off screen. `MethodWheelNav` on /method jumps to the pillar's section.
- `RangeExplainer`: `RANGE` knobs; draggable marker with role="slider".
- `ProcessTimeline`: static; hovering a step lights its point.
- `Footer`: one-time load-in when it enters view (hairlines draw, wordmark letters rise with a 0.045s stagger, contacts and links fade up in sequence, about 1.3s). Feel modelled on the lineaautomations.com footer.

## Sections

Homepage order: hero (the living sequence), a different model of care, principles (sequence cards), optimal is not a range, the method (wheel), the process timeline, the practice (two hairline-divided columns for Layne and Spencer with a large faint initial; `PracticeCards` is reused on /philosophy; drop portraits at `public/team/layne.jpg` and `public/team/spencer.jpg` and wire them into `PracticeSection.tsx`), insights, closing CTA.

## Routes that must keep working

/, /philosophy, /method, /process, /insights, /insights/[slug], /contact, /api/contact (POST, Resend), sitemap.xml, robots.txt, opengraph-image. The consult form posts JSON to /api/contact; success shows "Request received.", any failure shows the inline alert.

## Checking work

- Screenshots at 1440x900 and 390x844 at minimum (also 1920x1080, 1280x720, 768x1024, 375x667 when layout changes). Settle reveals before judging a capture (scroll through once).
- Run `checks2.js` after touching the hero, cards, wheel, or anything scroll-related: it scrolls the whole page in fixed steps and fails on any pin, sticky element, or off-step scroll.
- Lighthouse: production build (`next start -p 3017`), mobile and desktop presets, three-run medians (headless scores swing on this machine).
