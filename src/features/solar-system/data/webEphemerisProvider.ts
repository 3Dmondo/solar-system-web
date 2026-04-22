import {
  type BodyEphemerisProvider,
  type BodyMetadata
} from '../domain/body'
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
import { sampleChunkBodyTrailAtTdbTime } from './webEphemerisTrails'

export type WebEphemerisProviderOptions = {
  chunkBaseUrl: string
  datasetLoader: WebDatasetLoader
  fetchImpl?: typeof fetch
  maxCachedChunks?: number
  presentationMetadata?: BodyMetadata[]
}

const defaultMaxCachedChunks = 4

export function createWebEphemerisProvider({
  chunkBaseUrl,
  datasetLoader,
  fetchImpl = fetch,
  maxCachedChunks = defaultMaxCachedChunks,
  presentationMetadata = presentationBodyMetadata
}: WebEphemerisProviderOptions): BodyEphemerisProvider {
  const normalizedChunkBaseUrl = chunkBaseUrl.replace(/[\\/]+$/, '')
  const chunkCache = new Map<string, Promise<WebEphemerisChunk>>()
  const presentationMetadataByBodyId = new Map(
    presentationMetadata.map((body) => [body.id, body])
  )

  return {
    getBodyMetadata: () => presentationMetadata,
    loadSnapshotAtUtc: async (utc) => {
      const utcDate = normalizeUtcInput(utc)
      const dataset = await datasetLoader.load()
      const approximateTdbSecondsFromJ2000 = getApproximateTdbSecondsFromJ2000(utcDate)
      const chunkRange = getRequiredChunkRange(dataset, approximateTdbSecondsFromJ2000)
      const chunk = await loadChunk(dataset, chunkRange)

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
        trails: dataset.manifest.bodies
          .map((body) => {
            const trailWindowDays =
              presentationMetadataByBodyId.get(body.bodyId)?.defaultTrailWindowDays ?? 0

            return sampleChunkBodyTrailAtTdbTime(
              dataset.manifest,
              chunk,
              body.bodyId,
              approximateTdbSecondsFromJ2000,
              trailWindowDays
            )
          })
          .filter((trail) => trail.positionsKm.length >= 2)
      }
    },
    prefetchAroundUtc: async (utc) => {
      const utcDate = normalizeUtcInput(utc)
      const dataset = await datasetLoader.load()
      const approximateTdbSecondsFromJ2000 = getApproximateTdbSecondsFromJ2000(utcDate)
      const chunkRange = getRequiredChunkRange(dataset, approximateTdbSecondsFromJ2000)
      const ranges = [
        getPreviousChunkRange(dataset.manifest, chunkRange),
        chunkRange,
        getNextChunkRange(dataset.manifest, chunkRange)
      ].filter((value): value is WebEphemerisChunkRange => value !== undefined)

      await Promise.all(ranges.map((range) => loadChunk(dataset, range)))
    },
    clearCache: () => {
      datasetLoader.clearCache()
      chunkCache.clear()
    }
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
