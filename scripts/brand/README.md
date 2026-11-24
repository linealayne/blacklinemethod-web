# Brand mark generator

Makes the BL monogram (the shared stem is the double helix) from Fraunces 400 outlines, then writes the favicon set, app icons, share image and lockup.

1. `npm i --no-save opentype.js@1.3.4`
2. Put the static Fraunces 400 TTF (`https://fonts.googleapis.com/css2?family=Fraunces:wght@400`, fetched with an old user agent so it serves TTF) at `<fonts>/f14.ttf`, and Inter 500 at `<fonts>/inter500.ttf`.
3. `node scripts/brand/mark.js <fonts>/f14.ttf <tmp>`: the variants (`v4` is the shipped mark, `s0`/`s1` the small sizes, `m` the app icon weight, `v2`/`v3` the unused alternatives).
4. `node scripts/brand/final.js <tmp> <fonts> .`: writes `public/brand/*`, `public/icons/*`, `src/app/{icon.svg,favicon.ico,apple-icon.png,opengraph-image.png,twitter-image.png}`.
