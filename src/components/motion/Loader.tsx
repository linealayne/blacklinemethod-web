const WORDMARK = 'BLACKLINE'

/**
 * The wordmark as nine letter spans. The header logo and the loading screen
 * both render exactly this, so the two are the same glyph runs, the same
 * widths, and line up to the pixel when one hands over to the other.
 */
export function WordmarkLetters() {
  return (
    <>
      {WORDMARK.split('').map((ch, i) => (
        <span key={i} style={{ '--i': i } as React.CSSProperties}>
          {ch}
        </span>
      ))}
    </>
  )
}

/**
 * The loading screen: a dark screen, the BLACKLINE wordmark typing out in
 * the centre with a small loading line filling beneath it, then the wordmark
 * slides up and left onto the header logo.
 *
 * It is server-rendered and driven entirely by CSS (globals.css, "The
 * loading sequence") from classes the inline flags script sets, so it shows
 * on the very first paint and never waits for React.
 *
 * The wordmark here is laid out exactly as the header's: the same wrapper
 * (`bl-wrap`, header height, vertically centred), the same class
 * (`bl-wordmark`), the same padding, the same letter spans (WordmarkLetters). Its resting position IS the header
 * logo's position; the centre of the screen is only a transform away. That
 * is what makes the handoff exact, with no font swap and no jump.
 */
export function Loader() {
  return (
    <div id="bl-loader" aria-hidden="true">
      <div className="bl-loader-bg" />
      <div className="bl-wrap relative h-[var(--bl-header)] flex items-center justify-between">
        <span className="bl-wordmark bl-loader-word py-3">
          <WordmarkLetters />
          <i className="bl-loader-line" />
        </span>
      </div>
    </div>
  )
}
