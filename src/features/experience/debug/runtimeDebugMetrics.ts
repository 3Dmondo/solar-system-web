export const runtimeDebugMetricDefinitions = [
  { id: 'clockAdvancement', label: 'Clock' },
  { id: 'catalogRefresh', label: 'Catalog' },
  { id: 'ephemerisSnapshotGeneration', label: 'Snapshot' },
  { id: 'trailGeneration', label: 'Trails' },
  { id: 'sceneSpaceMapping', label: 'Mapping' },
  { id: 'sceneUpdate', label: 'Scene' }
] as const

export type RuntimeDebugMetricId = (typeof runtimeDebugMetricDefinitions)[number]['id']

export type RuntimeDebugMetricSummary = {
  averageDurationMs: number
  lastDurationMs: number
  maxDurationMs: number
  sampleCount: number
  totalDurationMs: number
}

export type RuntimeDebugMetricsSnapshot = {
  enabled: boolean
  sampleWindowMs: number
  updatedAtMs: number
  metrics: Record<RuntimeDebugMetricId, RuntimeDebugMetricSummary>
}

const sampleWindowMs = 500

type RuntimeDebugMetricAccumulator = {
  lastDurationMs: number
  maxDurationMs: number
  sampleCount: number
  totalDurationMs: number
}

const listeners = new Set<() => void>()
let isEnabled = false
let lastPublishTimeMs = 0
let accumulators = createMetricAccumulatorRecord()
let snapshot = createSnapshot(false, 0, accumulators)

export function setRuntimeDebugMetricsEnabled(enabled: boolean) {
  if (isEnabled === enabled) {
    return
  }

  isEnabled = enabled
  accumulators = createMetricAccumulatorRecord()
  lastPublishTimeMs = getNow()
  snapshot = createSnapshot(enabled, lastPublishTimeMs, accumulators)
  emitChange()
}

export function subscribeRuntimeDebugMetrics(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function getRuntimeDebugMetricsSnapshot() {
  return snapshot
}

export function measureRuntimeDebugMetric<Result>(
  metricId: RuntimeDebugMetricId,
  measure: () => Result
) {
  if (!isEnabled) {
    return measure()
  }

  const startedAtMs = getNow()

  try {
    return measure()
  } finally {
    recordRuntimeDebugMetric(metricId, getNow() - startedAtMs)
  }
}

export async function measureRuntimeDebugMetricAsync<Result>(
  metricId: RuntimeDebugMetricId,
  measure: () => Promise<Result>
) {
  if (!isEnabled) {
    return measure()
  }

  const startedAtMs = getNow()

  try {
    return await measure()
  } finally {
    recordRuntimeDebugMetric(metricId, getNow() - startedAtMs)
  }
}

function recordRuntimeDebugMetric(
  metricId: RuntimeDebugMetricId,
  durationMs: number
) {
  const metric = accumulators[metricId]

  metric.lastDurationMs = durationMs
  metric.maxDurationMs = Math.max(metric.maxDurationMs, durationMs)
  metric.sampleCount += 1
  metric.totalDurationMs += durationMs

  const nowMs = getNow()

  if (nowMs - lastPublishTimeMs < sampleWindowMs) {
    return
  }

  snapshot = createSnapshot(isEnabled, nowMs, accumulators)
  accumulators = createMetricAccumulatorRecord()
  lastPublishTimeMs = nowMs
  emitChange()
}

function createMetricAccumulatorRecord() {
  return Object.fromEntries(
    runtimeDebugMetricDefinitions.map(({ id }) => [
      id,
      {
        lastDurationMs: 0,
        maxDurationMs: 0,
        sampleCount: 0,
        totalDurationMs: 0
      }
    ])
  ) as Record<RuntimeDebugMetricId, RuntimeDebugMetricAccumulator>
}

function createSnapshot(
  enabled: boolean,
  updatedAtMs: number,
  values: Record<RuntimeDebugMetricId, RuntimeDebugMetricAccumulator>
): RuntimeDebugMetricsSnapshot {
  return {
    enabled,
    sampleWindowMs,
    updatedAtMs,
    metrics: Object.fromEntries(
      runtimeDebugMetricDefinitions.map(({ id }) => {
        const metric = values[id]

        return [
          id,
          {
            averageDurationMs:
              metric.sampleCount > 0 ? metric.totalDurationMs / metric.sampleCount : 0,
            lastDurationMs: metric.lastDurationMs,
            maxDurationMs: metric.maxDurationMs,
            sampleCount: metric.sampleCount,
            totalDurationMs: metric.totalDurationMs
          }
        ]
      })
    ) as Record<RuntimeDebugMetricId, RuntimeDebugMetricSummary>
  }
}

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function getNow() {
  if (typeof performance === 'undefined') {
    return Date.now()
  }

  return performance.now()
}
