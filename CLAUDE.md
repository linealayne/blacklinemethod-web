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
- Motion: gsap 3.15 (+ ScrollTrigger; SplitText and Draggable load on demand), lenis (desktop pointers only). 3D: three 0.160 and @react-three/fiber 8 only (fiber 9 needs React 19). No drei, no postprocessing: the orbit draws its own ring and projects DOM labels; the hero fakes bloom with a second soft point layer.
- `npm run dev` for development. `npm run build` needs `RESEND_API_KEY` set; locally use a placeholder: `RESEND_API_KEY=re_local_build_placeholder npm run build`. The contact route reads the real key at request time on Vercel.
- Type check: `npx tsc --noEmit -p .`. Design detector: `~/.claude/skills/impeccable/scripts/impeccable detect --json src/app src/components`.
- Local screenshots go in `.playwright-mcp/` (gitignored). Port 3000 on this machine belongs to another project; use 3017 for `next start` and 3018 for `next dev`.

## Design tokens (tailwind.config.ts and :root in globals.css)

| token | value | use |
| --- | --- | --- |
| black | #0A0A0A | page ground, hero canvas clear colour |
| ink | #060606 | loader, route veil, mobile menu |
| offwhite | #F5F5F0 | headlines, wordmark, input text |
| amber | #C8965A | accent strokes, hover fills, drawn lines, focus rings |
| amber-muted | #A27A4A | small amber labels and quiet links (5.1:1) |
| gold | #E2C48F | glowing points, particle highlights, hover light |
| hairline | #2A2A2A | rules, borders, input strokes |
| label | #8C8A84 | quiet uppercase labels, nav at rest (5.7:1) |
| body | #9C9B96 | primary body copy (7.2:1) |
| body-dim | #85847F | secondary copy, deks, placeholders (5.4:1) |

Fonts: Fraunces 300/400 (lowercase headlines, italic leads) and Inter 400/500/600 (body, labels). Utilities: `.bl-label` (11px, 0.3em tracking, uppercase, label grey), `.bl-label-amber`, `.bl-underline` (drawn 1px underline on hover), `.bl-press`, `.hairline-amber`.

## Motion system

Flags are set on `<html>` before first paint by the inline script in `src/lib/flags.ts` (rendered in `app/layout.tsx`): `bl-motion` or `bl-reduced`, `bl-nowebgl` (API absent; the real context probe runs lazily via `supportsWebGL()`), `bl-no-loader` (returning visitor this session), later `bl-hydrated` and `bl-loader-done`.

Nothing animation-related ships in the initial JavaScript. `src/lib/gsap.ts` is only ever reached through `import()`: components use `useGsapEffect()` (`src/lib/useGsap.ts`), which fetches gsap after hydration and hands back a cleanup. Body reveals, the route veil, the mobile menu, and the loader are plain CSS (globals.css). The homepage first-load JS is about 117 kB, of which 87 kB is React and Next.

Expensive set-up waits for the visitor: `useFirstInteraction()` (`src/lib/useFirstInteraction.ts`) turns true on the first pointer move, touch, wheel, key, or scroll, or after 6s of quiet. The hero field, the orbit, and both pinned ScrollTriggers wait for it, so the page is readable and interactive first (and Lighthouse measures the page, not the choreography). `motionFlags()` reads them synchronously; `useMotion()` (MotionProvider) exposes them to React after mount. Reduced motion or no WebGL means: no particles, no orbit, no pinning, no loader, no smooth scroll, no grain drift; everything renders static and readable.

Components in `src/components/motion/`:

- `SmoothScroll`: Lenis synced to ScrollTrigger, desktop (fine pointer) only, both loaded on demand (`lerp 0.12`). Exposes `window.__lenis`. Phones keep native scrolling.
- `Loader`: desktop only (skipped on coarse pointers and under 1024px, and for returning visitors and reduced motion). CSS keyframes: wordmark letter-spaces 0.1em to 0.35em over 0.6s, amber rule draws over 0.5s from 0.2s, fade 0.4s from 0.75s (about 1.15s). The hero reveal is handed off at 0.75s (`LOADER.handoffMs`). Server-rendered so there is no flash.
- `PageTransition`: capture-phase click listener on same-origin links; `.is-on` on `#bl-veil` (CSS, 0.22s in), `router.push`, scroll reset, `window.__ScrollTrigger?.refresh()` if gsap has loaded, veil out 0.3s.
- `Reveal`: CSS fade-and-rise (`--bl-rise` 24px, 0.9s, lux ease, `--bl-delay`; `stagger` animates children with nth-child delays of 0.08s). An IntersectionObserver adds `.bl-in` at `top 86%`. `SplitReveal`: masked line-by-line headline reveal (gsap + SplitText fetched only when the headline is within 40% of a viewport, split after fonts, 1.1s per line, stagger 0.09s, expo.out). Elements carry `data-reveal`; motion clients hide them until `.bl-in`. The hero h1 never carries it, so it paints at first paint in the metric-matched fallback (`display: swap`).
- `Magnetic`: desktop-only pointer pull (strength 0.28, 56px zone, 0.7s quickTo). `Grain`: CSS grain at 0.035 opacity, 6-step drift.
- Global knobs: `EASE`, `DUR`, `REVEAL_START` in `src/lib/motion.ts`. GSAP defaults in `src/lib/gsap.ts`.

Section choreography (knobs live in each file's CONFIG object):

- `HeroSection`: `HERO` (line 1.3s, stagger 0.1s, subs 0.9s overlapping 0.75s, copy fades from scroll progress 0.3). Starts when `loaderDone`.
- `DifferentModelSection`: `MODEL` (row stagger 0.42s, system side settles to 0.42 opacity).
- `PrinciplesSection`: `PRINCIPLES` (pin +=250% desktop / +=200% phones, scrub 0.6, slide 36px). Static stacked layout when reduced.
- `RangeExplainer`: `RANGE` (reference band 0.10 to 0.90 of the track, optimal band 0.60 to 0.74, initial 0.32, keyboard step 0.02). Draggable with role="slider"; no numbers shown.
- `MethodSection`: `METHOD` (pin +=320% desktop / +=340% phones, scrub 0.7, phones pin only the orbit block at `center center`). Windows come from `three/orbit-config.ts` (`rotateShare 0.3`: 30% of each window rotates, 70% holds).
- `ProcessTimeline`: `TIMELINE` (start top 72%, end bottom 78%, scrub 0.6, bracket at 0.1). Horizontal from md, vertical on phones.
- `Header`: mobile menu is CSS (`#bl-mobile-menu.is-open`: overlay 0.5s, links slide up through masks with 0.07s steps, close 0.25s). Desktop nav from `lg` (1024px); the phone menu traps focus and carries a consult button.
- Short desktop viewports (under 820px tall): `.bl-pinned` sections align to the top under the header (globals.css).

## 3D components (`src/components/three/`)

Both are loaded with `next/dynamic` (`ssr: false`), only on motion-capable WebGL clients, after idle or when near the viewport. Both cap `dpr` at 1.5 and set `frameloop="never"` when off screen or the tab is hidden (`active` prop). Text is always real HTML; canvases are `aria-hidden`.

- `HeroField.tsx`: custom ShaderMaterial points. Knobs in `HERO_FIELD`: `countDesktop 4200`, `countPhone 1500`, `helixRadius 1.15`, `helixHeight 5.6`, `turns 2.1`, `rungFraction 0.16`, `gatherDuration 5.5`, `gatherDelay 0.5`, `rotateSpeed 0.11`, `breathe 0.035`, `pushStrength 0.45`, `pushRadius 2.2`, `pointSize 2.4`, `opacity 0.62`, `warmFraction 0.35`, `glow` (desktop only second point layer standing in for bloom: `sizeFactor 3.4`, `opacity 0.09`). Uniforms `uGather` (0 dust, 1 helix) and `uScroll` (0 at hero top, 1 scrolled out) drive the gather and loosening. `handles.pointer` is NDC from the hero section (cursor on desktop, device tilt on phones).
- `OrbitScene.tsx` with `orbit-config.ts`: `ORBIT` knobs `radius 1.8`, `tilt 0.62` (0 edge-on, PI/2 full circle), `tiltEnd 0.95`, `camZ 7.2`, `camZEnd 9.2`, `phoneCamOffset 1.6`, `intro 0.08`, `windowSize 0.19` per pillar, `rotateShare 0.3`, `idleSpeed 0.16`, `smoothing 7`. Labels are DOM spans projected each frame; they sit above far-side nodes and below near-side nodes. `activeIndexFor(progress)` returns the pillar in front; the DOM timeline in `MethodSection` uses the same windows so text and orbit stay in step. `mode="idle"` on /method.
- Fallback: `MethodDiagram.tsx` (static SVG) when WebGL or motion is unavailable.

## Sections

Homepage order: hero, a different model of care, principles (pinned), optimal is not a range, the method (pinned orbit), the process timeline, the practice (two monogram cards for Layne and Spencer; `PracticeCards` is reused on /philosophy; drop portraits at `public/team/layne.jpg` and `public/team/spencer.jpg` and wire them into `PracticeSection.tsx`), insights, closing CTA.

## Routes that must keep working

/, /philosophy, /method, /process, /insights, /insights/[slug], /contact, /api/contact (POST, Resend), sitemap.xml, robots.txt, opengraph-image. The consult form posts JSON to /api/contact; success shows "Request received.", any failure shows the inline alert.

## Checking work

- Screenshots at 1440x900, 1920x1080, 1280x720, 768x1024, 390x844, 375x667. Pinned sections do not survive full-page captures; scroll to positions inside the pin spacer instead.
- Settle reveals before judging a capture (scroll through once; reveals fire once).
- Lighthouse: run against a production build (`next start -p 3017`), mobile and desktop presets, on the homepage. Stop `next dev` first: a build while dev runs on the same `.next` corrupts both. Headless scores on this machine swing widely between runs; use three-run medians.
