'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { gsap } from '@/lib/gsap'
import { ORBIT, ORBIT_PULLBACK, PILLAR_LABELS, activeIndexFor, type OrbitHandles } from './orbit-config'

/**
 * The four pillars orbit "You": a softly glowing centre point, four small
 * labelled nodes on a tilted ring joined by one thin amber line.
 *
 * Scrub mode: driven by handles.progress (0..1 across the pinned section).
 * Intro, then each pillar rotates to the front in turn, then the orbit
 * pulls back to show the whole system. Idle mode: slow continuous rotation.
 *
 * Labels are plain DOM spans in an overlay beside the canvas, positioned by
 * projecting the node positions each frame (no drei, no extra bundles).
 */

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

function ringGeometry(radius: number, segments = 160) {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}

interface SceneProps {
  handles: OrbitHandles
  mode: 'scrub' | 'idle'
  phone: boolean
  labels: React.MutableRefObject<(HTMLSpanElement | null)[]>
  centreLabel: React.MutableRefObject<HTMLSpanElement | null>
}

function Scene({ handles, mode, phone, labels, centreLabel }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const glow = useMemo(() => makeGlowTexture(), [])
  useEffect(() => () => glow.dispose(), [glow])

  const nodeRefs = useRef<(THREE.Object3D | null)[]>([])
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

  const ring = useMemo(() => {
    const line = new THREE.LineLoop(
      ringGeometry(ORBIT.radius),
      new THREE.LineBasicMaterial({ color: ORBIT.colors.amber, transparent: true, opacity: ORBIT.ringOpacity })
    )
    const halo = new THREE.LineLoop(
      ringGeometry(ORBIT.radius * ORBIT.haloScale, 200),
      new THREE.LineDashedMaterial({
        color: ORBIT.colors.amber,
        transparent: true,
        opacity: ORBIT.haloOpacity,
        dashSize: 0.08,
        gapSize: 0.16,
      })
    )
    halo.computeLineDistances()
    return { line, halo }
  }, [])
  useEffect(
    () => () => {
      ring.line.geometry.dispose()
      ;(ring.line.material as THREE.Material).dispose()
      ring.halo.geometry.dispose()
      ;(ring.halo.material as THREE.Material).dispose()
    },
    [ring]
  )

  const colours = useMemo(
    () => ({ gold: new THREE.Color(ORBIT.colors.gold), amber: new THREE.Color(ORBIT.colors.amber) }),
    []
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
  const lastActive = useRef<number | null>(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])

  // Labels sit above nodes on the far side of the ring and below nodes on the
  // near side, so the front label never collides with the centre label.
  const placeLabel = (el: HTMLSpanElement | null, obj: THREE.Object3D | null, centreY?: number) => {
    if (!el || !obj) return
    obj.getWorldPosition(tmp)
    tmp.project(camera)
    const x = ((tmp.x + 1) / 2) * size.width
    const y = ((1 - tmp.y) / 2) * size.height
    if (centreY !== undefined) {
      const below = y > centreY + 4
      const next = below ? "1.6em" : "-1.6em"
      if (el.style.marginTop !== next) el.style.marginTop = next
    }
    el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
    return y
  }

  useFrame((frame, delta) => {
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
    g.position.y = Math.sin(frame.clock.elapsedTime * 0.6) * 0.04
    g.updateMatrixWorld()

    // labels follow their nodes
    const centreY = placeLabel(centreLabel.current, g)
    for (let i = 0; i < PILLAR_LABELS.length; i++) {
      placeLabel(labels.current[i], nodeRefs.current[i], centreY)
    }

    if (lastActive.current === active) return
    lastActive.current = active
    for (let i = 0; i < PILLAR_LABELS.length; i++) {
      const isActive = active === i
      const whole = active === 4 || active === -1
      const el = labels.current[i]
      if (el) {
        el.style.opacity = isActive || whole ? '1' : '0.42'
        el.style.color = isActive ? ORBIT.colors.gold : ORBIT.colors.dim
      }
      const m = nodeMats.current[i]
      if (m) m.color.copy(isActive ? colours.gold : colours.amber)
    }
  })

  return (
    <group ref={group} rotation={[ORBIT.tilt, 0, 0]}>
      <primitive object={ring.line} />
      <primitive object={ring.halo} />

      {/* You */}
      <mesh>
        <sphereGeometry args={[0.055, 24, 24]} />
        <meshBasicMaterial color={ORBIT.colors.gold} />
      </mesh>
      <sprite scale={[1.3, 1.3, 1]}>
        <spriteMaterial map={glow} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* pillars */}
      {nodes.map((n, i) => (
        <group
          key={n.label}
          position={n.position}
          ref={(o) => {
            nodeRefs.current[i] = o
          }}
        >
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
  const labels = useRef<(HTMLSpanElement | null)[]>([])
  const centreLabel = useRef<HTMLSpanElement | null>(null)
  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    fontSize: phone ? '10px' : '11px',
    letterSpacing: '0.26em',
    color: ORBIT.colors.dim,
    whiteSpace: 'nowrap',
    transition: 'color 600ms cubic-bezier(0.22,1,0.36,1), opacity 600ms cubic-bezier(0.22,1,0.36,1)',
    willChange: 'transform',
  }

  return (
    <>
      <Canvas
        dpr={[1, 1.5]}
        flat
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'default', stencil: false }}
        camera={{ position: [0, 0, ORBIT.camZ], fov: 40, near: 0.1, far: 50 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene handles={handles} mode={mode} phone={phone} labels={labels} centreLabel={centreLabel} />
      </Canvas>
      {/* label overlay: decoration only; the pillar names exist as real text beside the orbit */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {PILLAR_LABELS.map((label, i) => (
          <span
            key={label}
            ref={(el) => {
              labels.current[i] = el
            }}
            className="font-sans uppercase"
            style={{ ...labelStyle, marginTop: '-1.6em' }}
          >
            {label}
          </span>
        ))}
        <span
          ref={centreLabel}
          className="font-sans uppercase"
          style={{ ...labelStyle, color: ORBIT.colors.gold, opacity: 0.9, letterSpacing: '0.3em', marginTop: '1.7em' }}
        >
          you
        </span>
      </div>
    </>
  )
}
