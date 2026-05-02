import { type BodyEphemerisTrail, type BodyId } from '../domain/body'
import {
  getChunkBodyById,
  getChunkBodySampleCount,
  getManifestBodyById,
  type WebEphemerisChunk,
  type WebEphemerisManifest
} from './webEphemeris'
import { interpolateChunkBodyAtTdbTime } from './webEphemerisTimeline'

const secondsPerDay = 86_400
const maxCachedInteriorTrailRanges = 8

export type ChunkBodyTrailSampler = {
  sampleAtTdbTime: (
    targetTdbSecondsFromJ2000: number,
    trailWindowDays: number
  ) => BodyEphemerisTrail
}

export type TrailSamplerOptions = {
  sampleRateMultiplier?: number
}

export type RelativeTrailSamplerOptions = {
  manifest: WebEphemerisManifest
  chunk: WebEphemerisChunk
  bodyId: BodyId
  originBodyId: BodyId | null
  targetTdbSecondsFromJ2000: number
  trailWindowDays: number
}

/**
 * Creates a trail sampler that computes positions relative to an origin body.
 * Caches computed interior positions for performance - only start/end points
 * need fresh interpolation each frame.
 *
 * @param manifest - Ephemeris manifest
 * @param chunk - Loaded chunk data
 * @param bodyId - Body to sample trail for
 * @param originBodyId - Origin body to compute relative positions against
 */
export function createRelativeTrailSampler(
  manifest: WebEphemerisManifest,
  chunk: WebEphemerisChunk,
  bodyId: BodyId,
  originBodyId: BodyId,
  options: TrailSamplerOptions = {}
): ChunkBodyTrailSampler {
  const manifestBody = getManifestBodyById(manifest, bodyId)
  const manifestOrigin = getManifestBodyById(manifest, originBodyId)

  if (!manifestBody) {
    throw new Error(`manifest is missing body ${bodyId}`)
  }

  if (!manifestOrigin) {
    throw new Error(`manifest is missing origin body ${originBodyId}`)
  }

  const chunkBody = getChunkBodyById(chunk, bodyId)
  const chunkOrigin = getChunkBodyById(chunk, originBodyId)

  if (!chunkBody) {
    throw new Error(`chunk ${chunk.range.fileName} is missing body ${bodyId}`)
  }

  if (!chunkOrigin) {
    throw new Error(`chunk ${chunk.range.fileName} is missing origin body ${originBodyId}`)
  }

  const sampleCount = getChunkBodySampleCount(chunkBody)
  const originSampleCount = getChunkBodySampleCount(chunkOrigin)

  if (sampleCount === 0) {
    return {
      sampleAtTdbTime: () => ({ id: bodyId, positionsKm: [] })
    }
  }

  if (originSampleCount === 0) {
    return {
      sampleAtTdbTime: () => ({ id: bodyId, positionsKm: [] })
    }
  }

  const resampleCadenceSeconds = getTrailResampleCadenceSeconds(
    manifestBody.sampleDays,
    options.sampleRateMultiplier
  )

  // Cache for interior positions by range key
  const interiorPositionsByRangeKey = new Map<string, Array<[number, number, number]>>()

  return {
    sampleAtTdbTime: (targetTdbSecondsFromJ2000, trailWindowDays) => {
      if (!Number.isFinite(trailWindowDays) || trailWindowDays < 0) {
        throw new Error('trailWindowDays must be a finite number >= 0')
      }

      const trailStartTdbSecondsFromJ2000 = Math.max(
        chunk.range.startTdbSecondsFromJ2000,
        targetTdbSecondsFromJ2000 - trailWindowDays * secondsPerDay
      )

      if (trailStartTdbSecondsFromJ2000 >= targetTdbSecondsFromJ2000) {
        return { id: bodyId, positionsKm: [] }
      }

      const positionsKm: Array<[number, number, number]> = []

      // Interpolated start point
      const bodyStart = interpolateChunkBodyAtTdbTime(
        manifest, chunk, bodyId, trailStartTdbSecondsFromJ2000
      )
      const originStart = interpolateChunkBodyAtTdbTime(
        manifest, chunk, originBodyId, trailStartTdbSecondsFromJ2000
      )
      positionsKm.push([
        bodyStart.positionKm[0] - originStart.positionKm[0],
        bodyStart.positionKm[1] - originStart.positionKm[1],
        bodyStart.positionKm[2] - originStart.positionKm[2]
      ])

      // Cached interior positions
      const interiorStartIndex = getFirstCadenceIndexAfterTime(
        chunk.range.startTdbSecondsFromJ2000,
        resampleCadenceSeconds,
        trailStartTdbSecondsFromJ2000
      )
      const interiorEndIndex = getFirstCadenceIndexAtOrAfterTime(
        chunk.range.startTdbSecondsFromJ2000,
        resampleCadenceSeconds,
        targetTdbSecondsFromJ2000
      )
      const interiorPositionsKm = getCachedInteriorPositions(
        interiorPositionsByRangeKey,
        interiorStartIndex,
        interiorEndIndex,
        (interiorIndex) => {
          const sampleTime =
            chunk.range.startTdbSecondsFromJ2000 + interiorIndex * resampleCadenceSeconds
          const body = interpolateChunkBodyAtTdbTime(manifest, chunk, bodyId, sampleTime)
          const origin = interpolateChunkBodyAtTdbTime(
            manifest, chunk, originBodyId, sampleTime
          )

          return [
            body.positionKm[0] - origin.positionKm[0],
            body.positionKm[1] - origin.positionKm[1],
            body.positionKm[2] - origin.positionKm[2]
          ]
        }
      )

      if (interiorPositionsKm.length > 0) {
        positionsKm.push(...interiorPositionsKm)
      }

      // Interpolated end point
      const bodyEnd = interpolateChunkBodyAtTdbTime(
        manifest, chunk, bodyId, targetTdbSecondsFromJ2000
      )
      const originEnd = interpolateChunkBodyAtTdbTime(
        manifest, chunk, originBodyId, targetTdbSecondsFromJ2000
      )
      positionsKm.push([
        bodyEnd.positionKm[0] - originEnd.positionKm[0],
        bodyEnd.positionKm[1] - originEnd.positionKm[1],
        bodyEnd.positionKm[2] - originEnd.positionKm[2]
      ])

      return { id: bodyId, positionsKm }
    }
  }
}

/**
 * Sample a body's trail positions relative to an origin body.
 * @deprecated Use createRelativeTrailSampler for cached sampling
 */
export function sampleRelativeTrailAtTdbTime({
  manifest,
  chunk,
  bodyId,
  originBodyId,
  targetTdbSecondsFromJ2000,
  trailWindowDays
}: RelativeTrailSamplerOptions): BodyEphemerisTrail {
  // If no origin body or body is the origin, use standard sampler
  if (originBodyId === null || bodyId === originBodyId) {
    return sampleChunkBodyTrailAtTdbTime(
      manifest,
      chunk,
      bodyId,
      targetTdbSecondsFromJ2000,
      trailWindowDays
    )
  }

  // Delegate to cached sampler (creating one for this call)
  return createRelativeTrailSampler(manifest, chunk, bodyId, originBodyId)
    .sampleAtTdbTime(targetTdbSecondsFromJ2000, trailWindowDays)
}

export function sampleChunkBodyTrailAtTdbTime(
  manifest: WebEphemerisManifest,
  chunk: WebEphemerisChunk,
  bodyId: BodyId,
  targetTdbSecondsFromJ2000: number,
  trailWindowDays: number,
  options: TrailSamplerOptions = {}
): BodyEphemerisTrail {
  return createChunkBodyTrailSampler(manifest, chunk, bodyId, options).sampleAtTdbTime(
    targetTdbSecondsFromJ2000,
    trailWindowDays
  )
}

export function createChunkBodyTrailSampler(
  manifest: WebEphemerisManifest,
  chunk: WebEphemerisChunk,
  bodyId: BodyId,
  options: TrailSamplerOptions = {}
): ChunkBodyTrailSampler {
  const manifestBody = getManifestBodyById(manifest, bodyId)

  if (!manifestBody) {
    throw new Error(`manifest is missing body ${bodyId}`)
  }

  const chunkBody = getChunkBodyById(chunk, bodyId)

  if (!chunkBody) {
    throw new Error(`chunk ${chunk.range.fileName} is missing body ${bodyId}`)
  }

  const sampleCount = getChunkBodySampleCount(chunkBody)

  if (sampleCount === 0) {
    return {
      sampleAtTdbTime: () => ({
        id: bodyId,
        positionsKm: []
      })
    }
  }

  const resampleCadenceSeconds = getTrailResampleCadenceSeconds(
    manifestBody.sampleDays,
    options.sampleRateMultiplier
  )
  const interiorPositionsByRangeKey = new Map<string, Array<[number, number, number]>>()

  return {
    sampleAtTdbTime: (targetTdbSecondsFromJ2000, trailWindowDays) => {
      if (!Number.isFinite(trailWindowDays) || trailWindowDays < 0) {
        throw new Error(
          'trailWindowDays must be a finite number greater than or equal to zero'
        )
      }

      const trailStartTdbSecondsFromJ2000 = Math.max(
        chunk.range.startTdbSecondsFromJ2000,
        targetTdbSecondsFromJ2000 - trailWindowDays * secondsPerDay
      )
      const positionsKm: Array<[number, number, number]> = []

      if (trailStartTdbSecondsFromJ2000 < targetTdbSecondsFromJ2000) {
        positionsKm.push(
          interpolateChunkBodyAtTdbTime(
            manifest,
            chunk,
            bodyId,
            trailStartTdbSecondsFromJ2000
          ).positionKm
        )
      }

      const interiorStartIndex = getFirstCadenceIndexAfterTime(
        chunk.range.startTdbSecondsFromJ2000,
        resampleCadenceSeconds,
        trailStartTdbSecondsFromJ2000
      )
      const interiorEndIndex = getFirstCadenceIndexAtOrAfterTime(
        chunk.range.startTdbSecondsFromJ2000,
        resampleCadenceSeconds,
        targetTdbSecondsFromJ2000
      )
      const interiorPositionsKm = getCachedInteriorPositions(
        interiorPositionsByRangeKey,
        interiorStartIndex,
        interiorEndIndex,
        (interiorIndex) =>
          interpolateChunkBodyAtTdbTime(
            manifest,
            chunk,
            bodyId,
            chunk.range.startTdbSecondsFromJ2000
              + interiorIndex * resampleCadenceSeconds
          ).positionKm
      )

      if (interiorPositionsKm.length > 0) {
        positionsKm.push(...interiorPositionsKm)
      }

      positionsKm.push(
        interpolateChunkBodyAtTdbTime(manifest, chunk, bodyId, targetTdbSecondsFromJ2000)
          .positionKm
      )

      return {
        id: bodyId,
        positionsKm
      }
    }
  }
}

function getCachedInteriorPositions(
  interiorPositionsByRangeKey: Map<string, Array<[number, number, number]>>,
  startIndex: number,
  endIndex: number,
  samplePositionAtIndex: (index: number) => [number, number, number]
) {
  if (startIndex >= endIndex) {
    return []
  }

  const rangeKey = `${startIndex}:${endIndex}`
  const cachedPositions = interiorPositionsByRangeKey.get(rangeKey)

  if (cachedPositions) {
    interiorPositionsByRangeKey.delete(rangeKey)
    interiorPositionsByRangeKey.set(rangeKey, cachedPositions)
    return cachedPositions
  }

  const nextPositions = Array.from(
    { length: endIndex - startIndex },
    (_, offset) => samplePositionAtIndex(startIndex + offset)
  )

  interiorPositionsByRangeKey.set(rangeKey, nextPositions)
  evictOverflowingInteriorTrailRanges(interiorPositionsByRangeKey)

  return nextPositions
}

function evictOverflowingInteriorTrailRanges(
  interiorPositionsByRangeKey: Map<string, Array<[number, number, number]>>
) {
  while (interiorPositionsByRangeKey.size > maxCachedInteriorTrailRanges) {
    const oldestRangeKey = interiorPositionsByRangeKey.keys().next().value

    if (!oldestRangeKey) {
      return
    }

    interiorPositionsByRangeKey.delete(oldestRangeKey)
  }
}

function getTrailResampleCadenceSeconds(
  sourceSampleDays: number,
  sampleRateMultiplier = 1
) {
  if (!Number.isFinite(sampleRateMultiplier) || sampleRateMultiplier <= 0) {
    throw new Error('trail sampleRateMultiplier must be a finite number greater than zero')
  }

  return sourceSampleDays * secondsPerDay / sampleRateMultiplier
}

function getFirstCadenceIndexAfterTime(
  rangeStartTdbSecondsFromJ2000: number,
  cadenceSeconds: number,
  time: number
) {
  return Math.max(
    0,
    Math.floor((time - rangeStartTdbSecondsFromJ2000) / cadenceSeconds) + 1
  )
}

function getFirstCadenceIndexAtOrAfterTime(
  rangeStartTdbSecondsFromJ2000: number,
  cadenceSeconds: number,
  time: number
) {
  return Math.max(
    0,
    Math.ceil((time - rangeStartTdbSecondsFromJ2000) / cadenceSeconds)
  )
}
