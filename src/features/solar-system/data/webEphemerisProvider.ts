import {
  getParentBody,
  isSatellite,
  type BodyEphemerisProvider,
  type BodyId,
  type BodyMetadata
} from '../domain/body'
import {
  measureRuntimeDebugMetric,
  measureRuntimeDebugMetricAsync
} from '../../experience/debug/runtimeDebugMetrics'
import {
  getChunkRangeForTdbTime,
  getNextChunkRange,
  getPreviousChunkRange,
  getApproximateTdbSecondsFromJ2000,
  interpolateChunkBodyAtTdbTime
} from './webEphemerisTimeline'
import {
  parseWebEphemerisChunk,
  type WebEphemerisChunk,
  type WebEphemerisChunkRange
} from './webEphemeris'
import { type WebDataset, type WebDatasetLoader } from './webDatasetLoader'
import { presentationBodyMetadata } from './bodyPresentation'
import { createChunkBodyTrailSampler, createRelativeTrailSampler } from './webEphemerisTrails'

export type WebEphemerisProviderOptions = {
  chunkBaseUrl: string
  datasetLoader: WebDatasetLoader
  fetchImpl?: typeof fetch
  maxCachedChunks?: number
  presentationMetadata?: BodyMetadata[]
}

// Increased from 4 to support outer planet trails (up to 25 years)
// that may span across chunk boundaries
const defaultMaxCachedChunks = 6

export function createWebEphemerisProvider({
  chunkBaseUrl,
  datasetLoader,
  fetchImpl = fetch,
  maxCachedChunks = defaultMaxCachedChunks,
  presentationMetadata = presentationBodyMetadata
}: WebEphemerisProviderOptions): BodyEphemerisProvider {
  const normalizedChunkBaseUrl = chunkBaseUrl.replace(/[\\/]+$/, '')
  const chunkCache = new Map<string, Promise<WebEphemerisChunk>>()
  const trailSamplerCache = new Map<string, ReturnType<typeof createChunkBodyTrailSampler>>()
  const relativeTrailSamplerCache = new Map<string, ReturnType<typeof createRelativeTrailSampler>>()
  const presentationMetadataByBodyId = new Map(
    presentationMetadata.map((body) => [body.id, body])
  )

  // Trail caching - trails don't need to update every frame
  // Quantize to ~100ms epochs (movement is imperceptible at this scale)
  const trailQuantizationSeconds = 0.1
  let cachedTrails: ReturnType<typeof generateTrails> | undefined
  let cachedTrailsKey = ''

  return {
    getBodyMetadata: () => presentationMetadata,
    loadSnapshotAtUtc: async (utc, options) =>
      measureRuntimeDebugMetricAsync('ephemerisSnapshotGeneration', async () => {
        const utcDate = normalizeUtcInput(utc)
        const dataset = await datasetLoader.load()
        const approximateTdbSecondsFromJ2000 = getApproximateTdbSecondsFromJ2000(utcDate)
        const chunkRange = getRequiredChunkRange(dataset, approximateTdbSecondsFromJ2000)
        const chunk = await loadChunk(dataset, chunkRange)
        const trailOriginBodyId = options?.trailOriginBodyId ?? null

        // Compute trail cache key - only regenerate when epoch changes
        const trailEpoch = Math.floor(approximateTdbSecondsFromJ2000 / trailQuantizationSeconds)
        const trailCacheKey = `${chunkRange.fileName}:${trailOriginBodyId}:${trailEpoch}`

        // Reuse cached trails if key matches
        let trails: ReturnType<typeof generateTrails>
        if (trailCacheKey === cachedTrailsKey && cachedTrails) {
          trails = cachedTrails
        } else {
          trails = measureRuntimeDebugMetric('trailGeneration', () =>
            generateTrails(
              dataset,
              chunk,
              approximateTdbSecondsFromJ2000,
              trailOriginBodyId,
              presentationMetadataByBodyId,
              getTrailSampler,
              getRelativeTrailSampler
            )
          )
          cachedTrails = trails
          cachedTrailsKey = trailCacheKey
        }

        return {
          capturedAt: utcDate.toISOString(),
          approximateTdbSecondsFromJ2000,
          chunkFileName: chunkRange.fileName,
          chunkStartTdbSecondsFromJ2000: chunkRange.startTdbSecondsFromJ2000,
          chunkEndTdbSecondsFromJ2000: chunkRange.endTdbSecondsFromJ2000,
          bodies: dataset.manifest.bodies.map((body) => {
            const state = interpolateChunkBodyAtTdbTime(
              dataset.manifest,
              chunk,
              body.bodyId,
              approximateTdbSecondsFromJ2000
            )

            return {
              id: body.bodyId,
              positionKm: state.positionKm,
              velocityKmPerSecond: state.velocityKmPerSecond
            }
          }),
          trails
        }
      }),
    prefetchAroundUtc: async (utc) => {
      const utcDate = normalizeUtcInput(utc)
      const dataset = await datasetLoader.load()
      const approximateTdbSecondsFromJ2000 = getApproximateTdbSecondsFromJ2000(utcDate)
      const chunkRange = getRequiredChunkRange(dataset, approximateTdbSecondsFromJ2000)

      // Load 2 previous chunks to support outer planet trails (up to 25 years)
      const prev1 = getPreviousChunkRange(dataset.manifest, chunkRange)
      const prev2 = prev1 ? getPreviousChunkRange(dataset.manifest, prev1) : undefined

      const ranges = [
        prev2,
        prev1,
        chunkRange,
        getNextChunkRange(dataset.manifest, chunkRange)
      ].filter((value): value is WebEphemerisChunkRange => value !== undefined)

      await Promise.all(ranges.map((range) => loadChunk(dataset, range)))
    },
    clearCache: () => {
      datasetLoader.clearCache()
      chunkCache.clear()
      trailSamplerCache.clear()
      relativeTrailSamplerCache.clear()
      cachedTrails = undefined
      cachedTrailsKey = ''
    }
  }

  function generateTrails(
    dataset: WebDataset,
    chunk: WebEphemerisChunk,
    approximateTdbSecondsFromJ2000: number,
    trailOriginBodyId: BodyId | null,
    metadataByBodyId: Map<BodyId, BodyMetadata>,
    getAbsoluteSampler: typeof getTrailSampler,
    getRelativeSampler: typeof getRelativeTrailSampler
  ) {
    return dataset.manifest.bodies
      .map((body) => {
        const trailWindowDays = metadataByBodyId.get(body.bodyId)?.defaultTrailWindowDays ?? 0
        const bodyId = body.bodyId

        // Determine the effective origin for this body's trail
        // - If explicit origin is set (e.g., Earth-centered frame): use that
        // - If body is a satellite: use parent as origin (so trail shows orbit around parent)
        // - Otherwise: use absolute SSB positions
        let effectiveOrigin: BodyId | null = trailOriginBodyId

        if (effectiveOrigin === null && isSatellite(bodyId)) {
          const parentId = getParentBody(bodyId)
          if (parentId) {
            effectiveOrigin = parentId
          }
        }

        if (effectiveOrigin !== null && bodyId !== effectiveOrigin) {
          return getRelativeSampler(dataset, chunk, bodyId, effectiveOrigin)
            .sampleAtTdbTime(approximateTdbSecondsFromJ2000, trailWindowDays)
        }

        return getAbsoluteSampler(dataset, chunk, bodyId)
          .sampleAtTdbTime(approximateTdbSecondsFromJ2000, trailWindowDays)
      })
      .filter((trail) => trail.positionsKm.length >= 2)
  }

  function getTrailSampler(
    dataset: WebDataset,
    chunk: WebEphemerisChunk,
    bodyId: BodyId
  ) {
    const cacheKey = `${chunk.range.fileName}:${bodyId}`
    const cachedSampler = trailSamplerCache.get(cacheKey)

    if (cachedSampler) {
      return cachedSampler
    }

    const nextSampler = createChunkBodyTrailSampler(dataset.manifest, chunk, bodyId)

    trailSamplerCache.set(cacheKey, nextSampler)

    return nextSampler
  }

  function getRelativeTrailSampler(
    dataset: WebDataset,
    chunk: WebEphemerisChunk,
    bodyId: BodyId,
    originBodyId: BodyId
  ) {
    const cacheKey = `${chunk.range.fileName}:${bodyId}:${originBodyId}`
    const cachedSampler = relativeTrailSamplerCache.get(cacheKey)

    if (cachedSampler) {
      return cachedSampler
    }

    const nextSampler = createRelativeTrailSampler(
      dataset.manifest,
      chunk,
      bodyId,
      originBodyId
    )

    relativeTrailSamplerCache.set(cacheKey, nextSampler)

    return nextSampler
  }

  function loadChunk(dataset: WebDataset, range: WebEphemerisChunkRange) {
    const cacheKey = range.fileName
    const cached = chunkCache.get(cacheKey)

    if (cached) {
      touchCacheEntry(cacheKey, cached)
      return cached
    }

    const chunkPromise = loadJson(
      `${normalizedChunkBaseUrl}/${range.fileName}`,
      fetchImpl
    )
      .then((rawChunk) => parseWebEphemerisChunk(rawChunk, dataset.manifest))
      .catch((error) => {
        chunkCache.delete(cacheKey)
        throw error
      })

    touchCacheEntry(cacheKey, chunkPromise)
    evictOverflowingChunks()

    return chunkPromise
  }

  function touchCacheEntry(cacheKey: string, chunkPromise: Promise<WebEphemerisChunk>) {
    chunkCache.delete(cacheKey)
    chunkCache.set(cacheKey, chunkPromise)
  }

  function evictOverflowingChunks() {
    while (chunkCache.size > maxCachedChunks) {
      const oldestCacheKey = chunkCache.keys().next().value

      if (!oldestCacheKey) {
        return
      }

      chunkCache.delete(oldestCacheKey)
    }
  }
}

async function loadJson(url: string, fetchImpl: typeof fetch) {
  const response = await fetchImpl(url)

  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

function getRequiredChunkRange(dataset: WebDataset, approximateTdbSecondsFromJ2000: number) {
  const chunkRange = getChunkRangeForTdbTime(
    dataset.manifest,
    approximateTdbSecondsFromJ2000
  )

  if (!chunkRange) {
    const firstChunk = dataset.manifest.chunks[0]
    const lastChunk = dataset.manifest.chunks[dataset.manifest.chunks.length - 1]

    throw new RangeError(
      `Requested time ${approximateTdbSecondsFromJ2000} is outside the supported ephemeris range ${firstChunk?.startTdbSecondsFromJ2000}..${lastChunk?.endTdbSecondsFromJ2000}`
    )
  }

  return chunkRange
}

function normalizeUtcInput(utc: Date | string) {
  const utcDate = typeof utc === 'string' ? new Date(utc) : utc

  if (Number.isNaN(utcDate.getTime())) {
    throw new Error('utc must be a valid Date or ISO-8601 string')
  }

  return utcDate
}
