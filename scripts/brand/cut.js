// Blackline mark: the Cut B. A bold Fraunces B (opsz 144, wght 700) sliced once through the lower bowl by a thin
// black line. Tan is the only colour. Writes every shipped brand file. See scripts/brand/README.md.
// node scripts/brand/cut.js <fontDir> <scratchDir>
const { chromium } = require('playwright')
const ot = require('opentype.js')
const fs = require('fs'), path = require('path')
const [fontDir, scratch] = process.argv.slice(2)
const repo = path.join(__dirname, '..', '..')
const font = ot.loadSync(path.join(fontDir, 'f144b.ttf')) // Fraunces opsz 144, wght 700
const word = ot.loadSync(path.join(fontDir, 'f14.ttf')) // Fraunces 400 (the site's wordmark)
const C = { black: '#080808', bone: '#F2F1EC', label: '#8C8A84', tan: '#D0AE82', muted: '#AC906A', light: '#E8D5B5' }
const r = (n) => +n.toFixed(2)
fs.mkdirSync(scratch, { recursive: true })
const dirs = { brand: path.join(repo, 'public', 'brand'), icons: path.join(repo, 'public', 'icons'), app: path.join(repo, 'src', 'app') }
for (const d of Object.values(dirs)) fs.mkdirSync(d, { recursive: true })

const CUT_AT = 0.77 // the slice's centre, as a fraction of cap height from the top: through the lower bowl
const CUT_LARGE = 0.0233 // slice thickness / cap height at large sizes

// The B in a box: cap height `cap`, centred at (cx, cy). Returns the path and its geometry.
function glyphB(cap, cx, cy) {
  const g = font.charToGlyph('B'), size = cap / 0.7, k = size / font.unitsPerEm, bb = g.getBoundingBox()
  const w = (bb.x2 - bb.x1) * k, x = cx - w / 2 - bb.x1 * k, top = cy - cap / 2
  return { d: g.getPath(x, top + cap, size).toPathData(2), top, cap, x0: cx - w / 2, w }
}
const gradient = (id, x1, y1, x2, y2) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}"><stop offset="0" stop-color="${C.muted}"/><stop offset="0.4" stop-color="${C.tan}"/><stop offset="0.56" stop-color="${C.light}"/><stop offset="0.72" stop-color="${C.tan}"/><stop offset="1" stop-color="${C.muted}"/></linearGradient>`

// The mark inside a W x H viewBox. cut: {y, h} in viewBox units. Transparent outside the letter.
function mark(id, W, H, b, cut, ground = '', ox = 0, oy = 0) {
  return `<defs>${gradient(id + 'g', b.x0, b.top, b.x0 + b.w, b.top + b.cap)}<mask id="${id}m" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="8000" height="8000"><rect x="-4000" y="-4000" width="8000" height="8000" fill="#fff"/><rect x="-4000" y="${r(cut.y)}" width="8000" height="${r(cut.h)}" fill="#000"/></mask></defs>${ground}<path d="${b.d}" fill="url(#${id}g)" mask="url(#${id}m)"/>`
}
const doc = (W, H, inner, size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"${size ? ` width="${size[0]}" height="${size[1]}"` : ''}>${inner}</svg>`

// Large master: 1000 box, cap 640, the thin slice.
function master() {
  const b = glyphB(640, 500, 500)
  const h = b.cap * CUT_LARGE
  return doc(1000, 1000, mark('bm', 1000, 1000, b, { y: b.top + b.cap * CUT_AT - h / 2, h }))
}

// Pixel-snapped icon for an S x S raster: a black tile (radius rx px) or a full-bleed square, the B at `capFrac`
// of the tile, the slice `cutPx` pixels thick and aligned to whole pixel rows so it never blurs away.
function icon(S, { capFrac, cutPx, rx = 0, id }) {
  const u = 1000 / S
  const b = glyphB(1000 * capFrac, 506, 500)
  const want = b.top + b.cap * CUT_AT - (cutPx * u) / 2
  const y = Math.round(want / u) * u
  const ground = `<rect width="1000" height="1000" rx="${r(rx * u)}" fill="${C.black}"/>`
  return doc(1000, 1000, mark(id, 1000, 1000, b, { y, h: cutPx * u }, ground), [S, S])
}

// Horizontal lockup: the mark + BLACKLINE (Fraunces 400, tracked 0.42em, outlined, bone), header proportions.
function lockup() {
  const H = 240, b = glyphB(H, 0, H / 2)
  const markX = -b.x0, cut = { y: b.top + b.cap * CUT_AT - (b.cap * CUT_LARGE) / 2, h: b.cap * CUT_LARGE }
  const size = 13 * (H / 26), track = 0.42 * size, gap = H * 0.42
  let x = 0, d = ''
  const glyphs = word.stringToGlyphs('BLACKLINE')
  glyphs.forEach((g, i) => { d += g.getPath(x, 0, size).toPathData(2); x += (g.advanceWidth / word.unitsPerEm) * size + (i < glyphs.length - 1 ? track : 0) })
  const W = Math.ceil(b.w + gap + x), capPx = size * 0.7
  const inner = `<g transform="translate(${r(markX)} 12)">${mark('bl', W + 400, H + 24, b, { y: cut.y, h: cut.h })}</g><path transform="translate(${r(b.w + gap)} ${r(12 + H / 2 + capPx / 2)})" d="${d}" fill="${C.bone}"/>`
  return doc(W, H + 24, inner)
}

function ico(pngs) {
  const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4)
  const ents = [], datas = []; let off = 6 + 16 * pngs.length
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16); e.writeUInt8(size, 0); e.writeUInt8(size, 1); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(off, 12)
    off += buf.length; ents.push(e); datas.push(buf)
  }
  return Buffer.concat([head, ...ents, ...datas])
}

;(async () => {
  // vectors
  const head = (t) => `<!-- ${t} -->\n`
  fs.writeFileSync(path.join(dirs.brand, 'blackline-mark.svg'), head('Blackline Method mark: the Cut B. Fraunces B (opsz 144, wght 700), sliced by one black line. Transparent; place on black.') + master() + '\n')
  fs.writeFileSync(path.join(dirs.brand, 'blackline-mark-small.svg'), head('Blackline Method mark, small sizes (16 to 48px): a larger B with a heavier slice, on a black tile.') + icon(32, { capFrac: 0.78, cutPx: 2, rx: 6, id: 'bs' }).replace(' width="32" height="32"', '') + '\n')
  fs.writeFileSync(path.join(dirs.brand, 'blackline-lockup.svg'), head('Blackline Method horizontal lockup: the Cut B + BLACKLINE (Fraunces 400, tracked 0.42em, outlined). Not used in the header.') + lockup() + '\n')
  fs.writeFileSync(path.join(dirs.app, 'icon.svg'), icon(32, { capFrac: 0.78, cutPx: 2, rx: 6, id: 'fi' }).replace(' width="32" height="32"', '') + '\n')

  const b = await chromium.launch(); const p = await b.newPage()
  const raster = async (svg, S) => {
    await p.setViewportSize({ width: S, height: S })
    await p.setContent(`<body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${S}" height="${S}" style="display:block">`)
    await p.waitForTimeout(50)
    return p.screenshot({ omitBackground: true })
  }
  const icoParts = []
  for (const [S, o] of [[16, { capFrac: 0.82, cutPx: 1, rx: 3 }], [32, { capFrac: 0.78, cutPx: 2, rx: 6 }], [48, { capFrac: 0.76, cutPx: 2, rx: 9 }]]) {
    const buf = await raster(icon(S, { ...o, id: 'i' + S }), S); icoParts.push({ size: S, buf }); fs.writeFileSync(path.join(scratch, `fav-${S}.png`), buf)
  }
  fs.writeFileSync(path.join(dirs.app, 'favicon.ico'), ico(icoParts))
  const apps = [
    [path.join(dirs.app, 'apple-icon.png'), 180, { capFrac: 0.56, cutPx: 4 }],
    [path.join(dirs.icons, 'icon-192.png'), 192, { capFrac: 0.56, cutPx: 4 }],
    [path.join(dirs.icons, 'icon-512.png'), 512, { capFrac: 0.56, cutPx: 9 }],
    [path.join(dirs.icons, 'icon-maskable-512.png'), 512, { capFrac: 0.44, cutPx: 8 }], // inside the 80% safe circle
  ]
  for (const [file, S, o] of apps) fs.writeFileSync(file, await raster(icon(S, { ...o, id: 'a' + S }), S))

  // share image
  const f64 = (f) => fs.readFileSync(path.join(fontDir, f)).toString('base64')
  const m64 = Buffer.from(master()).toString('base64')
  await p.setViewportSize({ width: 1200, height: 630 })
  await p.setContent(`<html><head><style>
    @font-face{font-family:F;src:url(data:font/ttf;base64,${f64('f14.ttf')})}
    @font-face{font-family:I;src:url(data:font/ttf;base64,${f64('inter500.ttf')})}
    body{margin:0;background:${C.black}}
    .s{position:relative;width:1200px;height:630px;overflow:hidden;background:${C.black};display:flex;flex-direction:column;align-items:center;justify-content:center}
    .glow{position:absolute;inset:0;background:radial-gradient(46% 62% at 44% 40%, rgba(47,163,154,0.07), transparent 70%),radial-gradient(46% 62% at 57% 44%, rgba(122,108,242,0.08), transparent 70%)}
    .m{position:relative;width:300px;height:300px;margin-top:-30px}
    .w{position:relative;font-family:F;font-size:30px;letter-spacing:0.42em;margin-right:-0.42em;color:${C.bone};text-transform:uppercase;margin-top:-20px}
    .r{position:relative;width:44px;height:1px;margin:30px 0 28px;background:linear-gradient(90deg,${C.muted},${C.light},${C.muted})}
    .l{position:relative;font-family:I;font-weight:500;font-size:14px;letter-spacing:0.2em;margin-right:-0.2em;color:${C.label};text-transform:uppercase}
  </style></head><body><div class="s" id="og"><div class="glow"></div><img class="m" src="data:image/svg+xml;base64,${m64}">
    <div class="w">Blackline Method</div><div class="r"></div><div class="l">Private optimization practice &nbsp;·&nbsp; Dallas, Texas</div></div></body></html>`)
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150)
  const og = await p.locator('#og').screenshot()
  fs.writeFileSync(path.join(dirs.app, 'opengraph-image.png'), og); fs.writeFileSync(path.join(dirs.app, 'twitter-image.png'), og)
  await b.close(); console.log('written')
})()
