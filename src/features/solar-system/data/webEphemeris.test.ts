import { describe, expect, it } from 'vitest'
import {
  getBodyIdForNaifBodyId,
  getChunkBodyById,
  getChunkBodySampleAt,
  getChunkBodySampleTime,
  getManifestBodyById,
  getNaifBodyId,
  parseWebEphemerisChunk,
  parseWebEphemerisManifest
} from './webEphemeris'

const rawManifestFixture = {
  SchemaVersion: 1,
  GeneratedAtUtc: '2026-04-19T18:05:53.9743992+00:00',
  SpkPath: 'cache/de440s.bsp',
  LskPath: null,
  UsesApproximateUtcConversion: true,
  ApproximationNote: 'Approximate UTC to TDB mapping for the current benchmark.',
  StartYear: 2000,
  EndYear: 2001,
  ChunkYears: 1,
  DefaultSampleDays: 30,
  CenterBodyId: 0,
  RuntimeLayout: {
    ChunkBoundaryTimeEncoding: 'approximate_tdb_seconds_from_j2000',
    SampleTimeEncoding: 'chunk_start_plus_body_cadence_days_with_terminal_chunk_end_sample',
    SampleValueLayout: 'xyz_vxvyvz',
    SampleComponentsPerSample: 6,
    PositionUnits: 'km',
    VelocityUnits: 'km/s',
    InterpolationHint: 'cubic_hermite_position_velocity'
  },
  Bodies: [
    {
      BodyId: 10,
      BodyName: 'Sun',
      SourceBodyId: 10,
      SourceBodyName: 'Sun',
      SampleDays: 30
    },
    {
      BodyId: 301,
      BodyName: 'Moon',
      SourceBodyId: 301,
      SourceBodyName: 'Moon',
      SampleDays: 3
    },
    {
      BodyId: 399,
      BodyName: 'Earth',
      SourceBodyId: 399,
      SourceBodyName: 'Earth',
      SampleDays: 7
    }
  ],
  Chunks: [
    {
      FileName: 'chunk-2000-2001.json',
      StartUtc: '2000-01-01T12:00:00+00:00',
      EndUtc: '2000-01-11T12:00:00+00:00',
      StartTdbSecondsFromJ2000: 0,
      EndTdbSecondsFromJ2000: 864000
    }
  ]
}

const rawChunkFixture = {
  SchemaVersion: 1,
  CenterBodyId: 0,
  StartTdbSecondsFromJ2000: 0,
  EndTdbSecondsFromJ2000: 864000,
  Bodies: [
    {
      BodyId: 399,
      Samples: [
        100, 101, 102, 1, 2, 3,
        110, 111, 112, 4, 5, 6,
        120, 121, 122, 7, 8, 9
      ]
    },
    {
      BodyId: 301,
      Samples: [
        200, 201, 202, 10, 11, 12,
        210, 211, 212, 13, 14, 15,
        220, 221, 222, 16, 17, 18,
        230, 231, 232, 19, 20, 21,
        240, 241, 242, 22, 23, 24
      ]
    },
    {
      BodyId: 10,
      Samples: [0, 0, 0, 0, 0, 0, 5, 5, 5, 0.1, 0.2, 0.3]
    }
  ]
}

describe('webEphemeris', () => {
  it('parses the accepted manifest layout and maps app body ids from NAIF ids', () => {
    const manifest = parseWebEphemerisManifest(rawManifestFixture)

    expect(manifest.schemaVersion).toBe(1)
    expect(manifest.centerNaifBodyId).toBe(0)
    expect(getBodyIdForNaifBodyId(399)).toBe('earth')
    expect(getBodyIdForNaifBodyId(301)).toBe('moon')
    expect(getBodyIdForNaifBodyId(1)).toBeUndefined()
    expect(getNaifBodyId('saturn')).toBe(699)
    expect(getManifestBodyById(manifest, 'earth')).toMatchObject({
      bodyId: 'earth',
      bodyName: 'Earth',
      naifBodyId: 399,
      sampleDays: 7
    })
  })

  it('reconstructs terminal sample times and decodes flattened xyz_vxvyvz arrays', () => {
    const manifest = parseWebEphemerisManifest(rawManifestFixture)
    const chunk = parseWebEphemerisChunk(rawChunkFixture, manifest)
    const earthManifest = getManifestBodyById(manifest, 'earth')
    const earthChunkBody = getChunkBodyById(chunk, 'earth')
    const moonManifest = getManifestBodyById(manifest, 'moon')

    expect(earthManifest).toBeDefined()
    expect(earthChunkBody).toBeDefined()
    expect(moonManifest).toBeDefined()

    expect(getChunkBodySampleTime(chunk, earthManifest!, 0)).toBe(0)
    expect(getChunkBodySampleTime(chunk, earthManifest!, 1)).toBe(604800)
    expect(getChunkBodySampleTime(chunk, earthManifest!, 2)).toBe(864000)
    expect(getChunkBodySampleTime(chunk, moonManifest!, 4)).toBe(864000)
    expect(getChunkBodySampleAt(earthChunkBody!, 1)).toEqual({
      positionKm: [110, 111, 112],
      velocityKmPerSecond: [4, 5, 6]
    })
  })

  it('rejects unsupported runtime layouts', () => {
    expect(() =>
      parseWebEphemerisManifest({
        ...rawManifestFixture,
        RuntimeLayout: {
          ...rawManifestFixture.RuntimeLayout,
          SampleValueLayout: 'xyz'
        }
      })
    ).toThrowError(/SampleValueLayout/)
  })

  it('rejects chunks whose sample counts do not match the manifest cadence', () => {
    const manifest = parseWebEphemerisManifest(rawManifestFixture)

    expect(() =>
      parseWebEphemerisChunk(
        {
          ...rawChunkFixture,
          Bodies: rawChunkFixture.Bodies.map((body) =>
            body.BodyId === 301
              ? {
                  ...body,
                  Samples: body.Samples.slice(0, body.Samples.length - 6)
                }
              : body
          )
        },
        manifest
      )
    ).toThrowError(/Moon/)
  })
})
