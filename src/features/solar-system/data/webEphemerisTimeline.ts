import { type BodyId } from '../domain/body'
import {
  getChunkBodyById,
  getChunkBodySampleAt,
  getChunkBodySampleCount,
  getChunkBodySampleTime,
  getManifestBodyById,
  type WebEphemerisChunk,
  type WebEphemerisChunkRange,
  type WebEphemerisManifest,
  type WebEphemerisStateSample
} from './webEphemeris'

export const approximateJ2000UtcIso = '2000-01-01T11:58:55.816Z'

const approximateJ2000UtcMilliseconds = Date.parse(approximateJ2000UtcIso)
const secondsPerDay = 86_400

export type WebEphemerisInterpolatedState = {
  positionKm: [number, number, number]
  velocityKmPerSecond: [number, number, number]
}

export function getApproximateTdbSecondsFromJ2000(
  utc: Date | string,
  options?: { roundToWholeSecond?: boolean }
) {
  const utcDate = typeof utc === 'string' ? new Date(utc) : utc
  const utcMilliseconds = utcDate.getTime()

  if (Number.isNaN(utcMilliseconds)) {
    throw new Error('utc must be a valid Date or ISO-8601 string')
  }

  const secondsFromJ2000 = (utcMilliseconds - approximateJ2000UtcMilliseconds) / 1000

  return options?.roundToWholeSecond ? Math.round(secondsFromJ2000) : secondsFromJ2000
}

export function isTdbTimeWithinChunkRange(
  manifest: WebEphemerisManifest,
  range: WebEphemerisChunkRange,
  tdbSecondsFromJ2000: number
) {
  const rangeIndex = getChunkRangeIndex(manifest, range)
  const isLastRange = rangeIndex === manifest.chunks.length - 1

  return (
    tdbSecondsFromJ2000 >= range.startTdbSecondsFromJ2000 &&
    (tdbSecondsFromJ2000 < range.endTdbSecondsFromJ2000 ||
      (isLastRange && tdbSecondsFromJ2000 === range.endTdbSecondsFromJ2000))
  )
}

export function getChunkRangeForTdbTime(
  manifest: WebEphemerisManifest,
  tdbSecondsFromJ2000: number
) {
  return manifest.chunks.find((range) =>
    isTdbTimeWithinChunkRange(manifest, range, tdbSecondsFromJ2000)
  )
}

export function getPreviousChunkRange(
  manifest: WebEphemerisManifest,
  currentRange: WebEphemerisChunkRange
) {
  const rangeIndex = getChunkRangeIndex(manifest, currentRange)

  return rangeIndex > 0 ? manifest.chunks[rangeIndex - 1] : undefined
}

export function getNextChunkRange(
  manifest: WebEphemerisManifest,
  currentRange: WebEphemerisChunkRange
) {
  const rangeIndex = getChunkRangeIndex(manifest, currentRange)

  return rangeIndex < manifest.chunks.length - 1 ? manifest.chunks[rangeIndex + 1] : undefined
}

export function interpolateChunkBodyAtTdbTime(
  manifest: WebEphemerisManifest,
  chunk: WebEphemerisChunk,
  bodyId: BodyId,
  tdbSecondsFromJ2000: number
): WebEphemerisInterpolatedState {
  if (!isTdbTimeWithinChunkRange(manifest, chunk.range, tdbSecondsFromJ2000)) {
    throw new RangeError(
      `tdbSecondsFromJ2000 ${tdbSecondsFromJ2000} is outside chunk ${chunk.range.fileName}`
    )
  }

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
    throw new Error(`chunk ${chunk.range.fileName} has no samples for ${bodyId}`)
  }

  const firstSampleTime = getChunkBodySampleTime(chunk, manifestBody, 0)
  const lastSampleIndex = sampleCount - 1
  const lastSampleTime = getChunkBodySampleTime(chunk, manifestBody, lastSampleIndex)

  if (tdbSecondsFromJ2000 <= firstSampleTime) {
    return getChunkBodySampleAt(chunkBody, 0)
  }

  if (tdbSecondsFromJ2000 >= lastSampleTime) {
    return getChunkBodySampleAt(chunkBody, lastSampleIndex)
  }

  const [leftSampleIndex, rightSampleIndex] = getInterpolationBracketSampleIndices(
    chunk,
    manifestBody.sampleDays,
    sampleCount,
    tdbSecondsFromJ2000
  )
  const leftSampleTime = getChunkBodySampleTime(chunk, manifestBody, leftSampleIndex)
  const rightSampleTime = getChunkBodySampleTime(chunk, manifestBody, rightSampleIndex)
  const leftSample = getChunkBodySampleAt(chunkBody, leftSampleIndex)
  const rightSample = getChunkBodySampleAt(chunkBody, rightSampleIndex)

  if (tdbSecondsFromJ2000 === leftSampleTime) {
    return leftSample
  }

  if (tdbSecondsFromJ2000 === rightSampleTime) {
    return rightSample
  }

  return interpolateHermiteStateSamples(
    leftSample,
    leftSampleTime,
    rightSample,
    rightSampleTime,
    tdbSecondsFromJ2000
  )
}

export function interpolateHermiteStateSamples(
  left: WebEphemerisStateSample,
  leftTdbSecondsFromJ2000: number,
  right: WebEphemerisStateSample,
  rightTdbSecondsFromJ2000: number,
  targetTdbSecondsFromJ2000: number
): WebEphemerisInterpolatedState {
  const durationSeconds = rightTdbSecondsFromJ2000 - leftTdbSecondsFromJ2000

  if (durationSeconds <= 0) {
    throw new RangeError('Hermite interpolation requires a positive sample duration')
  }

  const elapsedSeconds = targetTdbSecondsFromJ2000 - leftTdbSecondsFromJ2000
  const u = elapsedSeconds / durationSeconds
  const h00 = 2 * u * u * u - 3 * u * u + 1
  const h10 = u * u * u - 2 * u * u + u
  const h01 = -2 * u * u * u + 3 * u * u
  const h11 = u * u * u - u * u
  const dh00 = 6 * u * u - 6 * u
  const dh10 = 3 * u * u - 4 * u + 1
  const dh01 = -6 * u * u + 6 * u
  const dh11 = 3 * u * u - 2 * u

  return {
    positionKm: [
      h00 * left.positionKm[0]
      + h10 * durationSeconds * left.velocityKmPerSecond[0]
      + h01 * right.positionKm[0]
      + h11 * durationSeconds * right.velocityKmPerSecond[0],
      h00 * left.positionKm[1]
      + h10 * durationSeconds * left.velocityKmPerSecond[1]
      + h01 * right.positionKm[1]
      + h11 * durationSeconds * right.velocityKmPerSecond[1],
      h00 * left.positionKm[2]
      + h10 * durationSeconds * left.velocityKmPerSecond[2]
      + h01 * right.positionKm[2]
      + h11 * durationSeconds * right.velocityKmPerSecond[2]
    ],
    velocityKmPerSecond: [
      (dh00 / durationSeconds) * left.positionKm[0]
      + dh10 * left.velocityKmPerSecond[0]
      + (dh01 / durationSeconds) * right.positionKm[0]
      + dh11 * right.velocityKmPerSecond[0],
      (dh00 / durationSeconds) * left.positionKm[1]
      + dh10 * left.velocityKmPerSecond[1]
      + (dh01 / durationSeconds) * right.positionKm[1]
      + dh11 * right.velocityKmPerSecond[1],
      (dh00 / durationSeconds) * left.positionKm[2]
      + dh10 * left.velocityKmPerSecond[2]
      + (dh01 / durationSeconds) * right.positionKm[2]
      + dh11 * right.velocityKmPerSecond[2]
    ]
  }
}

function getInterpolationBracketSampleIndices(
  chunk: WebEphemerisChunk,
  sampleDays: number,
  sampleCount: number,
  tdbSecondsFromJ2000: number
) {
  const lastSampleIndex = sampleCount - 1
  const penultimateSampleIndex = lastSampleIndex - 1

  if (penultimateSampleIndex <= 0) {
    return [0, lastSampleIndex] as const
  }

  const cadenceSeconds = sampleDays * secondsPerDay
  const penultimateSampleTime =
    chunk.range.startTdbSecondsFromJ2000 + penultimateSampleIndex * cadenceSeconds

  if (tdbSecondsFromJ2000 >= penultimateSampleTime) {
    return [penultimateSampleIndex, lastSampleIndex] as const
  }

  const leftSampleIndex = Math.floor(
    (tdbSecondsFromJ2000 - chunk.range.startTdbSecondsFromJ2000) / cadenceSeconds
  )

  return [leftSampleIndex, leftSampleIndex + 1] as const
}

function getChunkRangeIndex(
  manifest: WebEphemerisManifest,
  range: WebEphemerisChunkRange
) {
  const rangeIndex = manifest.chunks.findIndex(
    (candidate) =>
      candidate.fileName === range.fileName &&
      candidate.startTdbSecondsFromJ2000 === range.startTdbSecondsFromJ2000 &&
      candidate.endTdbSecondsFromJ2000 === range.endTdbSecondsFromJ2000
  )

  if (rangeIndex < 0) {
    throw new Error(`manifest does not contain chunk ${range.fileName}`)
  }

  return rangeIndex
}
