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

export function sampleChunkBodyTrailAtTdbTime(
  manifest: WebEphemerisManifest,
  chunk: WebEphemerisChunk,
  bodyId: BodyId,
  targetTdbSecondsFromJ2000: number,
  trailWindowDays: number
): BodyEphemerisTrail {
  if (!Number.isFinite(trailWindowDays) || trailWindowDays < 0) {
    throw new Error('trailWindowDays must be a finite number greater than or equal to zero')
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
    return {
      id: bodyId,
      positionsKm: []
    }
  }

  const trailStartTdbSecondsFromJ2000 = Math.max(
    chunk.range.startTdbSecondsFromJ2000,
    targetTdbSecondsFromJ2000 - trailWindowDays * secondsPerDay
  )
  const trail = {
    id: bodyId,
    positionsKm: [] as Array<[number, number, number]>
  }
  let lastEmittedTime: number | undefined

  const appendPoint = (time: number, positionKm: [number, number, number]) => {
    if (lastEmittedTime === time) {
      return
    }

    trail.positionsKm.push(positionKm)
    lastEmittedTime = time
  }

  if (trailStartTdbSecondsFromJ2000 < targetTdbSecondsFromJ2000) {
    const firstSampleTime = getChunkBodySampleTime(chunk, manifestBody, 0)

    if (trailStartTdbSecondsFromJ2000 === firstSampleTime) {
      appendPoint(firstSampleTime, getChunkBodySampleAt(chunkBody, 0).positionKm)
    } else {
      appendPoint(
        trailStartTdbSecondsFromJ2000,
        interpolateChunkBodyAtTdbTime(
          manifest,
          chunk,
          bodyId,
          trailStartTdbSecondsFromJ2000
        ).positionKm
      )
    }
  }

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const sampleTime = getChunkBodySampleTime(chunk, manifestBody, sampleIndex)

    if (
      sampleTime <= trailStartTdbSecondsFromJ2000
      || sampleTime >= targetTdbSecondsFromJ2000
    ) {
      continue
    }

    appendPoint(sampleTime, getChunkBodySampleAt(chunkBody, sampleIndex).positionKm)
  }

  appendPoint(
    targetTdbSecondsFromJ2000,
    interpolateChunkBodyAtTdbTime(manifest, chunk, bodyId, targetTdbSecondsFromJ2000).positionKm
  )

  return trail
}
