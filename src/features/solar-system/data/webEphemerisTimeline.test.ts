import { describe, expect, it } from 'vitest'
import {
  approximateJ2000UtcIso,
  getApproximateTdbSecondsFromJ2000,
  getChunkRangeForTdbTime,
  getNextChunkRange,
  getPreviousChunkRange,
  interpolateChunkBodyAtTdbTime
} from './webEphemerisTimeline'
import { type WebEphemerisChunk, type WebEphemerisManifest } from './webEphemeris'

const singleBodyManifest: WebEphemerisManifest = {
  schemaVersion: 1,
  generatedAtUtc: '2026-04-21T00:00:00Z',
  sourceSpkPath: null,
  sourceLskPath: null,
  usesApproximateUtcConversion: true,
  approximationNote: 'Approximate UTC mapping.',
  startYear: 2000,
  endYear: 2000,
  chunkYears: 1,
  defaultSampleDays: 1,
  centerNaifBodyId: 0,
  runtimeLayout: {
    chunkBoundaryTimeEncoding: 'approximate_tdb_seconds_from_j2000',
    sampleTimeEncoding: 'chunk_start_plus_body_cadence_days_with_terminal_chunk_end_sample',
    sampleValueLayout: 'xyz_vxvyvz',
    sampleComponentsPerSample: 6,
    positionUnits: 'km',
    velocityUnits: 'km/s',
    interpolationHint: 'cubic_hermite_position_velocity'
  },
  bodies: [
    {
      bodyId: 'earth',
      naifBodyId: 399,
      bodyName: 'Earth',
      sourceNaifBodyId: 399,
      sourceBodyName: 'Earth',
      sampleDays: 1
    }
  ],
  chunks: [
    {
      fileName: 'chunk-a.json',
      startUtc: '2000-01-01T12:00:00Z',
      endUtc: '2000-01-03T12:00:00Z',
      startTdbSecondsFromJ2000: 0,
      endTdbSecondsFromJ2000: 172800
    },
    {
      fileName: 'chunk-b.json',
      startUtc: '2000-01-03T12:00:00Z',
      endUtc: '2000-01-05T12:00:00Z',
      startTdbSecondsFromJ2000: 172800,
      endTdbSecondsFromJ2000: 345600
    }
  ]
}

const linearChunk: WebEphemerisChunk = {
  schemaVersion: 1,
  centerNaifBodyId: 0,
  range: singleBodyManifest.chunks[0]!,
  bodies: [
    {
      bodyId: 'earth',
      naifBodyId: 399,
      samples: [
        0, 0, 0, 1, 0, 0,
        86400, 0, 0, 1, 0, 0,
        172800, 0, 0, 1, 0, 0
      ]
    }
  ]
}

const terminalIntervalChunk: WebEphemerisChunk = {
  schemaVersion: 1,
  centerNaifBodyId: 0,
  range: {
    fileName: 'chunk-terminal.json',
    startUtc: '2000-01-01T12:00:00Z',
    endUtc: '2000-01-03T05:40:00Z',
    startTdbSecondsFromJ2000: 0,
    endTdbSecondsFromJ2000: 150000
  },
  bodies: [
    {
      bodyId: 'earth',
      naifBodyId: 399,
      samples: [
        0, 0, 0, 2, 0, 0,
        172800, 0, 0, 2, 0, 0,
        300000, 0, 0, 2, 0, 0
      ]
    }
  ]
}

const terminalIntervalManifest: WebEphemerisManifest = {
  ...singleBodyManifest,
  chunks: [terminalIntervalChunk.range]
}

describe('webEphemerisTimeline', () => {
  it('matches the accepted approximate J2000 UTC anchor and optional whole-second rounding', () => {
    expect(approximateJ2000UtcIso).toBe('2000-01-01T11:58:55.816Z')
    expect(getApproximateTdbSecondsFromJ2000(approximateJ2000UtcIso)).toBe(0)
    expect(getApproximateTdbSecondsFromJ2000('2000-01-01T12:00:00.000Z')).toBeCloseTo(64.184, 6)
    expect(
      getApproximateTdbSecondsFromJ2000('2000-01-01T12:00:00.000Z', {
        roundToWholeSecond: true
      })
    ).toBe(64)
  })

  it('selects chunk ranges with shared boundaries landing in the later chunk', () => {
    expect(getChunkRangeForTdbTime(singleBodyManifest, -1)).toBeUndefined()
    expect(getChunkRangeForTdbTime(singleBodyManifest, 0)?.fileName).toBe('chunk-a.json')
    expect(getChunkRangeForTdbTime(singleBodyManifest, 172799)?.fileName).toBe('chunk-a.json')
    expect(getChunkRangeForTdbTime(singleBodyManifest, 172800)?.fileName).toBe('chunk-b.json')
    expect(getChunkRangeForTdbTime(singleBodyManifest, 345600)?.fileName).toBe('chunk-b.json')
    expect(getPreviousChunkRange(singleBodyManifest, singleBodyManifest.chunks[1]!)?.fileName).toBe(
      'chunk-a.json'
    )
    expect(getNextChunkRange(singleBodyManifest, singleBodyManifest.chunks[0]!)?.fileName).toBe(
      'chunk-b.json'
    )
  })

  it('reconstructs linear motion exactly through Hermite interpolation', () => {
    expect(interpolateChunkBodyAtTdbTime(singleBodyManifest, linearChunk, 'earth', 43200)).toEqual({
      positionKm: [43200, 0, 0],
      velocityKmPerSecond: [1, 0, 0]
    })
    expect(interpolateChunkBodyAtTdbTime(singleBodyManifest, linearChunk, 'earth', 86400)).toEqual({
      positionKm: [86400, 0, 0],
      velocityKmPerSecond: [1, 0, 0]
    })
  })

  it('uses the terminal chunk-end sample when the last interval is shorter than the cadence', () => {
    const shortenedIntervalMidpoint = interpolateChunkBodyAtTdbTime(
      terminalIntervalManifest,
      terminalIntervalChunk,
      'earth',
      100000
    )
    const terminalSample = interpolateChunkBodyAtTdbTime(
      terminalIntervalManifest,
      terminalIntervalChunk,
      'earth',
      150000
    )

    expect(shortenedIntervalMidpoint.positionKm[0]).toBeCloseTo(200000, 9)
    expect(shortenedIntervalMidpoint.velocityKmPerSecond[0]).toBeCloseTo(2, 12)
    expect(terminalSample).toEqual({
      positionKm: [300000, 0, 0],
      velocityKmPerSecond: [2, 0, 0]
    })
  })
})
