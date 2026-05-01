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

// Baseline cache for the active chunk, adjacent chunks, and normal 25-year chunks.
// Smaller generated chunk profiles expand this budget from the active trail window.
const minimumDefaultMaxCachedChunks = 6

export function createWebEphemerisProvider({
  chunkBaseUrl,
  datasetLoader,
  fetchImpl = fetch,
  maxCachedChunks,
  presentationMetadata = presentationBodyMetadata
}: WebEphemerisProviderOptions): BodyEphemerisProvider {
  const normalizedChunkBaseUrl = chunkBaseUrl.replace(/[\\/]+$/, '')
  const chunkCache = new Map<string, Promise<WebEphemerisChunk>>()
  const loadedChunkCache = new Map<string, WebEphemerisChunk>()
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
        const maxTrailWindowDays = getMaxTrailWindowDays(
          presentationMetadataByBodyId,
          dataset.manifest.bodies.map((body) => body.bodyId)
        )
        const trailChunks = getReadyTrailChunks(
          dataset,
          chunk,
          approximateTdbSecondsFromJ2000,
          maxTrailWindowDays
        )
        const trailOriginBodyId = options?.trailOriginBodyId ?? null

        // Compute trail cache key - only regenerate when epoch changes
        const trailEpoch = Math.floor(approximateTdbSecondsFromJ2000 / trailQuantizationSeconds)
        const trailChunkCacheKey = trailChunks
          .map((trailChunk) => trailChunk.range.fileName)
          .join('+')
        const trailCacheKey = `${trailChunkCacheKey}:${trailOriginBodyId}:${trailEpoch}`

        // Reuse cached trails if key matches
        let trails: ReturnType<typeof generateTrails>
        if (trailCacheKey === cachedTrailsKey && cachedTrails) {
          trails = cachedTrails
        } else {
          trails = measureRuntimeDebugMetric('trailGeneration', () =>
            generateTrails(
              dataset,
              trailChunks,
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

      const ranges = getPrefetchChunkRanges(
        dataset,
        chunkRange,
        approximateTdbSecondsFromJ2000,
        getMaxTrailWindowDays(
          presentationMetadataByBodyId,
          dataset.manifest.bodies.map((body) => body.bodyId)
        )
      )

      await Promise.all(ranges.map((range) => loadChunk(dataset, range)))
    },
    clearCache: () => {
      datasetLoader.clearCache()
      chunkCache.clear()
      loadedChunkCache.clear()
      trailSamplerCache.clear()
      relativeTrailSamplerCache.clear()
      cachedTrails = undefined
      cachedTrailsKey = ''
    }
  }

  function generateTrails(
    dataset: WebDataset,
    chunks: WebEphemerisChunk[],
    approximateTdbSecondsFromJ2000: number,
    trailOriginBodyId: BodyId | null,
    metadataByBodyId: Map<BodyId, BodyMetadata>,
    getAbsoluteSampler: typeof getTrailSampler,
    getRelativeSampler: typeof getRelativeTrailSampler
  ) {
    return dataset.manifest.bodies
      .map((body) => {
        const trailWindowDays = metadataByBodyId.get(body.bodyId)?.defaultTrailWindowDays ?? 0
        const trailSampleRateMultiplier =
          metadataByBodyId.get(body.bodyId)?.trailSampleRateMultiplier ?? 1
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
          const originBodyId = effectiveOrigin

          return sampleTrailAcrossChunks(
            bodyId,
            chunks,
            approximateTdbSecondsFromJ2000,
            trailWindowDays,
            (chunk) => getRelativeSampler(
              dataset,
              chunk,
              bodyId,
              originBodyId,
              trailSampleRateMultiplier
            )
          )
        }

        return sampleTrailAcrossChunks(
          bodyId,
          chunks,
          approximateTdbSecondsFromJ2000,
          trailWindowDays,
          (chunk) => getAbsoluteSampler(
            dataset,
            chunk,
            bodyId,
            trailSampleRateMultiplier
          )
        )
      })
      .filter((trail) => trail.positionsKm.length >= 2)
  }

  function getTrailSampler(
    dataset: WebDataset,
    chunk: WebEphemerisChunk,
    bodyId: BodyId,
    sampleRateMultiplier: number
  ) {
    const cacheKey = `${chunk.range.fileName}:${bodyId}:${sampleRateMultiplier}`
    const cachedSampler = trailSamplerCache.get(cacheKey)

    if (cachedSampler) {
      return cachedSampler
    }

    const nextSampler = createChunkBodyTrailSampler(dataset.manifest, chunk, bodyId, {
      sampleRateMultiplier
    })

    trailSamplerCache.set(cacheKey, nextSampler)

    return nextSampler
  }

  function getRelativeTrailSampler(
    dataset: WebDataset,
    chunk: WebEphemerisChunk,
    bodyId: BodyId,
    originBodyId: BodyId,
    sampleRateMultiplier: number
  ) {
    const cacheKey = `${chunk.range.fileName}:${bodyId}:${originBodyId}:${sampleRateMultiplier}`
    const cachedSampler = relativeTrailSamplerCache.get(cacheKey)

    if (cachedSampler) {
      return cachedSampler
    }

    const nextSampler = createRelativeTrailSampler(
      dataset.manifest,
      chunk,
      bodyId,
      originBodyId,
      { sampleRateMultiplier }
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
      .then((rawChunk) => {
        const parsedChunk = measureRuntimeDebugMetric('ephemerisChunkParse', () =>
          parseWebEphemerisChunk(rawChunk, dataset.manifest)
        )
        if (chunkCache.get(cacheKey) === chunkPromise) {
          loadedChunkCache.set(cacheKey, parsedChunk)
        }
        return parsedChunk
      })
      .catch((error) => {
        chunkCache.delete(cacheKey)
        loadedChunkCache.delete(cacheKey)
        throw error
      })

    touchCacheEntry(cacheKey, chunkPromise)
    evictOverflowingChunks(dataset)

    return chunkPromise
  }

  function touchCacheEntry(cacheKey: string, chunkPromise: Promise<WebEphemerisChunk>) {
    chunkCache.delete(cacheKey)
    chunkCache.set(cacheKey, chunkPromise)
  }

  function evictOverflowingChunks(dataset: WebDataset) {
    const chunkCacheLimit = getChunkCacheLimit(dataset)

    while (chunkCache.size > chunkCacheLimit) {
      const oldestCacheKey = chunkCache.keys().next().value

      if (!oldestCacheKey) {
        return
      }

      chunkCache.delete(oldestCacheKey)
      loadedChunkCache.delete(oldestCacheKey)
    }
  }

  function getChunkCacheLimit(dataset: WebDataset) {
    if (maxCachedChunks !== undefined) {
      return maxCachedChunks
    }

    const maxTrailWindowDays = getMaxTrailWindowDays(
      presentationMetadataByBodyId,
      dataset.manifest.bodies.map((body) => body.bodyId)
    )
    const chunkDurationDays = getRepresentativeChunkDurationDays(dataset)
    const previousTrailChunkBudget = Math.ceil(maxTrailWindowDays / chunkDurationDays)

    return Math.max(minimumDefaultMaxCachedChunks, previousTrailChunkBudget + 2)
  }

  function getReadyTrailChunks(
    dataset: WebDataset,
    activeChunk: WebEphemerisChunk,
    targetTdbSecondsFromJ2000: number,
    maxTrailWindowDays: number
  ) {
    const earliestTrailTdbSecondsFromJ2000 =
      targetTdbSecondsFromJ2000 - maxTrailWindowDays * secondsPerDay
    const chunks = [activeChunk]
    let previousRange = getPreviousChunkRange(dataset.manifest, activeChunk.range)

    while (
      previousRange &&
      previousRange.endTdbSecondsFromJ2000 > earliestTrailTdbSecondsFromJ2000
    ) {
      const previousChunk = loadedChunkCache.get(previousRange.fileName)

      if (!previousChunk) {
        break
      }

      chunks.unshift(previousChunk)
      previousRange = getPreviousChunkRange(dataset.manifest, previousRange)
    }

    return chunks
  }
}

function getPrefetchChunkRanges(
  dataset: WebDataset,
  activeRange: WebEphemerisChunkRange,
  targetTdbSecondsFromJ2000: number,
  maxTrailWindowDays: number
) {
  const earliestTrailTdbSecondsFromJ2000 =
    targetTdbSecondsFromJ2000 - maxTrailWindowDays * secondsPerDay
  const previousRanges: WebEphemerisChunkRange[] = []
  let previousRange = getPreviousChunkRange(dataset.manifest, activeRange)

  while (
    previousRange &&
    previousRange.endTdbSecondsFromJ2000 > earliestTrailTdbSecondsFromJ2000
  ) {
    previousRanges.push(previousRange)
    previousRange = getPreviousChunkRange(dataset.manifest, previousRange)
  }

  const nextRange = getNextChunkRange(dataset.manifest, activeRange)
  const ranges = [...previousRanges.reverse(), activeRange]

  if (nextRange) {
    ranges.push(nextRange)
  }

  return ranges
}

async function loadJson(url: string, fetchImpl: typeof fetch) {
  return measureRuntimeDebugMetricAsync('ephemerisChunkLoad', async () => {
    const response = await fetchImpl(url)

    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`)
    }

    return response.json()
  })
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

const secondsPerDay = 86_400

function sampleTrailAcrossChunks(
  bodyId: BodyId,
  chunks: WebEphemerisChunk[],
  targetTdbSecondsFromJ2000: number,
  trailWindowDays: number,
  createSampler: (chunk: WebEphemerisChunk) => ReturnType<typeof createChunkBodyTrailSampler>
) {
  const trailStartTdbSecondsFromJ2000 =
    targetTdbSecondsFromJ2000 - trailWindowDays * secondsPerDay
  const positionsKm: Array<[number, number, number]> = []

  chunks.forEach((chunk) => {
    const segmentStartTdbSecondsFromJ2000 = Math.max(
      chunk.range.startTdbSecondsFromJ2000,
      trailStartTdbSecondsFromJ2000
    )
    const segmentEndTdbSecondsFromJ2000 = Math.min(
      chunk.range.endTdbSecondsFromJ2000,
      targetTdbSecondsFromJ2000
    )

    if (segmentStartTdbSecondsFromJ2000 >= segmentEndTdbSecondsFromJ2000) {
      return
    }

    const segmentWindowDays =
      (segmentEndTdbSecondsFromJ2000 - segmentStartTdbSecondsFromJ2000) / secondsPerDay
    const segmentTrail = createSampler(chunk)
      .sampleAtTdbTime(segmentEndTdbSecondsFromJ2000, segmentWindowDays)
    const segmentPositionsKm =
      positionsKm.length > 0 && segmentTrail.positionsKm.length > 0
        ? segmentTrail.positionsKm.slice(1)
        : segmentTrail.positionsKm

    positionsKm.push(...segmentPositionsKm)
  })

  return {
    id: bodyId,
    positionsKm
  }
}

function getMaxTrailWindowDays(
  metadataByBodyId: Map<BodyId, BodyMetadata>,
  bodyIds: BodyId[]
) {
  return Math.max(
    0,
    ...bodyIds.map((bodyId) => metadataByBodyId.get(bodyId)?.defaultTrailWindowDays ?? 0)
  )
}

function getRepresentativeChunkDurationDays(dataset: WebDataset) {
  const firstChunk = dataset.manifest.chunks[0]

  if (!firstChunk) {
    return 1
  }

  return Math.max(
    1,
    (firstChunk.endTdbSecondsFromJ2000 - firstChunk.startTdbSecondsFromJ2000) /
      secondsPerDay
  )
}
