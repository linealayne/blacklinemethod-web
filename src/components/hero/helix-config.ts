/**
 * "The living sequence": every tuning knob for the hero scene. Kept free of
 * three.js imports so the hero section can read layout values (HUD label
 * positions) without pulling WebGL into its bundle.
 *
 * Where to tune what:
 *   intro timing        introDuration, lockAt, skipDuration
 *   idle life           spin, pulseRate, scanEvery, scanDuration, breathe
 *   cursor feel         tiltX, tiltY, tiltStiffness, tiltDamping, scatterRadius, scatterForce
 *   density per device  counts (tier picked in HeroHelix.tsx)
 *   composition         layout.desktop / layout.phone, HUD below
 */
export const HELIX = {
  // geometry (world units; the camera sees about 9 units of height)
  length: 8.6,
  radius: 1.2,
  turns: 3.1,
  strandPhase: Math.PI * 0.82, // offset between the two strands (gives the grooves)
  rungs: 34, // base pairs (phones: rungsPhone)
  rungsPhone: 24,
  rungPoints: 12, // particles per rung
  strandJitter: 0.07, // radial scatter of strand particles

  // particle counts per device tier
  counts: {
    high: { strand: 900, ambient: 2600 },
    mid: { strand: 620, ambient: 1500 },
    low: { strand: 420, ambient: 760 },
  },

  // particle sizes (scaled by viewport height and DPR in the shader)
  size: { strand: 15, rung: 11, ambient: 9 },

  // camera
  fov: 32,
  camZ: 16,

  // layout: where the helix sits, as a fraction of the hero box
  layout: {
    desktop: { x: 0.68, y: 0.39, scale: 0.9, tiltZ: -0.98 },
    phone: { x: 0.56, y: 0.29, scale: 0.55, tiltZ: -0.62 },
  },

  // idle motion
  spin: 0.16, // radians per second about the strand axis
  introSpin: 1.6, // extra spin at the start of the intro, easing out to `spin`
  pulseRate: 3.2, // rungs per second for the amber pulse down the strand
  scanEvery: 5.5, // seconds between scan sweeps
  scanDuration: 1.8,
  breathe: 0.22, // colour breathing speed (radians per second)

  // intro
  introDuration: 2.3, // seconds for the particles to converge (first visit)
  returnDuration: 1.2, // quick settle on later visits (copy already visible)
  lockAt: 0.86, // intro progress at which the copy resolves in
  skipDuration: 0.4,

  // interaction
  tiltX: 0.16, // radians toward the cursor (vertical)
  tiltY: 0.24, // radians toward the cursor (horizontal)
  tiltStiffness: 3.2, // spring toward the target tilt (per second)
  tiltDamping: 0.86,
  scatterRadius: 0.16, // NDC radius of the cursor's influence
  scatterForce: 0.75, // view-space push at the centre of the influence
  clickPulseDuration: 1.5,

  // rendering
  dprCap: 2,
  slowFrameMs: 22, // average frame time that triggers the DPR step-down
  colors: {
    amber: '#C8965A',
    teal: '#2FA39A',
    violet: '#7A6CF2',
    offwhite: '#F2F1EC',
  },
}

/**
 * HUD biomarker labels at the edges of the scene. `x`/`y` place the label
 * (fraction of the hero box), `at` is where along the strand its leader
 * line lands (0 bottom, 1 top), `side` is which side of the strand.
 * Decorative only: no values, no results. Labels are set as written
 * (no text-transform) so HbA1c keeps its lab casing.
 */
export const HUD = [
  { id: 'testosterone', label: 'TESTOSTERONE', x: 0.62, y: 0.13, px: 0.42, py: 0.1, at: 0.78, side: -1, color: 'var(--bl-amber)', phone: true },
  { id: 'vitamin-d', label: 'VITAMIN D', x: 0.87, y: 0.43, px: 0.7, py: 0.42, at: 0.4, side: 1, color: 'var(--bl-teal)', phone: true },
  { id: 'hba1c', label: 'HbA1c', x: 0.87, y: 0.57, px: 0, py: 0, at: 0.32, side: 1, color: 'var(--bl-violet)', phone: false },
  { id: 'cortisol', label: 'CORTISOL', x: 0.47, y: 0.29, px: 0, py: 0, at: 0.2, side: -1, color: 'var(--bl-teal)', phone: false },
] as const
