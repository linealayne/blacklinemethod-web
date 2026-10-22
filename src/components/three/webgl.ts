let cached: boolean | null = null

/** True when a WebGL context can be created. Cached after first check. */
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false
  if (cached !== null) return cached
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    cached = !!gl
  } catch {
    cached = false
  }
  return cached
}
