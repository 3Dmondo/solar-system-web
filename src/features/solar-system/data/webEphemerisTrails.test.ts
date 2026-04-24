import { describe, expect, it } from 'vitest'
import {
  createChunkBodyTrailSampler,
  sampleChunkBodyTrailAtTdbTime
} from './webEphemerisTrails'
import { type WebEphemerisChunk, type WebEphemerisManifest } from './webEphemeris'

const manifest: WebEphemerisManifest = {
  schemaVersion: 1,
  generatedAtUtc: '2026-04-21T00:00:00Z',
  sourceSpkPath: null,
  sourceLskPath: null,
  usesApproximateUtcConversion: true,
  approximationNote: null,
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
      fileName: 'chunk-0.json',
      startUtc: '2000-01-01T12:00:00Z',
      endUtc: '2000-01-03T12:00:00Z',
      startTdbSecondsFromJ2000: 0,
      endTdbSecondsFromJ2000: 172800
    }
  ]
}

const chunk: WebEphemerisChunk = {
  schemaVersion: 1,
  centerNaifBodyId: 0,
  range: manifest.chunks[0]!,
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

describe('webEphemerisTrails', () => {
  it('uses the loaded chunk start when the requested window reaches earlier than the active chunk', () => {
    expect(sampleChunkBodyTrailAtTdbTime(manifest, chunk, 'earth', 43200, 10)).toEqual({
      id: 'earth',
      positionsKm: [
        [0, 0, 0],
        [43200, 0, 0]
      ]
    })
  })

  it('interpolates the trail start and preserves interior chunk samples inside the requested window', () => {
    expect(sampleChunkBodyTrailAtTdbTime(manifest, chunk, 'earth', 129600, 1)).toEqual({
      id: 'earth',
      positionsKm: [
        [43200, 0, 0],
        [86400, 0, 0],
        [129600, 0, 0]
      ]
    })
  })

  it('reuses the stable interior trail segment while the moving endpoints continue to update', () => {
    const sampler = createChunkBodyTrailSampler(manifest, chunk, 'earth')
    const firstTrail = sampler.sampleAtTdbTime(129600, 1)
    const secondTrail = sampler.sampleAtTdbTime(129601, 1)

    expect(firstTrail.positionsKm[1]).toBe(secondTrail.positionsKm[1])
    expect(firstTrail.positionsKm[0]).not.toBe(secondTrail.positionsKm[0])
    expect(firstTrail.positionsKm.at(-1)).not.toBe(secondTrail.positionsKm.at(-1))
  })
})
