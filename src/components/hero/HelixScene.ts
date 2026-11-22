import * as THREE from 'three'
import { HELIX } from './helix-config'

/**
 * The living sequence: a double helix of glowing particles with base-pair
 * rungs, an ambient particle field with depth, orbital scan rings, and a
 * periodic scan sweep. All motion runs in the vertex shaders from a handful
 * of uniforms, so the CPU does almost nothing per frame.
 *
 * Plain three.js (no React renderer) so the loop, the pause, and the
 * disposal are explicit. See helix-config.ts.
 *
 * This file touches no DOM and no `window`: sizes, colours, and pointer
 * positions are handed in. That lets it run inside a web worker on an
 * OffscreenCanvas (helix.worker.ts), which keeps three.js, shader
 * compilation, and every frame off the page's main thread, or directly on
 * the main thread where OffscreenCanvas is missing. HeroHelix.tsx picks.
 */

export type Tier = 'high' | 'mid' | 'low'

export interface HelixOptions {
  canvas: HTMLCanvasElement | OffscreenCanvas
  /** the box the scene fills (the hero section), in CSS pixels, and the device pixel ratio */
  width: number
  height: number
  dpr: number
  /** the palette, read from the CSS tokens by the caller */
  colors: HelixColors
  tier: Tier
  phone: boolean
  /** first visit: play the full converge; otherwise a quick settle */
  intro: boolean
  /** called once the helix locks into shape (the copy resolves in) */
  onLock: () => void
  /** called after the first frame is drawn */
  onFirstFrame: () => void
  /** intro only: performance.now() (this thread's clock) before which the particles stay scattered */
  holdUntil?: number
}

export interface HelixColors {
  amber: string
  teal: string
  violet: string
  offwhite: string
}

export const VERT_POINTS = /* glsl */ `
  attribute vec3 aStart;
  attribute float aSeed;
  attribute float aT;
  attribute float aKind;   // 0, 1 strands; 2 rung; 3 ambient
  attribute float aRung;   // rung index (rungs only)
  attribute float aSize;

  uniform float uTime;
  uniform float uIntro;
  uniform float uLock;
  uniform float uScale;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform float uMouseForce;
  uniform float uScatterR;
  uniform float uPulse;      // continuous rung index of the amber pulse
  uniform float uRungs;
  uniform float uClickT;     // click pulse position along the strand (-1 off)
  uniform float uScanT;      // scan sweep position along the strand (-1 off)
  uniform float uCenterZ;    // view-space depth of the helix centre
  uniform vec3 uAmber;
  uniform vec3 uTeal;
  uniform vec3 uViolet;
  uniform vec3 uWhite;

  varying vec3 vColor;
  varying float vAlpha;

  float easeOut(float x) { return 1.0 - pow(1.0 - x, 3.0); }

  void main() {
    vec3 p = position;
    float t = uTime;

    // ambient field: slow drift and a gentle upward flow that wraps
    if (aKind > 2.5) {
      p.x += sin(t * 0.07 + aSeed * 40.0) * 0.45;
      p.z += cos(t * 0.05 + aSeed * 23.0) * 0.4;
      p.y = mod(p.y + t * (0.05 + aSeed * 0.08) + 9.0, 18.0) - 9.0;
    } else {
      // strands and rungs breathe very slightly
      p += normalize(p + vec3(0.0001)) * sin(t * 0.9 + aSeed * 50.0) * 0.025;
    }

    vec4 mvTarget = modelViewMatrix * vec4(p, 1.0);

    // intro: stream in from depth, staggered per particle, with a slight swirl
    float k = clamp((uIntro - aSeed * 0.42) / 0.58, 0.0, 1.0);
    k = easeOut(k);
    vec4 mvStart = vec4(aStart.x * 13.0, aStart.y * 8.0, -18.0 - aStart.z * 46.0, 1.0);
    float swirl = (1.0 - k) * 2.2 * (aSeed - 0.5);
    float cs = cos(swirl), sn = sin(swirl);
    mvStart.xy = mat2(cs, -sn, sn, cs) * mvStart.xy;
    vec4 mv = mix(mvStart, mvTarget, k);

    // cursor scatter: push away from the cursor in screen space, falling off with distance
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
    float dist = length(d);
    float f = uMouseForce * exp(-(dist * dist) / (uScatterR * uScatterR));
    mv.xy += (d / max(dist, 0.0001)) * f * ${HELIX.scatterForce.toFixed(3)} * (-mv.z / 16.0);
    gl_Position = projectionMatrix * mv;

    // colour: strands breathe between teal and violet with a touch of amber,
    // lifted toward off-white so the strand reads as light, not paint
    float breathe = 0.5 + 0.5 * sin(t * ${HELIX.breathe.toFixed(3)} + aT * 4.0 + aKind * 2.1);
    vec3 strandCol = mix(uTeal, uViolet, breathe);
    strandCol = mix(strandCol, uAmber, 0.18 * (0.5 + 0.5 * sin(t * 0.13 + aT * 2.0)));
    strandCol = mix(strandCol, uWhite, 0.32);

    float glow = 1.0;
    vec3 col;
    float alpha;

    if (aKind < 1.5) {
      col = strandCol;
      alpha = 0.8;
    } else if (aKind < 2.5) {
      // rungs: dim off-white, one at a time lit amber as the pulse travels down
      float idx = uRungs - 1.0 - aRung;
      float lag = uPulse - idx;
      float lit = exp(-lag * lag * 1.6) + (lag > 0.0 ? exp(-lag * 0.9) * 0.35 : 0.0);
      col = mix(uWhite * 0.55, uAmber, clamp(lit, 0.0, 1.0));
      glow += lit * 1.6;
      alpha = 0.32 + lit * 0.6;
    } else {
      float hue = fract(aSeed * 7.31);
      col = hue < 0.45 ? uTeal : (hue < 0.85 ? uViolet : uAmber);
      col = mix(col, uWhite, 0.25);
      alpha = 0.22 + 0.25 * fract(aSeed * 13.7);
    }

    if (aKind < 2.5) {
      // periodic scan sweep: a teal band travels down the strand
      if (uScanT > -0.5) {
        float s = exp(-pow((aT - uScanT) * 22.0, 2.0));
        col = mix(col, mix(uTeal, uWhite, 0.4), s * 0.85);
        glow += s * 1.4;
      }
      // click pulse: a bright amber-white front along the strand
      if (uClickT > -0.5) {
        float c = exp(-pow((aT - uClickT) * 13.0, 2.0));
        col = mix(col, mix(uAmber, uWhite, 0.45), c);
        glow += c * 2.6;
      }
      // the far side of the helix sits back in the dark
      float depth = smoothstep(uCenterZ - 1.6, uCenterZ + 1.4, mv.z);
      alpha *= mix(0.32, 1.0, depth);
    } else {
      // ambient: fade the nearest and farthest
      alpha *= smoothstep(-46.0, -14.0, mv.z) * (1.0 - smoothstep(-6.0, -1.0, mv.z));
    }

    // arriving particles are fainter; the lock flashes briefly
    alpha *= mix(0.6, 1.0, k);
    glow *= 1.0 + uLock * 0.9;

    vColor = col * glow;
    vAlpha = alpha;
    gl_PointSize = aSize * uScale * (1.0 + (glow - 1.0) * 0.18) / -mv.z;
  }
`

export const FRAG_POINTS = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float halo = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.16, 0.0, d);
    float a = (halo * halo * 0.55 + core * 0.9) * vAlpha;
    gl_FragColor = vec4(vColor * a, a);
  }
`

export const VERT_LINES = /* glsl */ `
  attribute float aT;
  attribute float aRung;
  uniform float uTime;
  uniform float uPulse;
  uniform float uRungs;
  uniform float uCenterZ;
  uniform float uOpacity;
  uniform float uClickT;
  varying float vA;
  varying float vLit;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float idx = uRungs - 1.0 - aRung;
    float lag = uPulse - idx;
    float lit = aRung < -0.5 ? 0.0 : exp(-lag * lag * 1.6);
    if (uClickT > -0.5) lit += exp(-pow((aT - uClickT) * 13.0, 2.0)) * 0.8;
    float depth = smoothstep(uCenterZ - 1.6, uCenterZ + 1.4, mv.z);
    vA = uOpacity * mix(0.3, 1.0, depth);
    vLit = lit;
  }
`

export const FRAG_LINES = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAmber;
  varying float vA;
  varying float vLit;
  void main() {
    vec3 col = mix(uBase, uAmber, clamp(vLit, 0.0, 1.0));
    float a = vA * (1.0 + vLit * 2.5);
    gl_FragColor = vec4(col * a, a);
  }
`

export const VERT_RING = /* glsl */ `
  attribute float aAngle;
  uniform float uSweep;
  varying float vH;
  void main() {
    float h = pow(max(0.0, cos(aAngle - uSweep)), 36.0);
    vH = h;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const FRAG_RING = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vH;
  void main() {
    float a = uOpacity * (0.22 + vH * 2.2);
    gl_FragColor = vec4(uColor * a, a);
  }
`

export const VERT_HALO = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const FRAG_HALO = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c * vec2(1.0, 0.62));
    float g = exp(-d * d * 11.0) * smoothstep(0.5, 0.28, length(c));
    float m = 0.5 + 0.5 * sin(uTime * 0.18 + c.y * 3.0);
    vec3 col = mix(uA, uB, m);
    float a = g * uOpacity;
    gl_FragColor = vec4(col * a, a);
  }
`

/** premultiplied colour added over what is below (the shaders output colour * alpha) */
export const ADDITIVE = {
  blending: THREE.CustomBlending,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
} as const

export function rand(seed: number) {
  // deterministic so the still and the live scene match
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function helixPoint(t: number, strand: number, out = new THREE.Vector3()) {
  const a = t * HELIX.turns * Math.PI * 2 + strand * HELIX.strandPhase
  return out.set(Math.cos(a) * HELIX.radius, (t - 0.5) * HELIX.length, Math.sin(a) * HELIX.radius)
}

export class HelixScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private tiltGroup = new THREE.Group() // layout position, base tilt, cursor tilt
  private spinGroup = new THREE.Group() // continuous rotation about the strand axis
  private ringGroup = new THREE.Group()
  private scanRing!: THREE.LineLoop
  private rings: { mesh: THREE.LineLoop; speed: number; sweepSpeed: number; mat: THREE.ShaderMaterial }[] = []
  private pointsMat!: THREE.ShaderMaterial
  private ambientMat!: THREE.ShaderMaterial
  private linesMat!: THREE.ShaderMaterial
  private backboneMat!: THREE.ShaderMaterial
  private haloMat!: THREE.ShaderMaterial
  private disposables: { dispose: () => void }[] = []

  private opts: HelixOptions
  private raf = 0
  private running = false
  private last = 0
  private time = 0
  private intro = 0
  private introSpeed: number
  private locked = false
  private lockFlash = 0
  private firstFrame = false
  private spinAngle = 0
  private pulse = 0
  private scanClock = 0
  private clickT = -1
  private rungs: number

  // interaction state
  private pointer = new THREE.Vector2(9, 9) // NDC, far away until the cursor arrives
  private pointerSmooth = new THREE.Vector2(9, 9)
  private force = 0
  private forceTarget = 0
  private tilt = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }
  private width = 1
  private height = 1
  private dpr = 1
  private deviceDpr = 1
  private frameTimes: number[] = []
  private steppedDown = false
  private centre = new THREE.Vector3()

  constructor(opts: HelixOptions) {
    this.opts = opts
    this.rungs = opts.phone ? HELIX.rungsPhone : HELIX.rungs
    this.intro = opts.intro ? 0 : 0.42
    this.introSpeed = 1 / (opts.intro ? HELIX.introDuration : HELIX.returnDuration) * (opts.intro ? 1 : 0.58)

    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    })
    this.renderer.setClearColor(0x000000, 0)
    this.camera = new THREE.PerspectiveCamera(HELIX.fov, 1, 0.1, 120)
    this.camera.position.set(0, 0, HELIX.camZ)
    this.camera.updateMatrixWorld()

    this.scene.add(this.tiltGroup)
    this.tiltGroup.add(this.spinGroup)
    this.tiltGroup.add(this.ringGroup)

    this.build()
    this.resize(opts.width, opts.height, opts.dpr)
  }

  private build() {
    const c = this.opts.colors
    const col = (hex: string) => new THREE.Color(hex)
    const counts = HELIX.counts[this.opts.tier]
    const r = rand(1984)

    const common = {
      uTime: { value: 0 },
      uIntro: { value: this.intro },
      uLock: { value: 0 },
      uScale: { value: 1 },
      uAspect: { value: 1 },
      uMouse: { value: this.pointerSmooth },
      uMouseForce: { value: 0 },
      uScatterR: { value: HELIX.scatterRadius },
      uPulse: { value: 0 },
      uRungs: { value: this.rungs },
      uClickT: { value: -1 },
      uScanT: { value: -1 },
      uCenterZ: { value: -HELIX.camZ },
      uAmber: { value: col(c.amber) },
      uTeal: { value: col(c.teal) },
      uViolet: { value: col(c.violet) },
      uWhite: { value: col(c.offwhite) },
    }

    // ---- strands + rungs (one Points object, spins with the helix)
    const strandN = counts.strand
    const rungN = this.rungs * HELIX.rungPoints
    const total = strandN * 2 + rungN
    const pos = new Float32Array(total * 3)
    const start = new Float32Array(total * 3)
    const seed = new Float32Array(total)
    const tArr = new Float32Array(total)
    const kind = new Float32Array(total)
    const rung = new Float32Array(total)
    const size = new Float32Array(total)
    const v = new THREE.Vector3()
    let i = 0
    const put = (x: number, y: number, z: number, t: number, k: number, ri: number, s: number) => {
      pos.set([x, y, z], i * 3)
      start.set([r() * 2 - 1, r() * 2 - 1, r()], i * 3)
      seed[i] = r()
      tArr[i] = t
      kind[i] = k
      rung[i] = ri
      size[i] = s
      i++
    }
    for (let s = 0; s < 2; s++) {
      for (let n = 0; n < strandN; n++) {
        const t = n / (strandN - 1)
        helixPoint(t, s, v)
        const j = HELIX.strandJitter
        const big = r() < 0.08
        put(
          v.x + (r() - 0.5) * j,
          v.y + (r() - 0.5) * j,
          v.z + (r() - 0.5) * j,
          t,
          s,
          -1,
          HELIX.size.strand * (big ? 1.9 : 0.55 + r() * 0.65)
        )
      }
    }
    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    for (let k = 0; k < this.rungs; k++) {
      const t = (k + 0.5) / this.rungs
      helixPoint(t, 0, a)
      helixPoint(t, 1, b)
      for (let n = 0; n < HELIX.rungPoints; n++) {
        let u = 0.1 + (n / (HELIX.rungPoints - 1)) * 0.8
        if (u > 0.46 && u < 0.54) u = u < 0.5 ? 0.45 : 0.55 // the base-pair gap
        v.lerpVectors(a, b, u)
        put(v.x, v.y, v.z, t, 2, k, HELIX.size.rung * (0.7 + r() * 0.5))
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    geo.setAttribute('aT', new THREE.BufferAttribute(tArr, 1))
    geo.setAttribute('aKind', new THREE.BufferAttribute(kind, 1))
    geo.setAttribute('aRung', new THREE.BufferAttribute(rung, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100)

    this.pointsMat = new THREE.ShaderMaterial({
      uniforms: common,
      vertexShader: VERT_POINTS,
      fragmentShader: FRAG_POINTS,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...ADDITIVE,
    })
    const points = new THREE.Points(geo, this.pointsMat)
    this.spinGroup.add(points)
    this.disposables.push(geo, this.pointsMat)

    // ---- ambient field (world space, does not spin)
    const amb = counts.ambient
    const ap = new Float32Array(amb * 3)
    const as = new Float32Array(amb * 3)
    const aseed = new Float32Array(amb)
    const at = new Float32Array(amb)
    const ak = new Float32Array(amb).fill(3)
    const ar = new Float32Array(amb).fill(-1)
    const asz = new Float32Array(amb)
    for (let n = 0; n < amb; n++) {
      ap.set([(r() * 2 - 1) * 16, (r() * 2 - 1) * 9, -r() * 30 + 4], n * 3)
      as.set([r() * 2 - 1, r() * 2 - 1, r()], n * 3)
      aseed[n] = r()
      at[n] = r()
      asz[n] = HELIX.size.ambient * (0.4 + r() * r() * 1.6)
    }
    const ageo = new THREE.BufferGeometry()
    ageo.setAttribute('position', new THREE.BufferAttribute(ap, 3))
    ageo.setAttribute('aStart', new THREE.BufferAttribute(as, 3))
    ageo.setAttribute('aSeed', new THREE.BufferAttribute(aseed, 1))
    ageo.setAttribute('aT', new THREE.BufferAttribute(at, 1))
    ageo.setAttribute('aKind', new THREE.BufferAttribute(ak, 1))
    ageo.setAttribute('aRung', new THREE.BufferAttribute(ar, 1))
    ageo.setAttribute('aSize', new THREE.BufferAttribute(asz, 1))
    ageo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100)
    this.ambientMat = this.pointsMat.clone()
    this.ambientMat.uniforms = common // share the same uniform objects
    const ambient = new THREE.Points(ageo, this.ambientMat)
    ambient.renderOrder = -1
    this.scene.add(ambient)
    this.disposables.push(ageo, this.ambientMat)

    // ---- rung lines and the two backbones (thin, fade in as the helix locks)
    const lp: number[] = []
    const lt: number[] = []
    const lr: number[] = []
    for (let k = 0; k < this.rungs; k++) {
      const t = (k + 0.5) / this.rungs
      helixPoint(t, 0, a)
      helixPoint(t, 1, b)
      const m0 = new THREE.Vector3().lerpVectors(a, b, 0.45)
      const m1 = new THREE.Vector3().lerpVectors(a, b, 0.55)
      lp.push(a.x, a.y, a.z, m0.x, m0.y, m0.z, m1.x, m1.y, m1.z, b.x, b.y, b.z)
      lt.push(t, t, t, t)
      lr.push(k, k, k, k)
    }
    const lgeo = new THREE.BufferGeometry()
    lgeo.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3))
    lgeo.setAttribute('aT', new THREE.Float32BufferAttribute(lt, 1))
    lgeo.setAttribute('aRung', new THREE.Float32BufferAttribute(lr, 1))
    const lineUniforms = {
      uTime: common.uTime,
      uPulse: common.uPulse,
      uRungs: common.uRungs,
      uCenterZ: common.uCenterZ,
      uClickT: common.uClickT,
      uOpacity: { value: 0 },
      uBase: { value: col(c.offwhite) },
      uAmber: common.uAmber,
    }
    this.linesMat = new THREE.ShaderMaterial({
      uniforms: lineUniforms,
      vertexShader: VERT_LINES,
      fragmentShader: FRAG_LINES,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...ADDITIVE,
    })
    this.spinGroup.add(new THREE.LineSegments(lgeo, this.linesMat))
    this.disposables.push(lgeo, this.linesMat)

    const bp: number[] = []
    const bt: number[] = []
    const br: number[] = []
    const SEG = 360
    for (let s = 0; s < 2; s++) {
      for (let n = 0; n < SEG; n++) {
        for (const tt of [n / SEG, (n + 1) / SEG]) {
          helixPoint(tt, s, v)
          bp.push(v.x, v.y, v.z)
          bt.push(tt)
          br.push(-1)
        }
      }
    }
    const bgeo = new THREE.BufferGeometry()
    bgeo.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3))
    bgeo.setAttribute('aT', new THREE.Float32BufferAttribute(bt, 1))
    bgeo.setAttribute('aRung', new THREE.Float32BufferAttribute(br, 1))
    this.backboneMat = this.linesMat.clone()
    this.backboneMat.uniforms = { ...lineUniforms, uOpacity: { value: 0 }, uBase: { value: col(c.teal).lerp(col(c.offwhite), 0.4) } }
    this.spinGroup.add(new THREE.LineSegments(bgeo, this.backboneMat))
    this.disposables.push(bgeo, this.backboneMat)

    // ---- orbital scan rings at different tilts, each with a travelling bright arc
    const ringDefs = [
      { r: 2.35, tilt: [1.15, 0, 0.35], color: c.teal, speed: 0.09, sweep: 0.55, opacity: 0.3 },
      { r: 2.95, tilt: [1.0, 0.45, -0.4], color: c.violet, speed: -0.06, sweep: -0.4, opacity: 0.24 },
      { r: 3.55, tilt: [1.22, -0.3, 0.8], color: c.amber, speed: 0.04, sweep: 0.3, opacity: 0.16 },
    ]
    for (const def of ringDefs) {
      const { mesh, mat } = this.makeRing(def.r, def.color, def.opacity)
      mesh.rotation.set(def.tilt[0], def.tilt[1], def.tilt[2])
      this.ringGroup.add(mesh)
      this.rings.push({ mesh, mat, speed: def.speed, sweepSpeed: def.sweep })
    }
    // the scan ring travels along the strand axis during a sweep
    const scan = this.makeRing(HELIX.radius * 1.45, c.teal, 0)
    scan.mesh.rotation.x = Math.PI / 2
    this.scanRing = scan.mesh
    this.tiltGroup.add(scan.mesh)

    // ---- a soft breathing glow behind the helix
    const hgeo = new THREE.PlaneGeometry(14, 14)
    this.haloMat = new THREE.ShaderMaterial({
      uniforms: {
        uA: { value: col(c.teal) },
        uB: { value: col(c.violet) },
        uTime: common.uTime,
        uOpacity: { value: 0 },
      },
      vertexShader: VERT_HALO,
      fragmentShader: FRAG_HALO,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...ADDITIVE,
    })
    const halo = new THREE.Mesh(hgeo, this.haloMat)
    halo.position.z = -2.5
    halo.renderOrder = -2
    this.tiltGroup.add(halo)
    this.disposables.push(hgeo, this.haloMat)
  }

  private makeRing(radius: number, color: string, opacity: number) {
    const N = 256
    const p = new Float32Array(N * 3)
    const ang = new Float32Array(N)
    for (let n = 0; n < N; n++) {
      const a = (n / N) * Math.PI * 2
      p.set([Math.cos(a) * radius, Math.sin(a) * radius, 0], n * 3)
      ang[n] = a
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3))
    geo.setAttribute('aAngle', new THREE.BufferAttribute(ang, 1))
    const mat = new THREE.ShaderMaterial({
      uniforms: { uSweep: { value: 0 }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
      vertexShader: VERT_RING,
      fragmentShader: FRAG_RING,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...ADDITIVE,
    })
    mat.userData.base = opacity
    this.disposables.push(geo, mat)
    return { mesh: new THREE.LineLoop(geo, mat), mat }
  }

  /** the host box in CSS pixels and the device pixel ratio; call with no arguments to re-apply */
  resize(width = this.width, height = this.height, deviceDpr = this.deviceDpr) {
    this.width = Math.max(1, width)
    this.height = Math.max(1, height)
    this.deviceDpr = deviceDpr
    const capped = Math.min(deviceDpr || 1, HELIX.dprCap)
    this.dpr = this.steppedDown ? Math.min(capped, 1.25) : capped
    this.renderer.setPixelRatio(this.dpr)
    this.renderer.setSize(this.width, this.height, false)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()

    const u = this.pointsMat.uniforms
    // point size scales with viewport height so the scene reads the same at any size
    u.uScale.value = this.height * this.dpr * 0.0105
    u.uAspect.value = this.camera.aspect

    // place the helix as a fraction of the hero box
    const L = this.opts.phone ? HELIX.layout.phone : HELIX.layout.desktop
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(HELIX.fov / 2)) * HELIX.camZ
    const visW = visH * this.camera.aspect
    // narrow desktops: keep the helix clear of the headline by easing it right
    this.tiltGroup.position.set((L.x - 0.5) * visW, (0.5 - L.y) * visH, 0)
    const fit = this.opts.phone ? Math.min(1, (visW / 4.6) * L.scale) : L.scale * Math.min(1, visW / 13)
    this.tiltGroup.scale.setScalar(Math.max(0.45, fit))
    this.baseTiltZ = L.tiltZ
  }

  private baseTiltZ = 0

  /** pointer in the host's normalised device coordinates (-1..1, y up); `inside` is false when it left the hero */
  pointerMove(nx: number, ny: number, inside: boolean) {
    const dx = nx - this.pointer.x
    const dy = ny - this.pointer.y
    this.pointer.set(nx, ny)
    if (this.pointerSmooth.x > 5) this.pointerSmooth.set(nx, ny)
    this.tilt.ty = THREE.MathUtils.clamp(nx, -1, 1) * HELIX.tiltY
    this.tilt.tx = THREE.MathUtils.clamp(-ny, -1, 1) * HELIX.tiltX
    const speed = Math.min(1, Math.hypot(dx, dy) * 14)
    this.forceTarget = inside ? Math.min(1, 0.5 + speed) : 0
  }

  pointerLeave() {
    this.forceTarget = 0
    this.tilt.tx = 0
    this.tilt.ty = 0
  }

  /** touch drag: horizontal travel tilts the helix */
  drag(dx: number, dy: number) {
    this.tilt.ty = THREE.MathUtils.clamp(dx / 220, -1, 1) * HELIX.tiltY * 1.3
    this.tilt.tx = THREE.MathUtils.clamp(dy / 220, -1, 1) * HELIX.tiltX
  }

  dragEnd() {
    this.tilt.tx = 0
    this.tilt.ty = 0
  }

  /** a bright pulse along the strand */
  pulseStrand() {
    this.clickT = 1.1
  }

  /** jump the intro to its end */
  skip() {
    if (this.intro >= 1) return
    this.introSpeed = (1 - this.intro) / HELIX.skipDuration
    this.lock()
  }

  private lock() {
    if (this.locked) return
    this.locked = true
    this.lockFlash = 1
    this.opts.onLock()
  }

  setActive(active: boolean) {
    if (active) this.start()
    else this.stop()
  }

  start() {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  private frame = (now: number) => {
    if (!this.running) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    this.step(dt)
    this.renderer.render(this.scene, this.camera)
    if (!this.firstFrame) {
      this.firstFrame = true
      this.opts.onFirstFrame()
    }
    this.watchPerformance(dt)
    this.raf = requestAnimationFrame(this.frame)
  }

  private step(dt: number) {
    this.time += dt
    const u = this.pointsMat.uniforms

    // intro progress (held at the scattered state while the loading screen is up)
    if (this.intro < 1 && performance.now() >= (this.opts.holdUntil ?? 0)) {
      this.intro = Math.min(1, this.intro + dt * this.introSpeed)
      if (this.intro >= HELIX.lockAt) this.lock()
    }
    const introEase = 1 - Math.pow(1 - this.intro, 3)
    u.uIntro.value = this.intro
    this.lockFlash = Math.max(0, this.lockFlash - dt * 1.8)
    u.uLock.value = this.lockFlash * this.lockFlash
    u.uTime.value = this.time

    // spin: fast while arriving, easing to the idle speed
    this.spinAngle += dt * (HELIX.spin + (1 - introEase) * HELIX.introSpin)
    this.spinGroup.rotation.y = this.spinAngle

    // tilt toward the cursor with eased inertia (a damped spring)
    const k = HELIX.tiltStiffness * dt
    this.tilt.vx = (this.tilt.vx + (this.tilt.tx - this.tilt.x) * k) * HELIX.tiltDamping
    this.tilt.vy = (this.tilt.vy + (this.tilt.ty - this.tilt.y) * k) * HELIX.tiltDamping
    this.tilt.x += this.tilt.vx
    this.tilt.y += this.tilt.vy
    this.tiltGroup.rotation.set(this.tilt.x, this.tilt.y, this.baseTiltZ + this.tilt.y * 0.12)

    // cursor influence: smoothed position, force eases in and out (particles spring back)
    if (this.pointer.x < 5) this.pointerSmooth.lerp(this.pointer, 1 - Math.exp(-dt * 10))
    this.force += (this.forceTarget - this.force) * (1 - Math.exp(-dt * (this.forceTarget > this.force ? 8 : 2.5)))
    this.forceTarget *= Math.exp(-dt * 0.35) // a still cursor slowly loses its pull
    u.uMouseForce.value = this.force * introEase

    // amber pulse down the strand, one rung at a time
    this.pulse = (this.pulse + dt * HELIX.pulseRate) % (this.rungs + 6)
    u.uPulse.value = this.pulse - 3

    // periodic scan sweep from top to bottom
    this.scanClock += dt
    const scanStart = HELIX.scanEvery - HELIX.scanDuration
    if (this.intro >= 1 && this.scanClock > scanStart) {
      const s = (this.scanClock - scanStart) / HELIX.scanDuration
      if (s >= 1) {
        this.scanClock = 0
        u.uScanT.value = -1
        ;(this.scanRing.material as THREE.ShaderMaterial).uniforms.uOpacity.value = 0
      } else {
        const tt = 1.05 - s * 1.1
        u.uScanT.value = tt
        this.scanRing.position.y = (tt - 0.5) * HELIX.length
        const env = Math.sin(Math.min(1, Math.max(0, s)) * Math.PI)
        const m = this.scanRing.material as THREE.ShaderMaterial
        m.uniforms.uOpacity.value = 0.55 * env
        m.uniforms.uSweep.value = this.time * 3
      }
    }

    // click pulse travels top to bottom
    if (this.clickT > -0.5) {
      this.clickT -= dt / HELIX.clickPulseDuration * 1.3
      if (this.clickT < -0.2) this.clickT = -1
    }
    u.uClickT.value = this.clickT

    // rings, backbones, and glow fade in as the helix locks
    const settle = THREE.MathUtils.smoothstep(this.intro, 0.6, 1)
    this.linesMat.uniforms.uOpacity.value = 0.11 * settle
    this.backboneMat.uniforms.uOpacity.value = 0.13 * settle
    this.haloMat.uniforms.uOpacity.value = (0.075 + 0.025 * Math.sin(this.time * 0.4)) * introEase
    for (const ring of this.rings) {
      ring.mesh.rotation.z += dt * ring.speed
      ring.mat.uniforms.uSweep.value += dt * ring.sweepSpeed * 2
      ring.mat.uniforms.uOpacity.value = ring.mat.userData.base * settle
    }

    // depth of the helix centre in view space (for the near/far fade)
    this.tiltGroup.updateMatrixWorld()
    this.centre.setFromMatrixPosition(this.tiltGroup.matrixWorld).applyMatrix4(this.camera.matrixWorldInverse)
    u.uCenterZ.value = this.centre.z
    this.linesMat.uniforms.uCenterZ.value = this.centre.z
  }

  /** step the pixel ratio down once if frames run slow */
  private watchPerformance(dt: number) {
    if (this.steppedDown || this.intro < 1) return
    this.frameTimes.push(dt * 1000)
    if (this.frameTimes.length < 90) return
    const avg = this.frameTimes.reduce((s, x) => s + x, 0) / this.frameTimes.length
    this.frameTimes = []
    if (avg > HELIX.slowFrameMs && this.dpr > 1.25) {
      this.steppedDown = true
      this.resize()
    }
  }

  get progress() {
    return this.intro
  }

  dispose() {
    this.stop()
    for (const d of this.disposables) d.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}
