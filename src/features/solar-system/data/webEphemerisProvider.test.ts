import { describe, expect, it, vi } from 'vitest'
import { createWebEphemerisProvider } from './webEphemerisProvider'
import { type WebDatasetLoader } from './webDatasetLoader'
import {
  approximateJ2000UtcIso,
  getApproximateTdbSecondsFromJ2000
} from './webEphemerisTimeline'
import { type WebBodyMetadataFile } from './webBodyMetadata'
import { type WebDataset } from './webDatasetLoader'
import { type WebEphemerisManifest } from './webEphemeris'

const manifest: WebEphemerisManifest = {
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
      fileName: 'chunk-0.json',
      startUtc: '2000-01-01T12:00:00Z',
      endUtc: '2000-01-03T12:00:00Z',
      startTdbSecondsFromJ2000: 0,
      endTdbSecondsFromJ2000: 172800
    },
    {
      fileName: 'chunk-1.json',
      startUtc: '2000-01-03T12:00:00Z',
      endUtc: '2000-01-05T12:00:00Z',
      startTdbSecondsFromJ2000: 172800,
      endTdbSecondsFromJ2000: 345600
    },
    {
      fileName: 'chunk-2.json',
      startUtc: '2000-01-05T12:00:00Z',
      endUtc: '2000-01-07T12:00:00Z',
      startTdbSecondsFromJ2000: 345600,
      endTdbSecondsFromJ2000: 518400
    }
  ]
}

const bodyMetadata = {
  schemaVersion: 1,
  generatedAtUtc: '2026-04-21T00:00:00Z',
  generatedAtUtcSource: 'current_utc',
  layout: {
    referenceEpoch: 'J2000',
    poleVectorFrame: 'J2000',
    axialTiltReferencePlane: 'J2000 ecliptic',
    radiiUnit: 'km',
    meanRadiusUnit: 'km',
    shapeRadiusUnit: 'km',
    shapeVolumeUnit: 'km3',
    gravitationalParameterUnit: 'km3/s2',
    rotationPeriodUnit: 'hours',
    surfaceGravityUnit: 'm/s2',
    escapeVelocityUnit: 'km/s',
    bulkDensityUnit: 'kg/m3',
    derivedPhysicalPropertiesNote: 'Derived physical properties note.'
  },
  bodies: []
} satisfies WebBodyMetadataFile

const dataset = {
  manifest,
  bodyMetadata
} satisfies WebDataset

const chunkByFileName = {
  'chunk-0.json': {
    SchemaVersion: 1,
    CenterBodyId: 0,
    StartTdbSecondsFromJ2000: 0,
    EndTdbSecondsFromJ2000: 172800,
    Bodies: [
      {
        BodyId: 399,
        Samples: [
          0, 0, 0, 1, 0, 0,
          86400, 0, 0, 1, 0, 0,
          172800, 0, 0, 1, 0, 0
        ]
      }
    ]
  },
  'chunk-1.json': {
    SchemaVersion: 1,
    CenterBodyId: 0,
    StartTdbSecondsFromJ2000: 172800,
    EndTdbSecondsFromJ2000: 345600,
    Bodies: [
      {
        BodyId: 399,
        Samples: [
          172800, 0, 0, 1, 0, 0,
          259200, 0, 0, 1, 0, 0,
          345600, 0, 0, 1, 0, 0
        ]
      }
    ]
  },
  'chunk-2.json': {
    SchemaVersion: 1,
    CenterBodyId: 0,
    StartTdbSecondsFromJ2000: 345600,
    EndTdbSecondsFromJ2000: 518400,
    Bodies: [
      {
        BodyId: 399,
        Samples: [
          345600, 0, 0, 1, 0, 0,
          432000, 0, 0, 1, 0, 0,
          518400, 0, 0, 1, 0, 0
        ]
      }
    ]
  }
} as const

describe('webEphemerisProvider', () => {
  it('loads an interpolated ephemeris snapshot in kilometers without changing presentation metadata', async () => {
    const datasetLoader = createDatasetLoaderStub(dataset)
    const fetchMock = createChunkFetchMock()
    const provider = createWebEphemerisProvider({
      chunkBaseUrl: '/ephemeris',
      datasetLoader,
      fetchImpl: fetchMock
    })
    const requestUtc = new Date(Date.parse(approximateJ2000UtcIso) + 216000 * 1000)
    const snapshot = await provider.loadSnapshotAtUtc(requestUtc)

    expect(provider.getBodyMetadata().find((body) => body.id === 'earth')).toMatchObject({
      id: 'earth',
      radius: 0.72
    })
    expect(snapshot.capturedAt).toBe(requestUtc.toISOString())
    expect(snapshot.approximateTdbSecondsFromJ2000).toBeCloseTo(
      getApproximateTdbSecondsFromJ2000(requestUtc),
      9
    )
    expect(snapshot.chunkFileName).toBe('chunk-1.json')
    expect(snapshot.bodies).toEqual([
      {
        id: 'earth',
        positionKm: [216000, 0, 0],
        velocityKmPerSecond: [1, 0, 0]
      }
    ])
    expect(snapshot.trails).toEqual([
      {
        id: 'earth',
        positionsKm: [
          [172800, 0, 0],
          [216000, 0, 0]
        ]
      }
    ])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('prefetches adjacent chunks and evicts old cache entries when the limit is exceeded', async () => {
    const datasetLoader = createDatasetLoaderStub(dataset)
    const fetchMock = createChunkFetchMock()
    const provider = createWebEphemerisProvider({
      chunkBaseUrl: '/ephemeris',
      datasetLoader,
      fetchImpl: fetchMock,
      maxCachedChunks: 2
    })

    await provider.prefetchAroundUtc(new Date(Date.parse(approximateJ2000UtcIso) + 216000 * 1000))
    expect(fetchMock).toHaveBeenCalledTimes(3)

    await provider.loadSnapshotAtUtc(new Date(Date.parse(approximateJ2000UtcIso) + 43200 * 1000))
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('clears chunk and dataset caches together', async () => {
    const datasetLoader = createDatasetLoaderStub(dataset)
    const fetchMock = createChunkFetchMock()
    const provider = createWebEphemerisProvider({
      chunkBaseUrl: '/ephemeris',
      datasetLoader,
      fetchImpl: fetchMock
    })

    await provider.loadSnapshotAtUtc(new Date(Date.parse(approximateJ2000UtcIso) + 43200 * 1000))
    provider.clearCache()
    await provider.loadSnapshotAtUtc(new Date(Date.parse(approximateJ2000UtcIso) + 43200 * 1000))

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(datasetLoader.clearCache).toHaveBeenCalledTimes(1)
  })
})

function createDatasetLoaderStub(dataset: WebDataset): WebDatasetLoader & { clearCache: ReturnType<typeof vi.fn> } {
  return {
    load: vi.fn(async () => dataset),
    clearCache: vi.fn()
  }
}

function createChunkFetchMock() {
  return vi.fn<typeof fetch>(async (url: string | URL | Request) => {
    const fileName = url.toString().split('/').at(-1)

    if (!fileName || !(fileName in chunkByFileName)) {
      return new Response('Not found', { status: 404, statusText: 'Not Found' })
    }

    return new Response(JSON.stringify(chunkByFileName[fileName as keyof typeof chunkByFileName]), {
      status: 200
    })
  })
}
