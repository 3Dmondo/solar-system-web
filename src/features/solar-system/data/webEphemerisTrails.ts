import { type BodyEphemerisTrail, type BodyId } from '../domain/body'
import {
  getChunkBodyById,
  getChunkBodySampleAt,
  getChunkBodySampleCount,
  getChunkBodySampleTime,
  getManifestBodyById,
  type WebEphemerisChunk,
  type WebEphemerisManifest
} from './webEphemeris'
import { interpolateChunkBodyAtTdbTime } from './webEphemerisTimeline'

const secondsPerDay = 86_400

export type ChunkBodyTrailSampler = {
  sampleAtTdbTime: (
    targetTdbSecondsFromJ2000: number,
    trailWindowDays: number
  ) => BodyEphemerisTrail
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
  originBodyId: BodyId
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

  // Pre-compute sample times for the body
  const sampleTimes = Array.from(
    { length: sampleCount },
    (_, i) => getChunkBodySampleTime(chunk, manifestBody, i)
  )

  // Pre-compute relative positions at each sample time (body - origin)
  // If bodies have same sample count, use direct indexing; otherwise interpolate origin
  const bodiesHaveSameSampleCount = sampleCount === originSampleCount
  const sampleRelativePositionsKm = Array.from({ length: sampleCount }, (_, i) => {
    const bodyPos = getChunkBodySampleAt(chunkBody, i).positionKm
    // If sample counts match, direct indexing works; otherwise interpolate origin at body's sample time
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sampleTime = sampleTimes[i]!
    const originPos = bodiesHaveSameSampleCount
      ? getChunkBodySampleAt(chunkOrigin, i).positionKm
      : interpolateChunkBodyAtTdbTime(manifest, chunk, originBodyId, sampleTime).positionKm
    return [
      bodyPos[0] - originPos[0],
      bodyPos[1] - originPos[1],
      bodyPos[2] - originPos[2]
    ] as [number, number, number]
  })

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
      const interiorStartIndex = getFirstSampleIndexAfterTime(
        sampleTimes, trailStartTdbSecondsFromJ2000
      )
      const interiorEndIndex = getFirstSampleIndexAtOrAfterTime(
        sampleTimes, targetTdbSecondsFromJ2000
      )
      const interiorPositionsKm = getCachedInteriorPositions(
        interiorPositionsByRangeKey,
        sampleRelativePositionsKm,
        interiorStartIndex,
        interiorEndIndex
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
  trailWindowDays: number
): BodyEphemerisTrail {
  return createChunkBodyTrailSampler(manifest, chunk, bodyId).sampleAtTdbTime(
    targetTdbSecondsFromJ2000,
    trailWindowDays
  )
}

export function createChunkBodyTrailSampler(
  manifest: WebEphemerisManifest,
  chunk: WebEphemerisChunk,
  bodyId: BodyId
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

  const sampleTimes = Array.from(
    { length: sampleCount },
    (_, sampleIndex) => getChunkBodySampleTime(chunk, manifestBody, sampleIndex)
  )
  const samplePositionsKm = Array.from(
    { length: sampleCount },
    (_, sampleIndex) => getChunkBodySampleAt(chunkBody, sampleIndex).positionKm
  )
  const interiorPositionsByRangeKey = new Map<string, Array<[number, number, number]>>()
  const firstSampleTime = sampleTimes[0] ?? chunk.range.startTdbSecondsFromJ2000
  const firstSamplePositionKm =
    samplePositionsKm[0] ?? ([0, 0, 0] as [number, number, number])

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
        if (trailStartTdbSecondsFromJ2000 === firstSampleTime) {
          positionsKm.push(firstSamplePositionKm)
        } else {
          positionsKm.push(
            interpolateChunkBodyAtTdbTime(
              manifest,
              chunk,
              bodyId,
              trailStartTdbSecondsFromJ2000
            ).positionKm
          )
        }
      }

      const interiorStartIndex = getFirstSampleIndexAfterTime(
        sampleTimes,
        trailStartTdbSecondsFromJ2000
      )
      const interiorEndIndex = getFirstSampleIndexAtOrAfterTime(
        sampleTimes,
        targetTdbSecondsFromJ2000
      )
      const interiorPositionsKm = getCachedInteriorPositions(
        interiorPositionsByRangeKey,
        samplePositionsKm,
        interiorStartIndex,
        interiorEndIndex
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
  samplePositionsKm: Array<[number, number, number]>,
  startIndex: number,
  endIndex: number
) {
  if (startIndex >= endIndex) {
    return []
  }

  const rangeKey = `${startIndex}:${endIndex}`
  const cachedPositions = interiorPositionsByRangeKey.get(rangeKey)

  if (cachedPositions) {
    return cachedPositions
  }

  const nextPositions = samplePositionsKm.slice(startIndex, endIndex)

  interiorPositionsByRangeKey.set(rangeKey, nextPositions)

  return nextPositions
}

function getFirstSampleIndexAfterTime(sampleTimes: number[], time: number) {
  let low = 0
  let high = sampleTimes.length

  while (low < high) {
    const middle = Math.floor((low + high) / 2)

    if ((sampleTimes[middle] ?? Number.POSITIVE_INFINITY) <= time) {
      low = middle + 1
    } else {
      high = middle
    }
  }

  return low
}

function getFirstSampleIndexAtOrAfterTime(sampleTimes: number[], time: number) {
  let low = 0
  let high = sampleTimes.length

  while (low < high) {
    const middle = Math.floor((low + high) / 2)

    if ((sampleTimes[middle] ?? Number.POSITIVE_INFINITY) < time) {
      low = middle + 1
    } else {
      high = middle
    }
  }

  return low
}
