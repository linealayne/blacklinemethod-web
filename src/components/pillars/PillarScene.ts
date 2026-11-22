import * as THREE from 'three'
import { HELIX } from '../hero/helix-config'
import {
  ADDITIVE,
  FRAG_HALO,
  FRAG_LINES,
  FRAG_POINTS,
  FRAG_RING,
  VERT_HALO,
  VERT_LINES,
  VERT_POINTS,
  VERT_RING,
  rand,
  type HelixColors,
  type Tier,
} from '../hero/HelixScene'
import { PILLAR_COUNT, PILLAR_GENE as G } from './pillars-config'

/**
 * The rotating gene of the four-pillars section. It is the hero's gene seen
 * closer: the same particle, line, ring, and glow shaders (imported from
 * HelixScene.ts, so the ember pulse down the rungs, the teal scan sweep, and
 * the bright front all look identical), a wider helix, and four nodes on the
 * strands, one per pillar.
 *
 * The gene turns continuously about its own axis. The nodes sit a quarter
 * turn apart, so the turn itself is the clock: every `turnsPerPillar` turns
 * the next node swings to the front, lights in tan, and `onActive` reports
 * its index. `jump(i)` carries the gene the short way round to node `i`.
 *
 * Like HelixScene this touches no DOM and no `window`, so it runs in the
 * same worker (helix.worker.ts) or on the main thread.
 *
 * PROTECTED: a staple of the site. Do not change unless Layne asks.
 */

export interface PillarSceneOptions {
  canvas: HTMLCanvasElement | OffscreenCanvas
  width: number
  height: number
  dpr: number
  colors: HelixColors & { tan: string }
  tier: Tier
  /** horizontal gene across the top (stacked layout) instead of the vertical one */
  phone: boolean
  /** the pillar whose node has just come round to the front */
  onActive: (index: number) => void
  onFirstFrame: () => void
}

const VERT_NODE = /* glsl */ `
  attribute float aGlow;
  uniform float uScale;
  uniform float uCenterZ;
  uniform float uReach;
  uniform float uSize;
  varying float vGlow;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // the far side of the gene sits back in the dark, like its particles
    vDepth = smoothstep(uCenterZ - uReach, uCenterZ + uReach, mv.z);
    vGlow = aGlow;
    gl_PointSize = uSize * uScale * (0.7 + 0.3 * vDepth) * (0.7 + 0.3 * aGlow) / -mv.z;
  }
`

const FRAG_NODE = /* glsl */ `
  uniform vec3 uTan;
  uniform vec3 uRest;
  uniform float uTime;
  varying float vGlow;
  varying float vDepth;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float halo = smoothstep(0.5, 0.0, d);
    halo *= halo;
    float core = smoothstep(0.05, 0.026, d);
    // one thin ring, breathing very slightly while the node is lit
    float rr = 0.155 + 0.008 * sin(uTime * 1.7) * vGlow;
    float ring = smoothstep(0.012, 0.0, abs(d - rr));
    vec3 col = mix(uRest, uTan, vGlow);
    float a = core * (0.6 + 0.4 * vGlow) + halo * halo * (0.05 + 0.9 * vGlow) + halo * 0.16 * vGlow + ring * (0.34 + 0.5 * vGlow);
    a *= mix(mix(0.3, 0.62, vGlow), 1.0, vDepth);
    gl_FragColor = vec4(col * a * (1.0 + vGlow * 0.12), a);
  }
`

const TAU = Math.PI * 2

export class PillarScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private tiltGroup = new THREE.Group()
  private spinGroup = new THREE.Group()
  private scanRing!: THREE.LineLoop
  private pointsMat!: THREE.ShaderMaterial
  private linesMat!: THREE.ShaderMaterial
  private backboneMat!: THREE.ShaderMaterial
  private haloMat!: THREE.ShaderMaterial
  private nodeMat!: THREE.ShaderMaterial
  private nodeGlow!: THREE.BufferAttribute
  private disposables: { dispose: () => void }[] = []

  private opts: PillarSceneOptions
  private length: number
  private turns: number
  private rungs: number
  private nodeAngle: number[] = []

  private raf = 0
  private running = false
  private asleep = false
  private last = 0
  private time = 0
  private intro = 0.42
  private firstFrame = false

  // the cycle
  private base = 0 // the scheduled turn, radians
  private offset = 0 // what a jump still has to make up
  private offVel = 0
  private windowStart = 0
  private active = 0
  private speed = 1
  private life = 1
  private held = false
  private frozen = false
  private glow = new Float32Array(PILLAR_COUNT)

  private pulse = 0
  private scanClock = 0
  private clickT = -1

  private width = 1
  private height = 1
  private dpr = 1
  private deviceDpr = 1
  private frameTimes: number[] = []
  private steppedDown = false
  private centre = new THREE.Vector3()

  constructor(opts: PillarSceneOptions) {
    this.opts = opts
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(G.fov / 2)) * G.camZ
    if (opts.phone) {
      // lie the gene across the canvas: as long as the canvas allows at the height it is given
      const L = G.layout.phone
      const scale = (L.fillH * visH) / (2 * G.radius)
      const visW = visH * (opts.width / Math.max(1, opts.height))
      this.length = THREE.MathUtils.clamp((L.fillW * visW) / scale, L.minLength, L.maxLength)
    } else {
      this.length = G.layout.desktop.length
    }
    this.turns = this.length / G.pitch
    this.rungs = Math.round(this.turns * G.rungsPerTurn)
    this.glow[0] = 1

    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    })
    this.renderer.setClearColor(0x000000, 0)
    this.camera = new THREE.PerspectiveCamera(G.fov, 1, 0.1, 120)
    this.camera.position.set(0, 0, G.camZ)
    this.camera.updateMatrixWorld()

    this.scene.add(this.tiltGroup)
    this.tiltGroup.add(this.spinGroup)
    this.build()
    this.resize(opts.width, opts.height, opts.dpr)
  }

  private point(t: number, strand: number, out = new THREE.Vector3()) {
    const a = t * this.turns * TAU + strand * HELIX.strandPhase
    return out.set(Math.cos(a) * G.radius, (t - 0.5) * this.length, Math.sin(a) * G.radius)
  }

  /**
   * Put node `i` on a strand at the height nearest `nodeAt[i]` where the
   * strand's angle is exactly the one the cycle needs: a quarter turn after
   * the node before it, and facing the viewer `lead` turns into its window.
   */
  private placeNode(i: number) {
    const want = Math.PI / 2 + TAU * (0.25 * i + G.lead)
    let best = { t: G.nodeAt[i], strand: 0, err: Infinity }
    for (let s = 0; s < 2; s++) {
      for (let n = -2; n <= Math.ceil(this.turns) + 2; n++) {
        const t = (want - s * HELIX.strandPhase + TAU * n) / (TAU * this.turns)
        if (t < 0.04 || t > 0.96) continue
        const err = Math.abs(t - G.nodeAt[i])
        if (err < best.err) best = { t, strand: s, err }
      }
    }
    this.nodeAngle[i] = want - Math.PI / 2
    return this.point(best.t, best.strand)
  }

  private build() {
    const c = this.opts.colors
    const col = (hex: string) => new THREE.Color(hex)
    const counts = G.counts[this.opts.tier]
    const r = rand(2077)

    const common = {
      uTime: { value: 0 },
      uIntro: { value: this.intro },
      uLock: { value: 0 },
      uScale: { value: 1 },
      uAspect: { value: 1 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uMouseForce: { value: 0 },
      uScatterR: { value: HELIX.scatterRadius },
      uPulse: { value: 0 },
      uRungs: { value: this.rungs },
      uClickT: { value: -1 },
      uScanT: { value: -1 },
      uCenterZ: { value: -G.camZ },
      uAmber: { value: col(c.amber) },
      uTeal: { value: col(c.teal) },
      uViolet: { value: col(c.violet) },
      uWhite: { value: col(c.offwhite) },
    }

    // ---- strands + rungs
    const strandN = Math.round(counts.strandPerUnit * this.length)
    const rungN = this.rungs * G.rungPoints
    const amb = counts.ambient
    const make = (total: number) => ({
      pos: new Float32Array(total * 3),
      start: new Float32Array(total * 3),
      seed: new Float32Array(total),
      t: new Float32Array(total),
      kind: new Float32Array(total),
      rung: new Float32Array(total),
      size: new Float32Array(total),
      i: 0,
    })
    type Buf = ReturnType<typeof make>
    const put = (b: Buf, x: number, y: number, z: number, t: number, k: number, ri: number, s: number) => {
      b.pos.set([x, y, z], b.i * 3)
      b.start.set([r() * 2 - 1, r() * 2 - 1, r()], b.i * 3)
      b.seed[b.i] = r()
      b.t[b.i] = t
      b.kind[b.i] = k
      b.rung[b.i] = ri
      b.size[b.i] = s
      b.i++
    }
    const toGeo = (b: Buf) => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(b.pos, 3))
      geo.setAttribute('aStart', new THREE.BufferAttribute(b.start, 3))
      geo.setAttribute('aSeed', new THREE.BufferAttribute(b.seed, 1))
      geo.setAttribute('aT', new THREE.BufferAttribute(b.t, 1))
      geo.setAttribute('aKind', new THREE.BufferAttribute(b.kind, 1))
      geo.setAttribute('aRung', new THREE.BufferAttribute(b.rung, 1))
      geo.setAttribute('aSize', new THREE.BufferAttribute(b.size, 1))
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100)
      return geo
    }

    const v = new THREE.Vector3()
    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    const main = make(strandN * 2 + rungN)
    for (let s = 0; s < 2; s++) {
      for (let n = 0; n < strandN; n++) {
        const t = n / (strandN - 1)
        this.point(t, s, v)
        const j = G.strandJitter
        const big = r() < 0.08
        put(main, v.x + (r() - 0.5) * j, v.y + (r() - 0.5) * j, v.z + (r() - 0.5) * j, t, s, -1, G.size.strand * (big ? 1.9 : 0.55 + r() * 0.65))
      }
    }
    for (let k = 0; k < this.rungs; k++) {
      const t = (k + 0.5) / this.rungs
      this.point(t, 0, a)
      this.point(t, 1, b)
      for (let n = 0; n < G.rungPoints; n++) {
        let u = 0.1 + (n / (G.rungPoints - 1)) * 0.8
        if (u > 0.46 && u < 0.54) u = u < 0.5 ? 0.45 : 0.55
        v.lerpVectors(a, b, u)
        put(main, v.x, v.y, v.z, t, 2, k, G.size.rung * (0.7 + r() * 0.5))
      }
    }
    const geo = toGeo(main)
    this.pointsMat = new THREE.ShaderMaterial({
      uniforms: common,
      vertexShader: VERT_POINTS,
      fragmentShader: FRAG_POINTS,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...ADDITIVE,
    })
    this.spinGroup.add(new THREE.Points(geo, this.pointsMat))
    this.disposables.push(geo, this.pointsMat)

    // ---- a sparse ambient field (world space)
    const field = make(amb)
    for (let n = 0; n < amb; n++) {
      put(field, (r() * 2 - 1) * 16, (r() * 2 - 1) * 9, -r() * 30 + 4, r(), 3, -1, G.size.ambient * (0.4 + r() * r() * 1.6))
    }
    const ageo = toGeo(field)
    const ambientMat = this.pointsMat.clone()
    ambientMat.uniforms = common
    const ambient = new THREE.Points(ageo, ambientMat)
    ambient.renderOrder = -1
    this.scene.add(ambient)
    this.disposables.push(ageo, ambientMat)

    // ---- rung lines and backbones
    const lp: number[] = []
    const lt: number[] = []
    const lr: number[] = []
    for (let k = 0; k < this.rungs; k++) {
      const t = (k + 0.5) / this.rungs
      this.point(t, 0, a)
      this.point(t, 1, b)
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
    const SEG = Math.round(this.turns * 120)
    for (let s = 0; s < 2; s++) {
      for (let n = 0; n < SEG; n++) {
        for (const tt of [n / SEG, (n + 1) / SEG]) {
          this.point(tt, s, v)
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

    // ---- the four pillar nodes
    const np = new Float32Array(PILLAR_COUNT * 3)
    for (let i = 0; i < PILLAR_COUNT; i++) {
      const p = this.placeNode(i)
      np.set([p.x, p.y, p.z], i * 3)
    }
    const ngeo = new THREE.BufferGeometry()
    ngeo.setAttribute('position', new THREE.BufferAttribute(np, 3))
    this.nodeGlow = new THREE.BufferAttribute(this.glow, 1)
    this.nodeGlow.setUsage(THREE.DynamicDrawUsage)
    ngeo.setAttribute('aGlow', this.nodeGlow)
    ngeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100)
    this.nodeMat = new THREE.ShaderMaterial({
      uniforms: {
        uScale: common.uScale,
        uCenterZ: common.uCenterZ,
        uTime: common.uTime,
        uReach: { value: G.radius },
        uSize: { value: G.size.node },
        uTan: { value: col(c.tan) },
        uRest: { value: col(c.offwhite).lerp(col(c.teal), 0.35) },
      },
      vertexShader: VERT_NODE,
      fragmentShader: FRAG_NODE,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...ADDITIVE,
    })
    const nodes = new THREE.Points(ngeo, this.nodeMat)
    nodes.renderOrder = 2
    this.spinGroup.add(nodes)
    this.disposables.push(ngeo, this.nodeMat)

    // ---- the scan ring that travels with the sweep
    const N = 200
    const rp = new Float32Array(N * 3)
    const ang = new Float32Array(N)
    for (let n = 0; n < N; n++) {
      const an = (n / N) * TAU
      rp.set([Math.cos(an) * G.radius * 1.45, Math.sin(an) * G.radius * 1.45, 0], n * 3)
      ang[n] = an
    }
    const rgeo = new THREE.BufferGeometry()
    rgeo.setAttribute('position', new THREE.BufferAttribute(rp, 3))
    rgeo.setAttribute('aAngle', new THREE.BufferAttribute(ang, 1))
    const rmat = new THREE.ShaderMaterial({
      uniforms: { uSweep: { value: 0 }, uColor: { value: col(c.teal) }, uOpacity: { value: 0 } },
      vertexShader: VERT_RING,
      fragmentShader: FRAG_RING,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      ...ADDITIVE,
    })
    this.scanRing = new THREE.LineLoop(rgeo, rmat)
    this.scanRing.rotation.x = Math.PI / 2
    this.tiltGroup.add(this.scanRing)
    this.disposables.push(rgeo, rmat)

    // ---- the soft breathing glow behind the gene
    const hgeo = new THREE.PlaneGeometry(G.radius * 7, this.length * 1.5)
    this.haloMat = new THREE.ShaderMaterial({
      uniforms: { uA: { value: col(c.teal) }, uB: { value: col(c.violet) }, uTime: common.uTime, uOpacity: { value: 0 } },
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

  resize(width = this.width, height = this.height, deviceDpr = this.deviceDpr) {
    this.width = Math.max(1, width)
    this.height = Math.max(1, height)
    this.deviceDpr = deviceDpr
    const capped = Math.min(deviceDpr || 1, G.dprCap)
    this.dpr = this.steppedDown ? Math.min(capped, 1.25) : capped
    this.renderer.setPixelRatio(this.dpr)
    this.renderer.setSize(this.width, this.height, false)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()

    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(G.fov / 2)) * G.camZ
    const visW = visH * this.camera.aspect
    let scale: number
    let boost: number
    if (this.opts.phone) {
      const L = G.layout.phone
      scale = Math.min((L.fillH * visH) / (2 * G.radius), (L.fillW * visW) / this.length)
      this.tiltGroup.position.set(0, 0, 0)
      this.tiltGroup.rotation.set(0, 0, Math.PI / 2 + L.tiltZ)
      boost = L.points
    } else {
      const L = G.layout.desktop
      // fill the height, but never wider than the room to the left of the text
      scale = Math.min((L.fill * visH) / this.length, (visW * L.maxWidth) / (2 * G.radius))
      this.tiltGroup.position.set((L.x - 0.5) * visW, (0.5 - L.y) * visH, 0)
      this.tiltGroup.rotation.set(L.tiltX, 0, L.tiltZ)
      boost = L.points
    }
    this.tiltGroup.scale.setScalar(scale)

    const u = this.pointsMat.uniforms
    // particle size follows the gene's size on screen (the hero's ratio)
    u.uScale.value = (this.height / visH) * scale * this.dpr * 0.107 * boost
    u.uAspect.value = this.camera.aspect
    this.nodeMat.uniforms.uReach.value = G.radius * scale
    this.wake()
  }

  /** carry the gene the short way round to pillar `index` and make it the active one */
  jump(index: number) {
    const i = ((index % PILLAR_COUNT) + PILLAR_COUNT) % PILLAR_COUNT
    const now = this.base + this.offset
    let d = (this.nodeAngle[i] - now) % TAU
    if (d > Math.PI) d -= TAU
    if (d < -Math.PI) d += TAU
    const target = now + d
    this.offset = now - target
    this.base = target
    this.windowStart = target - TAU * G.lead
    this.clickT = 1.1
    if (i !== this.active) {
      this.active = i
      this.opts.onActive(i)
    }
    this.wake()
  }

  /** ease the turn to a stop while someone is reading (the ripples carry on) */
  setHeld(held: boolean) {
    this.held = held
    this.wake()
  }

  /** the pause control: everything comes to rest */
  setFrozen(frozen: boolean) {
    this.frozen = frozen
    this.wake()
  }

  setActive(active: boolean) {
    if (active) this.start()
    else this.stop()
  }

  start() {
    if (this.running) return
    this.running = true
    this.asleep = false
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  private wake() {
    if (!this.running || !this.asleep) return
    this.asleep = false
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  private frame = (now: number) => {
    if (!this.running) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    const settled = this.step(dt)
    this.renderer.render(this.scene, this.camera)
    if (!this.firstFrame) {
      this.firstFrame = true
      this.opts.onFirstFrame()
    }
    this.watchPerformance(dt)
    // paused and at rest: nothing left to draw until someone acts
    if (settled) {
      this.asleep = true
      return
    }
    this.raf = requestAnimationFrame(this.frame)
  }

  /** returns true when the scene is paused and has fully come to rest */
  private step(dt: number) {
    const ease = (rate: number) => 1 - Math.exp(-dt * rate)
    this.life += ((this.frozen ? 0 : 1) - this.life) * ease(G.holdEase)
    this.speed += ((this.frozen || this.held ? 0 : 1) - this.speed) * ease(G.holdEase)
    const ldt = dt * this.life
    this.time += ldt

    const u = this.pointsMat.uniforms
    u.uTime.value = this.time

    // the gene gathers once, the first time it is seen
    if (this.intro < 1) this.intro = Math.min(1, this.intro + dt * 0.5)
    const introEase = 1 - Math.pow(1 - this.intro, 3)
    u.uIntro.value = this.intro

    // ---- the turn, and with it the cycle
    const win = TAU * G.turnsPerPillar
    this.base += dt * (TAU / G.turnSeconds) * this.speed
    if (this.base - this.windowStart >= win) {
      this.windowStart += win
      this.active = (this.active + 1) % PILLAR_COUNT
      this.opts.onActive(this.active)
    }
    // a jump is made up by a critically damped spring, so it starts at once and lands without a bump
    const k = G.jumpStiffness
    this.offVel += (-k * this.offset - 2 * Math.sqrt(k) * this.offVel) * dt
    this.offset += this.offVel * dt
    this.spinGroup.rotation.y = this.base + this.offset

    // ---- nodes: the active one lights in tan
    let moving = false
    for (let i = 0; i < PILLAR_COUNT; i++) {
      const target = i === this.active ? 1 : 0
      this.glow[i] += (target - this.glow[i]) * ease(G.nodeEase)
      if (Math.abs(target - this.glow[i]) > 0.004) moving = true
    }
    this.nodeGlow.needsUpdate = true

    // ---- the ripples (the hero's): ember pulse, teal scan sweep, the bright front after a jump
    this.pulse = (this.pulse + ldt * G.pulseRate) % (this.rungs + 6)
    u.uPulse.value = this.pulse - 3

    this.scanClock += ldt
    const scanStart = G.scanEvery - G.scanDuration
    const ring = this.scanRing.material as THREE.ShaderMaterial
    if (this.intro >= 1 && this.scanClock > scanStart) {
      const s = (this.scanClock - scanStart) / G.scanDuration
      if (s >= 1) {
        this.scanClock = 0
        u.uScanT.value = -1
        ring.uniforms.uOpacity.value = 0
      } else {
        const tt = 1.05 - s * 1.1
        u.uScanT.value = tt
        this.scanRing.position.y = (tt - 0.5) * this.length
        ring.uniforms.uOpacity.value = 0.5 * Math.sin(Math.min(1, Math.max(0, s)) * Math.PI)
        ring.uniforms.uSweep.value = this.time * 3
      }
    }

    if (this.clickT > -0.5) {
      this.clickT -= (dt / G.jumpPulseDuration) * 1.3
      if (this.clickT < -0.2) this.clickT = -1
      moving = true
    }
    u.uClickT.value = this.clickT

    const settle = THREE.MathUtils.smoothstep(this.intro, 0.6, 1)
    this.linesMat.uniforms.uOpacity.value = 0.12 * settle
    this.backboneMat.uniforms.uOpacity.value = 0.14 * settle
    this.haloMat.uniforms.uOpacity.value = (0.07 + 0.022 * Math.sin(this.time * 0.4)) * introEase

    this.tiltGroup.updateMatrixWorld()
    this.centre.setFromMatrixPosition(this.tiltGroup.matrixWorld).applyMatrix4(this.camera.matrixWorldInverse)
    u.uCenterZ.value = this.centre.z

    return (
      this.frozen &&
      !moving &&
      this.intro >= 1 &&
      this.life < 0.003 &&
      this.speed < 0.003 &&
      Math.abs(this.offset) < 0.002 &&
      Math.abs(this.offVel) < 0.002
    )
  }

  private watchPerformance(dt: number) {
    if (this.steppedDown || this.intro < 1 || this.frozen) return
    this.frameTimes.push(dt * 1000)
    if (this.frameTimes.length < 90) return
    const avg = this.frameTimes.reduce((s, x) => s + x, 0) / this.frameTimes.length
    this.frameTimes = []
    if (avg > G.slowFrameMs && this.dpr > 1.25) {
      this.steppedDown = true
      this.resize()
    }
  }

  dispose() {
    this.stop()
    for (const d of this.disposables) d.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}
