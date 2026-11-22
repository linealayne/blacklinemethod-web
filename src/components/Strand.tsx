/**
 * The gene, drawn small. Every illustration outside the hero is this one
 * thing: a double helix seen side-on, made of particles, the near strand
 * brighter than the far one, with faint base-pair rungs. Teal and violet
 * come from the palette tokens (`fill-teal`, `fill-violet`), so these always
 * match the hero scene. Server-renderable; purely decorative (aria-hidden).
 */

/** offset between the two strands: the same groove as the hero helix */
export const GROOVE = Math.PI * 0.82

interface Dot {
  /** position along the axis */
  u: number
  /** offset from the axis */
  v: number
  r: number
  o: number
}

function strand(length: number, amp: number, turns: number, phase: number, count: number, wobble: number): Dot[] {
  const dots: Dot[] = []
  for (let n = 0; n < count; n++) {
    const t = (n + 0.5) / count
    const a = t * Math.PI * 2 * turns + phase
    const near = (Math.cos(a) + 1) / 2 // 0 far side, 1 near side
    // a small repeatable scatter so the strand reads as particles, not a dotted line
    const h1 = Math.sin(n * 12.9898 + phase * 7.1) * 43758.5453
    const h2 = Math.sin(n * 78.233 + phase * 3.7) * 12543.1337
    const r1 = h1 - Math.floor(h1)
    const r2 = h2 - Math.floor(h2)
    const jit = wobble ? (r1 - 0.5) * wobble : 0
    // most particles are fine; a few are bright, like the hero's
    const size = wobble ? (r2 > 0.9 ? 1.7 : 0.6 + r2 * 0.7) : 1
    dots.push({
      u: t * length + (wobble ? (r2 - 0.5) * 1.6 : 0),
      v: Math.sin(a) * amp + jit,
      r: (0.5 + near * 0.8) * size,
      o: Math.min(1, (0.2 + near * 0.7) * (wobble && r2 > 0.9 ? 1.25 : 1)),
    })
  }
  return dots
}

function rungs(length: number, amp: number, turns: number, phase: number, count: number) {
  return Array.from({ length: count }, (_, k) => {
    const t = (k + 0.5) / count
    const a = t * Math.PI * 2 * turns + phase
    return { u: t * length, v1: Math.sin(a) * amp, v2: Math.sin(a + GROOVE) * amp }
  })
}

const f = (n: number) => n.toFixed(2)

export interface FragmentShape {
  width?: number
  height?: number
  turns: number
  phase?: number
  rungCount: number
  /** index of the rung drawn in tan */
  lit?: number
  /** particles per unit of length, per strand */
  density?: number
}

/**
 * A length of the helix, drawn horizontally. `lit` marks one rung in tan,
 * the way the hero's ripple lights one base pair at a time. `lead` picks the
 * strand that sits in front (the other is dimmed). This is the still form;
 * LivingStrand.tsx draws the same thing turning.
 */
export function HelixFragment({
  width = 300,
  height = 96,
  turns,
  phase = 0,
  rungCount,
  lit,
  density = 0.5,
  lead = 'both',
  className = 'w-full h-auto',
}: FragmentShape & { lead?: 'teal' | 'violet' | 'both'; className?: string }) {
  const mid = height / 2
  const amp = height / 2 - 6
  const n = Math.round(width * density)
  const a = strand(width, amp, turns, phase, n, 3.4)
  const b = strand(width, amp, turns, phase + GROOVE, n, 3.4)
  const teal = { name: 'teal', fill: 'fill-teal', dots: a }
  const violet = { name: 'violet', fill: 'fill-violet', dots: b }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} fill="none" aria-hidden="true">
      {rungs(width, amp, turns, phase, rungCount).map((l, k) => (
        <line
          key={k}
          className={`bl-strand-rung ${k === lit ? 'stroke-tan' : 'stroke-offwhite'}`}
          style={{ '--r': k } as React.CSSProperties}
          x1={f(l.u)}
          x2={f(l.u)}
          y1={f(mid + l.v1)}
          y2={f(mid + l.v2)}
          strokeOpacity={k === lit ? 0.9 : 0.16}
          strokeWidth="1"
        />
      ))}
      {(lead === 'violet' ? [teal, violet] : [violet, teal]).map((s) => (
        <g key={s.name} className={s.fill} opacity={lead !== 'both' && lead !== s.name ? 0.6 : 1} style={{ filter: `drop-shadow(0 0 3px rgb(var(--bl-${s.name}-rgb) / 0.9))` }}>
          {s.dots.map((d, k) => (
            <circle key={k} cx={f(d.u)} cy={f(mid + d.v)} r={f(d.r)} opacity={f(d.o)} />
          ))}
        </g>
      ))}
    </svg>
  )
}

/** One period of the strand: the tile size shared by StrandRail and the layouts around it. */
export const RAIL = { period: 132, amp: 13, cross: 40, perPeriod: 30, rungs: 6 }

/**
 * An endless strand: one period of the helix as an SVG pattern, repeated
 * along `axis` for as long as the element is (so it can run the full height
 * of a list, or the full width of a row, without stretching a single dot).
 * Give the wrapper its size; the strand's centre line is the middle of the
 * cross axis (RAIL.cross / 2 = 20px).
 */
export function StrandRail({ id, axis, className = '' }: { id: string; axis: 'x' | 'y'; className?: string }) {
  const { period, amp, cross, perPeriod } = RAIL
  const mid = cross / 2
  const a = strand(period, amp, 1, 0, perPeriod, 0)
  const b = strand(period, amp, 1, GROOVE, perPeriod, 0)
  const pt = (u: number, v: number) => (axis === 'x' ? { cx: f(u), cy: f(mid + v) } : { cx: f(mid + v), cy: f(u) })
  const fade =
    axis === 'x'
      ? 'linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)'
      : 'linear-gradient(180deg, transparent, #000 48px, #000 calc(100% - 72px), transparent)'
  return (
    <svg
      className={className}
      aria-hidden="true"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
      {...(axis === 'x' ? { height: cross, width: '100%' } : { width: cross, height: '100%' })}
    >
      <defs>
        <pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={axis === 'x' ? period : cross}
          height={axis === 'x' ? cross : period}
        >
          {rungs(period, amp, 1, 0, RAIL.rungs).map((l, k) => {
            const p1 = pt(l.u, l.v1)
            const p2 = pt(l.u, l.v2)
            return <line key={k} className="stroke-offwhite" strokeOpacity="0.13" strokeWidth="1" x1={p1.cx} y1={p1.cy} x2={p2.cx} y2={p2.cy} />
          })}
          <g className="fill-violet">
            {b.map((d, k) => (
              <circle key={k} {...pt(d.u, d.v)} r={f(d.r)} opacity={f(d.o)} />
            ))}
          </g>
          <g className="fill-teal">
            {a.map((d, k) => (
              <circle key={k} {...pt(d.u, d.v)} r={f(d.r)} opacity={f(d.o)} />
            ))}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
