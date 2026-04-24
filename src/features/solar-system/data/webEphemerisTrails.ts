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
