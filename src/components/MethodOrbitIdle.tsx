'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useMotion } from '@/components/motion/MotionProvider'
import { MethodDiagram } from '@/components/MethodDiagram'
import { isPhone } from '@/lib/motion'
import type { OrbitHandles } from '@/components/three/orbit-config'
import { supportsWebGL } from '@/components/three/webgl'

const OrbitScene = dynamic(() => import('@/components/three/OrbitScene'), { ssr: false })

/** The four-pillar orbit, slowly rotating, for the /method page. Static diagram otherwise. */
export function MethodOrbitIdle({ className = '' }: { className?: string }) {
  const { mounted, reduced, webgl } = useMotion()
  const wrap = useRef<HTMLDivElement>(null)
  const handles = useRef<OrbitHandles>({ progress: { value: 1 } }).current
  const [active, setActive] = useState(true)
  const [phone, setPhone] = useState(false)
  const [gl, setGl] = useState<boolean | null>(null)
  useEffect(() => {
    if (mounted && !reduced && webgl && gl === null) setGl(supportsWebGL())
  }, [mounted, reduced, webgl, gl])
  const isStatic = !mounted || reduced || !webgl || gl === false

  useEffect(() => {
    const el = wrap.current
    if (!el || isStatic) return
    setPhone(isPhone())
    let inView = true
    const update = () => setActive(inView && !document.hidden)
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        update()
      },
      { threshold: 0 }
    )
    io.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [isStatic])

  return (
    <div
      ref={wrap}
      aria-hidden={isStatic ? undefined : true}
      className={`relative mx-auto aspect-square w-full max-w-[320px] md:max-w-[560px] ${className}`}
    >
      {isStatic ? (
        <MethodDiagram className="w-full h-auto" />
      ) : (
        gl === true && <OrbitScene handles={handles} mode="idle" active={active} phone={phone} />
      )}
    </div>
  )
}
