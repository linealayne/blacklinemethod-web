# Blackline Method: working notes for Claude

Blackline Method is a live, real business: a private optimization practice in Dallas (hormones, training, nutrition, and the structure of how a client lives). This file is the operating manual for the site. PRODUCT.md holds product truth, DESIGN.md holds the visual system, style-bible.md holds the editorial rules. Read all three before touching copy or design.

## Positioning (the site must make visitors feel this)

- Blackline captures an opportunity the healthcare system leaves open. The common belief is that the doctor's office and a prescription are the whole answer. Blackline challenges that: a model of care built around the individual client rather than the system, the clock, or the population average.
- It does not replace medicine or tell anyone to avoid their doctor. It works in the space conventional care was never built for: from "nothing is wrong" to performing at the level you should, with prescription intervention coordinated with physicians only when it is truly appropriate, never as the default.
- High end, private, one of a kind. Limited clients by design. The feeling is a private members' practice: quiet confidence, nothing loud or salesy, every detail considered.
- Voice: confident, precise, calm, slightly provocative. Short declarative lines. Never combative, never anti-doctor, never fear-based. Lowercase serif headlines that end with a period.

## Copy rules (binding)

- No medical claims, promised results, statistics, testimonials, credentials, or prices. Nothing that discourages seeing a doctor or taking prescribed medication. Keep the existing physician-coordination language.
- Never name a pharmaceutical, peptide, hormone-by-protocol, supplement brand, dose, or compound. Naming a lab marker for education is fine.
- No em dashes in new or edited copy (use a period or a comma). Pre-existing article bodies still contain some; leave them unless editing that line.
- Never state a client cap. Use "engagements are limited" or "we take a small number of clients".
- The planned facility (references/) does not exist yet and never appears on the site.
- Banned words: elevate, premium, luxury, transform, unleash, unlock, experience the difference, your best self, wellness journey, holistic, cutting-edge, game-changing, world-class, unparalleled, best-in-class.

## Stack and commands

- Next.js 14.2 App Router, React 18, Tailwind 3, TypeScript. Deployed on Vercel. Do not upgrade Next or React without asking.
- Motion: gsap 3.15 (+ ScrollTrigger; SplitText and Draggable load on demand), lenis (desktop pointers only). Hero: a 2D canvas. 3D (the method orbit only): three 0.160 and @react-three/fiber 8 only (fiber 9 needs React 19). No drei, no postprocessing.
- `npm run dev` for development. `npm run build` needs `RESEND_API_KEY` set; locally use a placeholder: `RESEND_API_KEY=re_local_build_placeholder npm run build`. The contact route reads the real key at request time on Vercel.
- Type check: `npx tsc --noEmit -p .`. Lint: `npm run lint`.
- Screenshots: `playwright` is a dev dependency; scripts live in `.playwright-mcp/` (gitignored), e.g. `node .playwright-mcp/shoot.js <outdir> http://localhost:3017`. Design detector: `~/.claude/skills/impeccable/scripts/impeccable detect --json src/app src/components`.
- Local screenshots go in `.playwright-mcp/` (gitignored). Port 3000 on this machine belongs to another project; use 3017 for `next start` and 3018 for `next dev`.

## Design system (revamp, "the reading room")

Monochrome, editorial, clinical. A private practice that reads like a lab report set by a type foundry: deep black ground, off-white type, hairlines, generous space. **Amber is the signal colour**: it marks a live reading (the hero read head, the drawn timeline, the active principle bar, the optimal band, the active orbit pillar and "you", the current nav item's dot, focus rings, form errors) and nothing decorative. Buttons, links, and hovers are monochrome.

Tokens (tailwind.config.ts and :root in globals.css):

| token | value | use |
| --- | --- | --- |
| black | #080808 | page ground |
| ink | #040404 | loader, route veil, mobile menu |
| graphite | #111110 | ghost-button hover fill |
| offwhite | #F2F1EC | headlines, wordmark, primary button, the hero line |
| amber | #C8965A | signal only (see above) |
| amber-muted | #A27A4A | the "Optimal for you" label in the range explainer |
| gold | #E2C48F | legacy token, unused by the revamp UI |
| hairline | #262624 | rules, dividers |
| label | #8C8A84 | quiet uppercase labels, nav at rest (AA) |
| body | #9C9B96 | body copy (AA) |
| body-dim | #85847F | secondary copy, deks, placeholders (AA) |

Type: Fraunces as a variable font (`opsz` and `SOFT` axes; `font-optical-sizing: auto`, `SOFT 0`), so display sizes get the sharp high-contrast cut. Headlines are lowercase, light (300), set tight with negative tracking and sub-1 leading. Inter for body and labels. Scale utilities in globals.css (`@layer components`): `.bl-display` (hero only), `.bl-h1` (page titles), `.bl-h2` (section statements), `.bl-h3`, `.bl-title` (list entries), `.bl-lead` (italic serif aside), `.bl-body` (body copy with measure). Labels: `.bl-label` (10.5px Inter 500, 0.2em, uppercase, label grey), `.bl-label-strong` (brighter), `.bl-tick` (a short leading rule, used on section labels).

Layout: `.bl-wrap` (max 1440px, 24px / 48px gutters). `.bl-folio` is the page grammar: a margin column (3/12, sticky on desktop) holding the section label, and a content column (9/12); it collapses to label-above on phones. `Folio` (`src/components/layout/Folio.tsx`) wraps a homepage section in it with a drawn top rule. On the inner pages, section headings stick in the left column while the paragraphs scroll.

Lines: `.bl-rule` is a hairline that draws left to right when it enters view (wrap in `Reveal`). `.bl-link` + `.bl-underline` + `.bl-arrow` is the quiet text link (resting low-contrast underline drawn bright on hover, a drawn 1px arrow that extends). Buttons (`ui/button.tsx`): off-white hairline frame, fill rises from the bottom on hover with text inverting to black; ghost variant brightens. No glow, no shadows, no cards: the practice cards, tiers, and insight rows are divided by hairlines only. Inputs are underline-only, amber on focus.

Copy is unchanged from before the revamp; all casing changes are CSS (`text-transform`).

## Motion system

Flags are set on `<html>` before first paint by the inline script in `src/lib/flags.ts` (rendered in `app/layout.tsx`): `bl-motion` or `bl-reduced`, `bl-nowebgl` (API absent; the real context probe runs lazily via `supportsWebGL()`), `bl-no-loader` (returning visitor this session), later `bl-hydrated` and `bl-loader-done`.

Nothing animation-related ships in the initial JavaScript. `src/lib/gsap.ts` is only ever reached through `import()`: components use `useGsapEffect()` (`src/lib/useGsap.ts`), which fetches gsap after hydration and hands back a cleanup. Body reveals, the route veil, the mobile menu, and the loader are plain CSS (globals.css). The homepage first-load JS is about 118 kB, of which 87 kB is React and Next.

Expensive set-up waits for the visitor: `useFirstInteraction()` (`src/lib/useFirstInteraction.ts`) turns true on the first pointer move, touch, wheel, key, or scroll, or after 6s of quiet. The orbit and both pinned ScrollTriggers wait for it (the hero line does not: it is the hero), so the page is readable and interactive first (and Lighthouse measures the page, not the choreography). `motionFlags()` reads them synchronously; `useMotion()` (MotionProvider) exposes them to React after mount. Reduced motion means: a static hero line, no orbit (no WebGL also means no orbit), no pinning, no loader, no smooth scroll, no grain drift; everything renders static and readable.

Components in `src/components/motion/`:

- `SmoothScroll`: Lenis synced to ScrollTrigger, desktop (fine pointer) only, both loaded on demand (`lerp 0.12`). Exposes `window.__lenis`. Phones keep native scrolling.
- `Loader`: every device, once per session (skipped for returning visitors and reduced motion). A biomarker trace draws across the screen in 1.15s, erratic on the left and settling into a level line on the right, revealed by a moving clip with an amber read head on its tip; the wordmark fades in above it; the overlay fades 0.45s from 1.35s (1.8s total). Click, tap, or any key (except Tab) skips it (0.3s fade). The hero is handed off at 1.35s (`LOADER.handoffMs`). Server-rendered so there is no flash; CSS safety-hides it after 3s.
- `PageTransition`: capture-phase click listener on same-origin links; `.is-on` on `#bl-veil` (CSS, 0.22s in), `router.push`, scroll reset, `window.__ScrollTrigger?.refresh()` if gsap has loaded, veil out 0.3s.
- `Reveal`: CSS fade-and-rise (`--bl-rise` 24px, 0.9s, lux ease, `--bl-delay`; `stagger` animates children with nth-child delays of 0.08s). An IntersectionObserver adds `.bl-in` at `top 86%`. `SplitReveal`: masked line-by-line headline reveal (gsap + SplitText fetched only when the headline is within 40% of a viewport, split after fonts, 1.1s per line, stagger 0.09s, expo.out). Elements carry `data-reveal`; motion clients hide them until `.bl-in`. The hero h1 never carries it, so it paints at first paint in the metric-matched fallback (`display: swap`).
- `Magnetic`: desktop-only pointer pull (strength 0.28, 56px zone, 0.7s quickTo). `Grain`: CSS grain at 0.03 opacity, 6-step drift.
- Global knobs: `EASE`, `DUR`, `REVEAL_START` in `src/lib/motion.ts`. GSAP defaults in `src/lib/gsap.ts`.

Section choreography (knobs live in each file's CONFIG object):

- `HeroSection`: `HERO` (line 1.3s, stagger 0.1s, subs overlapping 0.6s, copy drifts -14 yPercent and fades from scroll progress 0.25). The headline sits on the line; `anchorRef` is the line's baseline. Starts when `loaderDone`.
- `Parallax` (`motion/Parallax.tsx`, mounted in layout): elements with `data-parallax="N"` drift N yPercent through the viewport (desktop fine pointers, 1024px and up, not reduced). Used on the practice monograms and the footer wordmark only.
- `DifferentModelSection`: `MODEL` (row stagger 0.42s, system side settles to 0.42 opacity).
- `PrinciplesSection`: `PRINCIPLES` (pin +=250% desktop / +=200% phones, scrub 0.6, slide 36px). Static stacked layout when reduced.
- `RangeExplainer`: `RANGE` (reference band 0.10 to 0.90 of the track, optimal band 0.60 to 0.74, initial 0.32, keyboard step 0.02). Draggable with role="slider"; no numbers shown.
- `MethodSection`: `METHOD` (pin +=320% desktop / +=340% phones, scrub 0.7, phones pin only the orbit block at `center center`). Windows come from `three/orbit-config.ts` (`rotateShare 0.3`: 30% of each window rotates, 70% holds).
- `ProcessTimeline`: `TIMELINE` (start top 72%, end bottom 78%, scrub 0.6, bracket at 0.1). Horizontal from md, vertical on phones.
- `Header`: mobile menu is CSS (`#bl-mobile-menu.is-open`: overlay 0.5s, links slide up through masks with 0.07s steps, close 0.25s). Desktop nav from `lg` (1024px); the phone menu traps focus and carries a consult button.
- Short desktop viewports (under 820px tall): `.bl-pinned` sections align to the top under the header (globals.css).

## The hero line (`src/components/hero/HeroLine.tsx`)

A 2D canvas (not WebGL), loaded with `next/dynamic` right after hydration on motion clients. One fine off-white line across the full width, simulated as a spring-mass string (fixed 120Hz steps, so it behaves the same at any frame rate): each point springs to the baseline and couples to its neighbours, so a disturbance travels and damps out. Rendered offset = physics + a value-noise "signal" scaled by `agitation`, which starts at 1 (restless, dysregulated reading), decays exponentially, and is raised again by pointer travel or scroll, so the line goes noisy when disturbed and settles back to a calm, level line. Intro: draws in from the left over 1.9s with the amber read head on its tip; then the read head follows the cursor's x (rests at 78%). Faint dashed reference band at +/-44px fades in after the draw. Input: pointer (desktop) bends the line toward the cursor within 240px; touch (finger position) and scroll velocity (a broad bow plus agitation) on phones. DPR capped at 2. The loop sleeps when the line is at rest and wakes on input; it pauses off screen and in hidden tabs (`active`). Knobs in `LINE`. Reduced motion and no-JS: the server-rendered static trace (`.bl-line-static`) shows instead.

## 3D components (`src/components/three/`)

Only the method orbit remains (the hero particle field was removed in the revamp). Loaded with `next/dynamic` (`ssr: false`), only on motion-capable WebGL clients, when near the viewport. `dpr` capped at 1.5, `frameloop="never"` off screen. Text is real HTML; the canvas is `aria-hidden`.

- `OrbitScene.tsx` with `orbit-config.ts`: `ORBIT` knobs `radius 1.8`, `tilt 0.62`, `tiltEnd 0.95`, `camZ 7.2`, `camZEnd 9.2`, `phoneCamOffset 1.6`, `intro 0.08`, `windowSize 0.19` per pillar, `rotateShare 0.3`, `idleSpeed 0.16`, `smoothing 7`. Colours: ring and resting nodes neutral grey (`colors.amber` now holds #8F8D86), the active pillar and "you" in amber (`colors.gold` holds #C8965A). `activeIndexFor(progress)` keeps the DOM timeline in `MethodSection` in step. `mode="idle"` on /method.
- Fallback: `MethodDiagram.tsx` (static SVG) when WebGL or motion is unavailable.

## Sections

Homepage order: hero (the line), a different model of care, principles (pinned), optimal is not a range, the method (pinned orbit), the process timeline, the practice (two hairline-divided columns for Layne and Spencer with a large faint initial; `PracticeCards` is reused on /philosophy; drop portraits at `public/team/layne.jpg` and `public/team/spencer.jpg` and wire them into `PracticeSection.tsx`), insights, closing CTA.

## Routes that must keep working

/, /philosophy, /method, /process, /insights, /insights/[slug], /contact, /api/contact (POST, Resend), sitemap.xml, robots.txt, opengraph-image. The consult form posts JSON to /api/contact; success shows "Request received.", any failure shows the inline alert.

## Checking work

- Screenshots at 1440x900, 1920x1080, 1280x720, 768x1024, 390x844, 375x667. Pinned sections do not survive full-page captures; scroll to positions inside the pin spacer instead.
- Settle reveals before judging a capture (scroll through once; reveals fire once).
- Lighthouse: run against a production build (`next start -p 3017`), mobile and desktop presets, on the homepage. Stop `next dev` first: a build while dev runs on the same `.next` corrupts both. Headless scores on this machine swing widely between runs; use three-run medians.
