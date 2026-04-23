import { useEffect, useState } from 'react'

const sampleWindowMs = 500

export function DebugFpsOverlay() {
  const [framesPerSecond, setFramesPerSecond] = useState<number | null>(null)

  useEffect(() => {
    let animationFrameId = 0
    let frameCount = 0
    let sampleStartMs = performance.now()

    const updateFramesPerSecond = (now: number) => {
      frameCount += 1

      const elapsedMs = now - sampleStartMs

      if (elapsedMs >= sampleWindowMs) {
        setFramesPerSecond(Math.round((frameCount * 1000) / elapsedMs))
        frameCount = 0
        sampleStartMs = now
      }

      animationFrameId = window.requestAnimationFrame(updateFramesPerSecond)
    }

    animationFrameId = window.requestAnimationFrame(updateFramesPerSecond)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="debug-fps-overlay" aria-label="Debug FPS overlay">
      <div className="debug-fps-overlay__label">Debug FPS</div>
      <div className="debug-fps-overlay__value">
        {framesPerSecond === null ? '--' : framesPerSecond}
      </div>
      <div className="debug-fps-overlay__hint">Default clock: per-frame</div>
    </div>
  )
}
