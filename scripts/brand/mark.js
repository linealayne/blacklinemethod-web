// Blackline monogram generator. Glyphs: Fraunces 400, opsz 14, SOFT 0 (the site's display face).
// node mark.js <fontPath> <outDir>
const ot = require('opentype.js')
const fs = require('fs'), path = require('path')
const font = ot.loadSync(process.argv[2])
const out = process.argv[3]
fs.mkdirSync(out, { recursive: true })

const C = { black: '#080808', bone: '#F2F1EC', tan: '#D0AE82', tanMuted: '#AC906A', tanLight: '#E8D5B5' }
const glyph = (ch, dx = 0, dy = 0, s = 1) => font.charToGlyph(ch).getPath(dx, dy, font.unitsPerEm * s).toPathData(2)
const f = (n) => +n.toFixed(1)
const GROOVE = Math.PI * 0.82 // the site's helix groove offset

// Polyline segments of a strand, split into front (z > 0) and back runs.
function runs(pts) {
  const res = []; let cur = null
  for (const p of pts) {
    const front = p.z > 0
    if (!cur || cur.front !== front) { if (cur) cur.pts.push(p); cur = { front, pts: cur ? [cur.pts[cur.pts.length - 1], p] : [p] }; res.push(cur) }
    else cur.pts.push(p)
  }
  return res
}
const d = (pts) => 'M' + pts.map((p) => `${f(p.x)} ${f(p.y)}`).join('L')

const defs = (id, [gx1, gy1, gx2, gy2] = [112, -1400, 1736, 40]) => `<defs>
  <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${gx1}" y1="${gy1}" x2="${gx2}" y2="${gy2}">
    <stop offset="0" stop-color="${C.tanMuted}"/>
    <stop offset="0.38" stop-color="${C.tan}"/>
    <stop offset="0.55" stop-color="${C.tanLight}"/>
    <stop offset="0.72" stop-color="${C.tan}"/>
    <stop offset="1" stop-color="${C.tanMuted}"/>
  </linearGradient>
</defs>`

// A helix along an axis. axis: 'x' (horizontal) or 'y' (vertical).
function helix({ axis, from, to, c, amp, turns, phase = 0, step = 4 }) {
  const n = Math.ceil(Math.abs(to - from) / step)
  const s1 = [], s2 = []
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = from + (to - from) * t, a = t * Math.PI * 2 * turns + phase
    const o1 = Math.sin(a) * amp, o2 = Math.sin(a + GROOVE) * amp
    const P = (o, z) => (axis === 'x' ? { x: u, y: c + o, z } : { x: c + o, y: u, z })
    s1.push(P(o1, Math.cos(a))); s2.push(P(o2, Math.cos(a + GROOVE)))
  }
  return { s1, s2 }
}

function strandSVG({ s1, s2 }, { grad, w, gap, layer, rungs = [] }) {
  // layer 'back': back runs only. layer 'front': front runs with a black gap underlay.
  let o = ''
  for (const s of [s1, s2]) for (const r of runs(s)) {
    if ((layer === 'front') !== r.front) continue
    if (layer === 'front' && gap) o += `<path d="${d(r.pts)}" fill="none" stroke="${C.black}" stroke-width="${w + gap * 2}" stroke-linecap="round" stroke-linejoin="round"/>`
    o += `<path d="${d(r.pts)}" fill="none" stroke="url(#${grad})" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`
  }
  for (const r of rungs) if ((layer === 'front') === r.front) o += `<path d="M${f(r.a.x)} ${f(r.a.y)}L${f(r.b.x)} ${f(r.b.y)}" stroke="url(#${grad})" stroke-width="${r.w}" stroke-linecap="round" opacity="${r.op}"/>`
  return o
}
function rungsOf({ s1, s2 }, idx, w, op) {
  return idx.map((i) => ({ a: s1[i], b: s2[i], front: (s1[i].z + s2[i].z) / 2 > 0, w, op }))
}
const svg = (vb, body, size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${size ? ` width="${size}" height="${size}"` : ''}>${body}</svg>`

// ---- glyph metrics (font units, baseline y = 0, cap height 1400)
// B: 112..1302, stem 265..498. L: 111..1176, stem 265..497.
const B = glyph('B'), Lx = 1240 // L sits after B, kerned tight
const L = glyph('L', Lx)

// ---------- V1: "Thread"  BL side by side, a horizontal helix weaving through both letters at the waist
function v1() {
  const W = 2600, x0 = -40, x1 = Lx + 1230
  const h = helix({ axis: 'x', from: x0, to: x1, c: -660, amp: 150, turns: 3, phase: 0.6 })
  const N = h.s1.length - 1
  const rIdx = Array.from({ length: 13 }, (_, k) => Math.round(((k + 0.5) / 13) * N))
  const rungs = rungsOf(h, rIdx, 16, 0.75)
  const dot = (p) => `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="26" fill="url(#g1)"/>`
  const body = `${defs('g1')}
  ${strandSVG(h, { grad: 'g1', w: 30, layer: 'back', rungs })}
  <path d="${B}" fill="${C.bone}"/><path d="${L}" fill="${C.bone}"/>
  ${strandSVG(h, { grad: 'g1', w: 30, gap: 22, layer: 'front', rungs })}
  ${dot(h.s1[0])}${dot(h.s2[0])}${dot(h.s1[N])}${dot(h.s2[N])}`
  const pad = 300
  return { body, vb: [x0 - pad, -1400 - pad - 250, x1 - x0 + pad * 2, 1400 + pad * 2 + 250 + 30] }
}

// ---------- V2: "One stem"  B and L share one stem; the L's foot runs out as the line; a helix winds the stem
function v2() {
  // the L foot terminal: the L glyph clipped to its right end, moved out past the B's lower bowl
  const footDx = 560
  const Lfoot = glyph('L', footDx)
  const body = `${defs('g2')}
  <clipPath id="foot"><rect x="${880 + footDx}" y="-700" width="800" height="800"/></clipPath>
  ${''}
  <g id="helixBack"></g>
  <path d="${B}" fill="${C.bone}"/>
  <rect x="640" y="-81" width="${880 + footDx - 640 + 4}" height="81" fill="${C.bone}"/>
  <path d="${Lfoot}" fill="${C.bone}" clip-path="url(#foot)"/>`
  // helix around the stem (centre 381), spanning the stem
  const h = helix({ axis: 'y', from: -1250, to: -150, c: 381.5, amp: 205, turns: 2.25, phase: Math.PI / 2 })
  const back = strandSVG(h, { grad: 'g2', w: 30, layer: 'back' })
  const front = strandSVG(h, { grad: 'g2', w: 30, gap: 22, layer: 'front' })
  const N = h.s1.length - 1
  const dot = (p) => `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="26" fill="url(#g2)"/>`
  const full = body.replace('<g id="helixBack"></g>', back) + front
  const x0 = 112, x1 = 1176 + footDx, pad = 330
  const wv = x1 - x0 + pad * 2, hv = 1440 + pad * 2
  const side = Math.max(wv, hv)
  return { body: full, vb: [x0 - pad - (side - wv) / 2, -1400 - pad - (side - hv) / 2, side, side] }
}

// ---------- V3: "Seal"  BL inside a ring that is itself a double helix
function v3() {
  const cx = (112 + Lx + 1176) / 2, cy = -700, R = 1500, amp = 64, n = 12
  const s1 = [], s2 = [], N = 1440
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * Math.PI * 2, a = th * n
    const r1 = R + Math.sin(a) * amp, r2 = R + Math.sin(a + GROOVE) * amp
    s1.push({ x: cx + Math.cos(th) * r1, y: cy + Math.sin(th) * r1, z: Math.cos(a) })
    s2.push({ x: cx + Math.cos(th) * r2, y: cy + Math.sin(th) * r2, z: Math.cos(a + GROOVE) })
  }
  const h = { s1, s2 }
  const rIdx = Array.from({ length: n * 2 }, (_, k) => Math.round((k / (n * 2)) * N + N / (n * 4)))
  const rungs = rungsOf(h, rIdx, 12, 0.6)
  const g = (s) => `<g transform="translate(${cx} ${cy}) scale(0.82) translate(${-cx} ${-cy})">${s}</g>`
  const body = `${defs('g3', [cx - R, cy - R, cx + R, cy + R])}
  ${strandSVG(h, { grad: 'g3', w: 22, layer: 'back', rungs })}
  ${strandSVG(h, { grad: 'g3', w: 22, gap: 16, layer: 'front', rungs })}
  ${g(`<path d="${B}" fill="${C.bone}"/><path d="${L}" fill="${C.bone}"/>`)}`
  const side = (R + amp + 260) * 2
  return { body, vb: [cx - side / 2, cy - side / 2, side, side] }
}


// shared pieces of the one-stem ligature: B + the L's foot carried out past the lower bowl
const FOOT_DX = 560
function ligature(fill, maskId, footDx = FOOT_DX, bold = 0) {
  const Lfoot = glyph('L', footDx)
  const st = bold ? ` stroke="${fill}" stroke-width="${bold}" stroke-linejoin="round"` : ''
  return `<clipPath id="foot${maskId}"><rect x="${880 + footDx}" y="-700" width="800" height="800"/></clipPath>
  <g fill="${fill}"${st}${maskId ? ` mask="url(#${maskId})"` : ''}>
    <path d="${B}"/><rect x="498" y="-78" width="${880 + footDx - 498 + 4}" height="78"/>
    <path d="${Lfoot}" clip-path="url(#foot${maskId})"/>
  </g>`
}
function squareVB(x0, x1, y0, y1, pad) {
  const wv = x1 - x0 + pad * 2, hv = y1 - y0 + pad * 2, side = Math.max(wv, hv)
  return [x0 - pad - (side - wv) / 2, y0 - pad - (side - hv) / 2, side, side]
}
// depth-shaded strands with no letter to pass behind: back runs dimmer and thinner
function depthStrands(h, grad, w, rungs, gapW = w * 0.45, gapClip = '') {
  let o = ''
  const gc = gapClip ? ` clip-path="url(#${gapClip})"` : ''
  for (const r of rungs) o += `<path d="M${f(r.a.x)} ${f(r.a.y)}L${f(r.b.x)} ${f(r.b.y)}" stroke="url(#${grad})" stroke-width="${r.w}" opacity="${r.op}"/>`
  for (const s of [h.s1, h.s2]) for (const r of runs(s)) if (!r.front) o += `<path d="${d(r.pts)}" fill="none" stroke="url(#${grad})" stroke-width="${w}" stroke-linecap="round"/>`
  for (const s of [h.s1, h.s2]) for (const r of runs(s)) if (r.front) o += `<path d="${d(r.pts)}" fill="none" stroke="${C.black}" stroke-width="${w + gapW * 2}" stroke-linecap="butt"${gc}/><path d="${d(r.pts)}" fill="none" stroke="url(#${grad})" stroke-width="${w}" stroke-linecap="round"/>`
  return o
}

// ---------- V4: "Spine"  the shared stem IS the double helix
const STEM = { x0: 265, x1: 498, c: 381.5 }
function v4(opts = {}) {
  const { w = 30, amp = 92, turns = 1.5, rungN = 8, y0 = -1300, y1 = -100, id = 'g4', grad = undefined, footDx = FOOT_DX, bold = 0, pad = 330, holeX0 = STEM.x0, holeX1 = STEM.x1, phase = 0, gap = 0.45, solid = 0 } = opts
  // strands run a little past the hole so their ends tuck under the caps
  const h = helix({ axis: 'y', from: y0 - 40, to: y1 + 40, c: (holeX0 + holeX1) / 2, amp, turns, phase })
  const N = h.s1.length - 1
  const rIdx = rungN === 0 ? [] : Array.from({ length: rungN }, (_, k) => Math.round((0.06 + (0.88 * (k + 0.5)) / rungN) * N))
  const rungs = rungsOf(h, rIdx, w * 0.4, 0.9)
  const body = `${defs(id, grad)}
  <mask id="${id}m" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="8000" height="8000"><rect x="-4000" y="-4000" width="8000" height="8000" fill="#fff"/><rect x="${holeX0 - 3}" y="${y0}" width="${holeX1 - holeX0 + 6}" height="${y1 - y0}" fill="#000"/></mask>
  <clipPath id="${id}h"><rect x="${holeX0}" y="${y0}" width="${holeX1 - holeX0}" height="${y1 - y0}"/></clipPath>
  ${solid ? `<rect x="${holeX0 - 2}" y="${y0 - 2}" width="${holeX1 - holeX0 + 4}" height="${y1 - y0 + 4}" fill="url(#${id})"/><g clip-path="url(#${id}h)">${[h.s1, h.s2].map((st) => `<path d="${d(st)}" fill="none" stroke="${C.black}" stroke-width="${solid}"/>`).join('')}</g>` : depthStrands(h, id, w, rungs, w * gap, id + 'h')}
  ${ligature(C.bone, id + 'm', footDx, bold)}`
  return { body, vb: squareVB(112 - bold / 2, 1176 + footDx + bold / 2, -1400 - bold / 2, 40 + bold / 2, pad), h }
}

// ---------- V2b: "Wound"  a fine helix winds once and a half round the shared stem
function v2b() {
  const h = helix({ axis: 'y', from: -1180, to: -220, c: 381.5, amp: 190, turns: 1.25, phase: Math.PI / 2 })
  const body = `${defs('g2')}
  ${strandSVG(h, { grad: 'g2', w: 22, layer: 'back' })}
  ${ligature(C.bone, '')}
  ${strandSVG(h, { grad: 'g2', w: 22, gap: 18, layer: 'front' })}`
  return { body, vb: squareVB(112, 1176 + FOOT_DX, -1400, 40, 330) }
}

const variants = { v1: v1(), v2: v2b(), v3: v3(), v4: v4(),
  s0: v4({ id: 'gs0', footDx: 430, bold: 120, amp: 150, turns: 0.5, rungN: 0, pad: 40, holeX0: 205, holeX1: 558, phase: Math.PI / 2, solid: 70 }),
  s1: v4({ id: 'gs1', footDx: 450, bold: 100, amp: 140, turns: 1, rungN: 0, pad: 60, holeX0: 215, holeX1: 548, phase: Math.PI / 2, solid: 50 }),
  m: v4({ id: 'gm', bold: 34, w: 46, amp: 92, turns: 1.5, rungN: 6, pad: 150, holeX0: 248, holeX1: 515, gap: 0.4 }),
  s2: v4({ id: 'gs2', footDx: 500, bold: 50, w: 56, amp: 86, turns: 1.25, rungN: 4, pad: 110, holeX0: 240, holeX1: 523, gap: 0.35 }),
}
for (const [k, v] of Object.entries(variants)) {
  const vb = v.vb.map(f).join(' ')
  fs.writeFileSync(path.join(out, `${k}.svg`), svg(vb, v.body))
  fs.writeFileSync(path.join(out, `${k}-bg.svg`), svg(vb, `<rect x="${v.vb[0]}" y="${v.vb[1]}" width="${v.vb[2]}" height="${v.vb[3]}" fill="${C.black}"/>` + v.body))
}
console.log('ok', Object.keys(variants))
