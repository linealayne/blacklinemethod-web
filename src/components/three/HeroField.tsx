'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { gsap } from '@/lib/gsap'

/**
 * Hero particle field: fine amber and warm-white dust drifting in the dark,
 * gathering into a slowly rotating double helix behind the headline, then
 * breathing. The cursor pushes nearby particles away; scrolling past the
 * hero loosens the helix back into dust and fades it.
 *
 * All tuning knobs live in HERO_FIELD.
 */
export const HERO_FIELD = {
  countDesktop: 4200,
  countPhone: 1500,
  helixRadius: 1.15,
  helixHeight: 5.6,
  turns: 2.1,
  rungFraction: 0.16, // share of particles placed on the rungs between strands
  dust: { x: 6.5, y: 4.2, zNear: 2.0, zFar: -3.5 },
  gatherDuration: 5.5, // seconds for dust to become helix
  gatherDelay: 0.5,
  rotateSpeed: 0.11, // radians per second
  breathe: 0.035,
  pushStrength: 0.45, // world units of cursor push
  pushRadius: 2.2, // falloff; higher = tighter
  pointSize: 2.4, // px at dpr 1 at mid depth
  opacity: 0.62,
  warmFraction: 0.35, // share of warm-white vs amber points
  bloom: { intensity: 0.5, threshold: 0.08, smoothing: 0.3, radius: 0.7 },
  colors: { amber: '#C8965A', warm: '#E2C48F', ground: '#0A0A0A' },
}

export interface HeroHandles {
  /** pointer in NDC (-1..1) and an active factor (0..1) */
  pointer: { x: number; y: number; active: number }
  /** 0 at the top of the hero, 1 once the hero has scrolled out */
  scroll: { value: number }
}

const VERT = /* glsl */ `
  attribute vec3 aHelix;
  attribute float aSeed;
  attribute float aWarm;
  uniform float uTime;
  uniform float uGather;
  uniform float uScroll;
  uniform float uSize;
  uniform float uDpr;
  uniform float uPush;
  uniform float uPushRadius;
  uniform float uRotate;
  uniform float uBreathe;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  varying float vAlpha;
  varying float vWarm;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    float t = uTime;
    // slow dust wander
    vec3 dust = position + vec3(
      sin(t * 0.11 + aSeed * 6.2831) * 0.38,
      cos(t * 0.09 + aSeed * 12.0) * 0.32,
      sin(t * 0.07 + aSeed * 3.0) * 0.26
    );
    // helix: rotate about Y, breathe, and jitter so it never looks rigid
    float ang = t * uRotate;
    float breathe = 1.0 + uBreathe * sin(t * 0.55 + aHelix.y * 0.9);
    vec3 h = aHelix;
    h.xz *= breathe;
    float c = cos(ang), s = sin(ang);
    vec3 hr = vec3(h.x * c - h.z * s, h.y, h.x * s + h.z * c);
    hr += vec3(sin(t * 0.9 + aSeed * 20.0), cos(t * 0.8 + aSeed * 17.0), sin(t * 0.7 + aSeed * 9.0)) * 0.022;

    // gather strength: arrives in waves per particle, loosens on scroll
    float g = uGather * (1.0 - smoothstep(0.0, 0.85, uScroll));
    float gg = smoothstep(0.0, 1.0, clamp(g * 1.4 - aSeed * 0.4, 0.0, 1.0));
    vec3 pos = mix(dust, hr, gg);

    // cursor push (world xy at z = 0 plane)
    vec2 d = pos.xy - uPointer;
    float dist2 = dot(d, d);
    float push = uPush * uPointerActive * exp(-dist2 * uPushRadius);
    pos.xy += normalize(d + vec2(0.0001, 0.0)) * push;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    gl_PointSize = uSize * uDpr * (0.7 + 0.8 * hash(aSeed * 7.1)) * (8.0 / max(depth, 0.5));

    // depth fade: far points dim; whole field fades as the hero scrolls away
    float depthFade = smoothstep(13.5, 5.0, depth);
    vAlpha = depthFade * (0.5 + 0.5 * hash(aSeed * 3.3)) * (1.0 - smoothstep(0.1, 1.0, uScroll));
    vWarm = aWarm;
  }
`

const FRAG = /* glsl */ `
  uniform vec3 uAmber;
  uniform vec3 uWarm;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vWarm;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float r = length(p);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.06, r);
    float core = smoothstep(0.22, 0.0, r) * 0.55;
    vec3 col = mix(uAmber, uWarm, vWarm);
    gl_FragColor = vec4(col, (soft * 0.75 + core) * vAlpha * uOpacity);
    #include <colorspace_fragment>
  }
`

function buildGeometry(count: number) {
  const { helixRadius: R, helixHeight: H, turns, rungFraction, dust, warmFraction } = HERO_FIELD
  const position = new Float32Array(count * 3)
  const helix = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const warm = new Float32Array(count)
  const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo)

  for (let i = 0; i < count; i++) {
    // dust start: a wide, shallow box
    position[i * 3] = rand(-dust.x, dust.x)
    position[i * 3 + 1] = rand(-dust.y, dust.y)
    position[i * 3 + 2] = rand(dust.zFar, dust.zNear)

    // helix target
    const u = Math.random()
    const y = (u - 0.5) * H
    const theta = u * turns * Math.PI * 2
    const onRung = Math.random() < rungFraction
    if (onRung) {
      // a point somewhere along the rung between the two strands
      const k = Math.random()
      const ax = Math.cos(theta) * R
      const az = Math.sin(theta) * R
      helix[i * 3] = ax * (1 - 2 * k)
      helix[i * 3 + 1] = y
      helix[i * 3 + 2] = az * (1 - 2 * k)
    } else {
      const strand = Math.random() < 0.5 ? 0 : Math.PI
      const jitter = (Math.random() - 0.5) * 0.12
      helix[i * 3] = Math.cos(theta + strand) * (R + jitter)
      helix[i * 3 + 1] = y + (Math.random() - 0.5) * 0.06
      helix[i * 3 + 2] = Math.sin(theta + strand) * (R + jitter)
    }
    seed[i] = Math.random()
    warm[i] = Math.random() < warmFraction ? 1 : 0
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geometry.setAttribute('aHelix', new THREE.BufferAttribute(helix, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  geometry.setAttribute('aWarm', new THREE.BufferAttribute(warm, 1))
  return geometry
}

function Particles({ count, handles, start }: { count: number; handles: HeroHandles; start: boolean }) {
  const geometry = useMemo(() => buildGeometry(count), [count])
  const gl = useThree((s) => s.gl)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGather: { value: 0 },
      uScroll: { value: 0 },
      uSize: { value: HERO_FIELD.pointSize },
      uDpr: { value: 1 },
      uPush: { value: HERO_FIELD.pushStrength },
      uPushRadius: { value: HERO_FIELD.pushRadius },
      uRotate: { value: HERO_FIELD.rotateSpeed },
      uBreathe: { value: HERO_FIELD.breathe },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerActive: { value: 0 },
      uOpacity: { value: HERO_FIELD.opacity },
      uAmber: { value: new THREE.Color(HERO_FIELD.colors.amber) },
      uWarm: { value: new THREE.Color(HERO_FIELD.colors.warm) },
    }),
    []
  )

  useEffect(() => {
    uniforms.uDpr.value = gl.getPixelRatio()
  }, [gl, uniforms])

  useEffect(() => () => geometry.dispose(), [geometry])

  useEffect(() => {
    if (!start) return
    const tween = gsap.to(uniforms.uGather, {
      value: 1,
      duration: HERO_FIELD.gatherDuration,
      delay: HERO_FIELD.gatherDelay,
      ease: 'power2.inOut',
    })
    return () => {
      tween.kill()
    }
  }, [start, uniforms])

  const smooth = useRef({ x: 0, y: 0, a: 0 })

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uScroll.value = handles.scroll.value
    const vp = state.viewport
    const tx = handles.pointer.x * (vp.width / 2)
    const ty = handles.pointer.y * (vp.height / 2)
    const k = 1 - Math.exp(-dt * 4.5)
    const s = smooth.current
    s.x += (tx - s.x) * k
    s.y += (ty - s.y) * k
    s.a += (handles.pointer.active - s.a) * k
    uniforms.uPointer.value.set(s.x, s.y)
    uniforms.uPointerActive.value = s.a
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

interface HeroFieldProps {
  handles: HeroHandles
  /** begin gathering (after the loader) */
  start: boolean
  /** render loop on/off (off when off screen or tab hidden) */
  active: boolean
  phone: boolean
}

export default function HeroField({ handles, start, active, phone }: HeroFieldProps) {
  const count = phone ? HERO_FIELD.countPhone : HERO_FIELD.countDesktop
  return (
    <Canvas
      dpr={[1, 1.5]}
      flat
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ position: [0, 0, 7], fov: 45, near: 0.1, far: 50 }}
      onCreated={({ gl }) => gl.setClearColor(HERO_FIELD.colors.ground, 1)}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Particles count={count} handles={handles} start={start} />
      {!phone && (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={HERO_FIELD.bloom.intensity}
            luminanceThreshold={HERO_FIELD.bloom.threshold}
            luminanceSmoothing={HERO_FIELD.bloom.smoothing}
            radius={HERO_FIELD.bloom.radius}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </Canvas>
  )
}
