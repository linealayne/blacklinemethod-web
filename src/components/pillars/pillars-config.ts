/**
 * "The rotating gene": every tuning knob for the four-pillars scene on the
 * home page. Free of three.js imports.
 *
 * PROTECTED: this section is a staple of the site. Do not change how it
 * looks or moves unless Layne asks.
 *
 * How the cycle works. The gene turns about its own axis at a constant
 * speed. The four pillar nodes sit on the strands a quarter turn apart, so
 * every `turnsPerPillar` turns the next node swings to the front and its
 * pillar becomes the active one. Everything is driven by time, never by
 * scroll.
 */
export const PILLAR_GENE = {
  // the cycle
  turnSeconds: 8.8, // one full turn of the gene
  turnsPerPillar: 1.25, // each pillar stays active for this many turns (11 seconds)
  lead: 0.125, // turns into its window at which the active node faces the viewer
  jumpStiffness: 34, // spring that carries the gene to a node after a jump (per second squared)
  holdEase: 5, // how quickly the turn eases out and back in on pause (per second)
  nodeEase: 4.5, // how quickly a node lights and dims (per second)

  // geometry (world units; the camera sees about 9.2 units of height)
  radius: 1.6,
  pitch: 3.45, // length of one full twist
  strandJitter: 0.08,
  rungPoints: 12,
  rungsPerTurn: 10,
  /** where the four nodes sit along the strand, first pillar first (1 = top on desktop, left on phones) */
  nodeAt: [0.86, 0.62, 0.38, 0.14],

  layout: {
    // vertical gene, left of the pillar text
    desktop: { length: 7.9, x: 0.285, y: 0.5, fill: 0.84, maxWidth: 0.32, tiltZ: -0.07, tiltX: 0.1, points: 1.08 },
    // horizontal gene across the top; its length is fitted to the canvas
    phone: { minLength: 8, maxLength: 20, fillH: 0.66, fillW: 0.93, tiltZ: -0.02, points: 1.5 },
  },

  // particle counts per device tier (strand particles are per unit of length, per strand)
  counts: {
    high: { strandPerUnit: 110, ambient: 520 },
    mid: { strandPerUnit: 80, ambient: 320 },
    low: { strandPerUnit: 46, ambient: 130 },
  },
  size: { strand: 15, rung: 11, ambient: 8, node: 170 },

  // the ripples: the same three as the hero gene
  pulseRate: 3.2, // rungs per second for the ember pulse along the strand
  scanEvery: 6.5,
  scanDuration: 1.8,
  jumpPulseDuration: 1.2, // the bright front that runs along the strand after a jump

  fov: 32,
  camZ: 16,
  dprCap: 2,
  slowFrameMs: 22,
}

export const PILLAR_COUNT = PILLAR_GENE.nodeAt.length
