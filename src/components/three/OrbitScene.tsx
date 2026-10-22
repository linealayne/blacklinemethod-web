'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { gsap } from '@/lib/gsap'

/**
 * The four pillars orbit "You": a softly glowing centre point, four small
 * labelled nodes on a tilted ring joined by one thin amber line.
 *
 * Scrub mode: driven by handles.progress (0..1 across the pinned section).
 * Intro, then each pillar rotates to the front in turn, then the orbit
 * pulls back to show the whole system. Idle mode: slow continuous rotation.
 */
import { ORBIT, ORBIT_PULLBACK, PILLAR_LABELS, activeIndexFor, type OrbitHandles } from "./orbit-config"

function phiFor(i: number) {
  // node i sits at theta = i * PI/2; front means theta - phi = PI/2
  return (i - 1) * (Math.PI / 2)
}

function makeGlowTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,240,210,1)')
  g.addColorStop(0.25, 'rgba(226,196,143,0.55)')
  g.addColorStop(0.6, 'rgba(200,150,90,0.12)')
  g.addColorStop(1, 'rgba(200,150,90,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

interface SceneProps {
  handles: OrbitHandles
  mode: 'scrub' | 'idle'
  phone: boolean
}

function Scene({ handles, mode, phone }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  const camera = useThree((s) => s.camera)
  const glow = useMemo(() => makeGlowTexture(), [])
  useEffect(() => () => glow.dispose(), [glow])

  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const nodeMats = useRef<(THREE.MeshBasicMaterial | null)[]>([])

  const nodes = useMemo(
    () =>
      PILLAR_LABELS.map((label, i) => {
        const theta = i * (Math.PI / 2)
        return {
          label,
          position: [Math.cos(theta) * ORBIT.radius, 0, Math.sin(theta) * ORBIT.radius] as [number, number, number],
        }
      }),
    []
  )

  const ringPoints = useMemo(() => {
    const pts: [number, number, number][] = []
    const n = 160
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2
      pts.push([Math.cos(a) * ORBIT.radius, 0, Math.sin(a) * ORBIT.radius])
    }
    return pts
  }, [])

  const haloPoints = useMemo(
    () => ringPoints.map(([x, y, z]) => [x * ORBIT.haloScale, y, z * ORBIT.haloScale] as [number, number, number]),
    [ringPoints]
  )

  // Scrubbed state and the timeline that shapes it
  const state = useMemo(
    () => ({ phi: phiFor(0) - 0.9, tilt: ORBIT.tilt, camZ: ORBIT.camZ, scale: 0.7 }),
    []
  )
  const timeline = useMemo(() => {
    const t = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })
    t.to(state, { scale: 1, phi: phiFor(0), duration: ORBIT.intro }, 0)
    for (let i = 1; i < PILLAR_LABELS.length; i++) {
      t.to(
        state,
        { phi: phiFor(i), duration: ORBIT.windowSize * ORBIT.rotateShare },
        ORBIT.intro + i * ORBIT.windowSize
      )
    }
    t.to(
      state,
      { tilt: ORBIT.tiltEnd, camZ: ORBIT.camZEnd, phi: phiFor(3) + 1.1, duration: 1 - ORBIT_PULLBACK },
      ORBIT_PULLBACK
    )
    return t
  }, [state])
  useEffect(() => () => {
    timeline.kill()
  }, [timeline])

  const smoothP = useRef(0)
  const idlePhi = useRef(0)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const g = group.current
    if (!g) return
    let active = 4
    if (mode === 'scrub') {
      const target = handles.progress.value
      smoothP.current += (target - smoothP.current) * (1 - Math.exp(-dt * ORBIT.smoothing))
      timeline.progress(Math.max(0, Math.min(1, smoothP.current)))
      g.rotation.y = state.phi
      g.rotation.x = state.tilt
      g.scale.setScalar(state.scale)
      camera.position.z = state.camZ + (phone ? ORBIT.phoneCamOffset : 0)
      active = activeIndexFor(target)
    } else {
      idlePhi.current += dt * ORBIT.idleSpeed
      g.rotation.y = idlePhi.current
      g.rotation.x = ORBIT.tiltEnd
      g.scale.setScalar(1)
      camera.position.z = phone ? ORBIT.camZ + ORBIT.phoneCamOffset : ORBIT.camZ + 0.4
    }
    // gentle breathing of the whole orbit
    g.position.y = Math.sin(performance.now() * 0.0006) * 0.04

    for (let i = 0; i < PILLAR_LABELS.length; i++) {
      const isActive = active === i
      const whole = active === 4 || active === -1
      const el = labelRefs.current[i]
      if (el) {
        el.style.opacity = isActive || whole ? '1' : '0.42'
        el.style.color = isActive ? ORBIT.colors.gold : ORBIT.colors.dim
      }
      const m = nodeMats.current[i]
      if (m) m.color.set(isActive ? ORBIT.colors.gold : ORBIT.colors.amber)
    }
  })

  const labelSize = phone ? '10px' : '11px'

  return (
    <group ref={group} rotation={[ORBIT.tilt, 0, 0]}>
      {/* the ring */}
      <Line points={ringPoints} color={ORBIT.colors.amber} lineWidth={1} transparent opacity={ORBIT.ringOpacity} />
      <Line points={haloPoints} color={ORBIT.colors.amber} lineWidth={1} transparent opacity={ORBIT.haloOpacity} dashed dashSize={0.08} gapSize={0.16} />

      {/* You */}
      <mesh>
        <sphereGeometry args={[0.055, 24, 24]} />
        <meshBasicMaterial color={ORBIT.colors.gold} />
      </mesh>
      <sprite scale={[1.3, 1.3, 1]}>
        <spriteMaterial map={glow} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <Html center zIndexRange={[2, 1]} style={{ pointerEvents: 'none' }} position={[0, -0.42, 0]}>
        <span
          aria-hidden="true"
          className="font-sans uppercase whitespace-nowrap"
          style={{ fontSize: labelSize, letterSpacing: '0.3em', color: ORBIT.colors.gold, opacity: 0.9 }}
        >
          you
        </span>
      </Html>

      {/* pillars */}
      {nodes.map((n, i) => (
        <group key={n.label} position={n.position}>
          <mesh>
            <sphereGeometry args={[ORBIT.nodeRadius, 20, 20]} />
            <meshBasicMaterial
              ref={(m) => {
                nodeMats.current[i] = m
              }}
              color={ORBIT.colors.amber}
            />
          </mesh>
          <sprite scale={[0.42, 0.42, 1]}>
            <spriteMaterial map={glow} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <Html center zIndexRange={[2, 1]} style={{ pointerEvents: 'none' }} position={[0, 0.3, 0]}>
            <span
              ref={(el) => {
                labelRefs.current[i] = el
              }}
              aria-hidden="true"
              className="font-sans uppercase whitespace-nowrap"
              style={{
                fontSize: labelSize,
                letterSpacing: '0.26em',
                color: ORBIT.colors.dim,
                transition: 'color 600ms cubic-bezier(0.22,1,0.36,1), opacity 600ms cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {n.label}
            </span>
          </Html>
        </group>
      ))}
    </group>
  )
}

interface OrbitSceneProps {
  handles: OrbitHandles
  mode?: 'scrub' | 'idle'
  active: boolean
  phone: boolean
}

export default function OrbitScene({ handles, mode = 'scrub', active, phone }: OrbitSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      flat
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ position: [0, 0, ORBIT.camZ], fov: 40, near: 0.1, far: 50 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Scene handles={handles} mode={mode} phone={phone} />
    </Canvas>
  )
}
