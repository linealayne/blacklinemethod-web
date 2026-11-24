# Brand mark generator

The mark is the Cut B: a bold Fraunces B (opsz 144, wght 700) sliced once through the lower bowl by a thin black line, in a tan metallic gradient. `cut.js` writes every shipped brand file.

1. `npm i --no-save opentype.js@1.3.4`
2. Put these TTFs in a fonts folder (fetch each Google Fonts CSS URL with an old user agent, such as `curl -A "Mozilla/4.0"`, so it serves TTF): `f144b.ttf` from `css2?family=Fraunces:opsz,wght@144,700`, `f14.ttf` from `css2?family=Fraunces:wght@400`, `inter500.ttf` from `css2?family=Inter:wght@500`.
3. `node scripts/brand/cut.js <fonts> <scratch>` writes `public/brand/*`, `public/icons/*`, `src/app/{icon.svg,favicon.ico,apple-icon.png,opengraph-image.png,twitter-image.png}`, and the favicon frames to `<scratch>`.

The icon sizes snap the slice to whole pixel rows (1px at 16, 2px at 32 and 48), so it never blurs away. Keep that if you change `CUT_AT` or the icon sizes.
