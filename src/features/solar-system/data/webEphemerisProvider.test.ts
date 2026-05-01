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
    },
    {
      fileName: 'chunk-3.json',
      startUtc: '2000-01-07T12:00:00Z',
      endUtc: '2000-01-09T12:00:00Z',
      startTdbSecondsFromJ2000: 518400,
      endTdbSecondsFromJ2000: 691200
    },
    {
      fileName: 'chunk-4.json',
      startUtc: '2000-01-09T12:00:00Z',
      endUtc: '2000-01-11T12:00:00Z',
      startTdbSecondsFromJ2000: 691200,
      endTdbSecondsFromJ2000: 864000
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

const satelliteManifest: WebEphemerisManifest = {
  ...manifest,
  bodies: [
    ...manifest.bodies,
    {
      bodyId: 'moon',
      naifBodyId: 301,
      bodyName: 'Moon',
      sourceNaifBodyId: 301,
      sourceBodyName: 'Moon',
      sampleDays: 1
    }
  ],
  chunks: [manifest.chunks[0]!]
}

const satelliteDataset = {
  manifest: satelliteManifest,
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
  },
  'chunk-3.json': {
    SchemaVersion: 1,
    CenterBodyId: 0,
    StartTdbSecondsFromJ2000: 518400,
    EndTdbSecondsFromJ2000: 691200,
    Bodies: [
      {
        BodyId: 399,
        Samples: [
          518400, 0, 0, 1, 0, 0,
          604800, 0, 0, 1, 0, 0,
          691200, 0, 0, 1, 0, 0
        ]
      }
    ]
  },
  'chunk-4.json': {
    SchemaVersion: 1,
    CenterBodyId: 0,
    StartTdbSecondsFromJ2000: 691200,
    EndTdbSecondsFromJ2000: 864000,
    Bodies: [
      {
        BodyId: 399,
        Samples: [
          691200, 0, 0, 1, 0, 0,
          777600, 0, 0, 1, 0, 0,
          864000, 0, 0, 1, 0, 0
        ]
      }
    ]
  }
} as const

const satelliteChunkByFileName = {
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
      },
      {
        BodyId: 301,
        Samples: [
          10, 0, 0, 1, 0, 0,
          86410, 0, 0, 1, 0, 0,
          172810, 0, 0, 1, 0, 0
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

  it('extends trails with ready previous chunks without refetching during snapshot load', async () => {
    const datasetLoader = createDatasetLoaderStub(dataset)
    const fetchMock = createChunkFetchMock()
    const provider = createWebEphemerisProvider({
      chunkBaseUrl: '/ephemeris',
      datasetLoader,
      fetchImpl: fetchMock
    })
    const requestUtc = new Date(Date.parse(approximateJ2000UtcIso) + 216000 * 1000)

    await provider.prefetchAroundUtc(requestUtc)
    const snapshot = await provider.loadSnapshotAtUtc(requestUtc)

    expect(snapshot.trails).toEqual([
      {
        id: 'earth',
        positionsKm: [
          [0, 0, 0],
          [43200, 0, 0],
          [86400, 0, 0],
          [129600, 0, 0],
          [172800, 0, 0],
          [216000, 0, 0]
        ]
      }
    ])
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('samples satellite trails relative to their parent body by default', async () => {
    const datasetLoader = createDatasetLoaderStub(satelliteDataset)
    const fetchMock = createChunkFetchMock(satelliteChunkByFileName)
    const provider = createWebEphemerisProvider({
      chunkBaseUrl: '/ephemeris',
      datasetLoader,
      fetchImpl: fetchMock
    })
    const requestUtc = new Date(Date.parse(approximateJ2000UtcIso) + 86400 * 1000)
    const snapshot = await provider.loadSnapshotAtUtc(requestUtc)
    const moonTrail = snapshot.trails.find((trail) => trail.id === 'moon')

    expect(moonTrail?.positionsKm.length).toBeGreaterThan(1)
    moonTrail?.positionsKm.forEach((positionKm) => {
      expect(positionKm[0]).toBeCloseTo(10, 9)
      expect(positionKm[1]).toBeCloseTo(0, 9)
      expect(positionKm[2]).toBeCloseTo(0, 9)
    })
  })

  it('prefetches the loaded catalog trail window instead of a fixed previous-chunk count', async () => {
    const datasetLoader = createDatasetLoaderStub(dataset)
    const fetchMock = createChunkFetchMock()
    const provider = createWebEphemerisProvider({
      chunkBaseUrl: '/ephemeris',
      datasetLoader,
      fetchImpl: fetchMock
    })

    await provider.prefetchAroundUtc(new Date(Date.parse(approximateJ2000UtcIso) + 604800 * 1000))

    expect(fetchMock).toHaveBeenCalledTimes(5)
    expect(fetchMock).toHaveBeenCalledWith('/ephemeris/chunk-0.json')
    expect(fetchMock).toHaveBeenCalledWith('/ephemeris/chunk-1.json')
    expect(fetchMock).toHaveBeenCalledWith('/ephemeris/chunk-2.json')
    expect(fetchMock).toHaveBeenCalledWith('/ephemeris/chunk-3.json')
    expect(fetchMock).toHaveBeenCalledWith('/ephemeris/chunk-4.json')
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

function createChunkFetchMock(chunks: Record<string, unknown> = chunkByFileName) {
  return vi.fn<typeof fetch>(async (url: string | URL | Request) => {
    const fileName = url.toString().split('/').at(-1)

    if (!fileName || !(fileName in chunks)) {
      return new Response('Not found', { status: 404, statusText: 'Not Found' })
    }

    return new Response(JSON.stringify(chunks[fileName as keyof typeof chunks]), {
      status: 200
    })
  })
}
