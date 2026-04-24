import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  getRuntimeDebugMetricsSnapshot,
  runtimeDebugMetricDefinitions,
  setRuntimeDebugMetricsEnabled,
  subscribeRuntimeDebugMetrics
} from '../debug/runtimeDebugMetrics'

const sampleWindowMs = 500

type DebugFpsOverlayProps = {
  clockStartAt?: Date | string
}

export function DebugFpsOverlay({ clockStartAt }: DebugFpsOverlayProps) {
  const [framesPerSecond, setFramesPerSecond] = useState<number | null>(null)
  const runtimeDebugMetrics = useSyncExternalStore(
    subscribeRuntimeDebugMetrics,
    getRuntimeDebugMetricsSnapshot,
    getRuntimeDebugMetricsSnapshot
  )

  useEffect(() => {
    setRuntimeDebugMetricsEnabled(true)

    return () => {
      setRuntimeDebugMetricsEnabled(false)
    }
  }, [])

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
      <div className="debug-fps-overlay__hint">Clock mode: per-frame</div>
      <div className="debug-fps-overlay__hint">
        Clock start: {normalizeClockStartAt(clockStartAt) ?? 'wall clock'}
      </div>
      <div className="debug-fps-overlay__metrics" aria-label="Runtime timing samples">
        {runtimeDebugMetricDefinitions.map(({ id, label }) => {
          const metric = runtimeDebugMetrics.metrics[id]
          const averageDurationMs = formatMetricDuration(metric.averageDurationMs)
          const maxDurationMs = formatMetricDuration(metric.maxDurationMs)

          return (
            <div key={id} className="debug-fps-overlay__metric-row">
              <span>{label}</span>
              <span>{averageDurationMs} / {maxDurationMs}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function normalizeClockStartAt(clockStartAt?: Date | string) {
  if (!clockStartAt) {
    return undefined
  }

  const normalizedClockStartAt =
    typeof clockStartAt === 'string' ? new Date(clockStartAt) : clockStartAt

  if (Number.isNaN(normalizedClockStartAt.getTime())) {
    return undefined
  }

  return normalizedClockStartAt.toISOString()
}

function formatMetricDuration(durationMs: number) {
  return `${durationMs.toFixed(durationMs >= 10 ? 0 : 1)}ms`
}
