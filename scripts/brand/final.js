// node final.js <svgDir> <fontDir> <repoRoot>
// Composes the shipped brand files from the generated marks and rasterises the PNG/ICO set.
const { chromium } = require('playwright')
const ot = require('opentype.js')
const fs = require('fs'), path = require('path')
const [dir, fontDir, repo] = process.argv.slice(2)
const C = { black: '#080808', bone: '#F2F1EC', label: '#8C8A84', tan: '#D0AE82', tanMuted: '#AC906A', tanLight: '#E8D5B5' }

const read = (n) => fs.readFileSync(path.join(dir, n + '.svg'), 'utf8')
const parts = (n) => { const s = read(n); return { vb: s.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number), body: s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') } }
const nest = (n, x, y, w, h) => { const p = parts(n); return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${p.vb.join(' ')}">${p.body}</svg>` }
const doc = (W, H, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${inner}</svg>`

const out = {
  brand: path.join(repo, 'public', 'brand'),
  icons: path.join(repo, 'public', 'icons'),
  app: path.join(repo, 'src', 'app'),
}
for (const d of Object.values(out)) fs.mkdirSync(d, { recursive: true })

// ---- vector masters
const mono = read('v4').replace('<svg ', '<svg width="512" height="512" ')
const monoSmall = read('s1').replace('<svg ', '<svg width="64" height="64" ')
fs.writeFileSync(path.join(out.brand, 'blackline-monogram.svg'), `<!-- Blackline Method monogram. B and L share one stem; the stem is the double helix. Fraunces 400 outlines. -->\n${mono}\n`)
fs.writeFileSync(path.join(out.brand, 'blackline-monogram-small.svg'), `<!-- Blackline Method monogram, small sizes (16 to 48px): heavier letters, a solid strand stem. -->\n${monoSmall}\n`)

// ---- horizontal lockup: monogram + BLACKLINE wordmark (Fraunces 400, tracked 0.42em, as outlines)
const font = ot.loadSync(path.join(fontDir, 'f14.ttf'))
function wordmark(text, size, track) {
  let x = 0, d = ''
  const glyphs = font.stringToGlyphs(text)
  glyphs.forEach((g, i) => { d += g.getPath(x, 0, size).toPathData(2); x += (g.advanceWidth / font.unitsPerEm) * size + (i < glyphs.length - 1 ? track * size : 0) })
  return { d, w: x }
}
{
  // proportions taken from the header: 13px wordmark (cap 9.1px) beside a 24px monogram
  const H = 240, capH = 0.7, size = 13 * (H / 26), wm = wordmark('BLACKLINE', size, 0.42)
  const p = parts('v4'), pad = 330, side = p.vb[2], k = H / (side - pad * 2) // monogram cap height == H
  const mW = side * k, mX = -pad * k, gap = H * 0.5
  const W = mW - 2 * pad * k + gap + wm.w
  const capPx = size * capH, base = H / 2 + capPx / 2 + 0 // optical centre on the monogram's cap height
  const lock = doc(Math.ceil(W), H + 24, `<g transform="translate(0 12)">${nest('v4', mX, -pad * k, mW, mW)}<path transform="translate(${mW - 2 * pad * k + gap} ${base})" d="${wm.d}" fill="${C.bone}"/></g>`)
  fs.writeFileSync(path.join(out.brand, 'blackline-lockup.svg'), `<!-- Blackline Method horizontal lockup: monogram + BLACKLINE wordmark (Fraunces 400, tracked 0.42em, outlined). Not used in the header yet. -->\n${lock}\n`)
}

// ---- favicon SVG: the small mark on a black tile, readable on light and dark tab bars
const tile = (n, S, inset, r) => doc(S, S, `<rect width="${S}" height="${S}" rx="${r}" fill="${C.black}"/>${nest(n, inset, inset, S - inset * 2, S - inset * 2)}`)
fs.writeFileSync(path.join(out.app, 'icon.svg'), tile('s1', 64, 3, 12) + '\n')

// ---- rasters
const square = (n, S, inset) => doc(S, S, `<rect width="${S}" height="${S}" fill="${C.black}"/>${nest(n, inset, inset, S - inset * 2, S - inset * 2)}`)
const jobs = [
  ['ico16', tile('s0', 16, 0, 3), 16],
  ['ico32', tile('s1', 32, 1, 6), 32],
  ['ico48', tile('s1', 48, 2, 9), 48],
  [path.join(out.app, 'apple-icon.png'), square('m', 180, 32), 180],
  [path.join(out.icons, 'icon-192.png'), square('m', 192, 34), 192],
  [path.join(out.icons, 'icon-512.png'), square('m', 512, 90), 512],
  // maskable: everything inside the central 80% circle
  [path.join(out.icons, 'icon-maskable-512.png'), square('m', 512, 118), 512],
]

function ico(pngs) {
  const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4)
  const dirs = [], datas = []; let off = 6 + 16 * pngs.length
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0); e.writeUInt8(size >= 256 ? 0 : size, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(off, 12)
    off += buf.length; dirs.push(e); datas.push(buf)
  }
  return Buffer.concat([head, ...dirs, ...datas])
}

;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage()
  const raster = async (svg, S) => {
    await p.setViewportSize({ width: S, height: S })
    await p.setContent(`<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${S}" height="${S}" style="display:block"></body></html>`)
    await p.waitForTimeout(60)
    return p.screenshot({ omitBackground: true })
  }
  const icoParts = []
  for (const [name, svg, S] of jobs) {
    const buf = await raster(svg, S)
    if (name.startsWith('ico')) icoParts.push({ size: S, buf })
    else fs.writeFileSync(name, buf)
  }
  fs.writeFileSync(path.join(out.app, 'favicon.ico'), ico(icoParts))
  for (const q of icoParts) fs.writeFileSync(path.join(dir, `fav-${q.size}.png`), q.buf)

  // ---- share image 1200x630
  const f64 = (f) => fs.readFileSync(path.join(fontDir, f)).toString('base64')
  const mono64 = Buffer.from(read('v4')).toString('base64')
  const og = `<html><head><style>
    @font-face{font-family:F;src:url(data:font/ttf;base64,${f64('f14.ttf')})}
    @font-face{font-family:I;src:url(data:font/ttf;base64,${f64('inter500.ttf')})}
    html,body{margin:0;background:${C.black}}
    .s{position:relative;width:1200px;height:630px;overflow:hidden;background:${C.black};display:flex;flex-direction:column;align-items:center;justify-content:center}
    .glow{position:absolute;inset:0;background:radial-gradient(46% 62% at 44% 40%, rgba(47,163,154,0.07), transparent 70%),radial-gradient(46% 62% at 57% 44%, rgba(122,108,242,0.08), transparent 70%)}
    .m{position:relative;width:300px;height:300px;margin-top:-34px}
    .w{position:relative;font-family:F;font-size:30px;letter-spacing:0.42em;margin-right:-0.42em;color:${C.bone};text-transform:uppercase;margin-top:-26px}
    .r{position:relative;width:44px;height:1px;margin:30px 0 28px;background:linear-gradient(90deg,${C.tanMuted},${C.tanLight},${C.tanMuted})}
    .l{position:relative;font-family:I;font-weight:500;font-size:14px;letter-spacing:0.2em;margin-right:-0.2em;color:${C.label};text-transform:uppercase}
  </style></head><body><div class="s" id="og"><div class="glow"></div>
    <img class="m" src="data:image/svg+xml;base64,${mono64}">
    <div class="w">Blackline Method</div><div class="r"></div>
    <div class="l">Private optimization practice &nbsp;·&nbsp; Dallas, Texas</div></div></body></html>`
  await p.setViewportSize({ width: 1200, height: 630 })
  await p.setContent(og); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150)
  const ogBuf = await p.locator('#og').screenshot()
  fs.writeFileSync(path.join(out.app, 'opengraph-image.png'), ogBuf)
  fs.writeFileSync(path.join(out.app, 'twitter-image.png'), ogBuf)
  await b.close()
  console.log('written')
})()
