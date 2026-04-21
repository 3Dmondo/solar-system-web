import { describe, expect, it, vi } from 'vitest'
import {
  createConfiguredWebBodyCatalogSource,
  getConfiguredSceneUnitsPerKilometer,
  getConfiguredWebEphemerisDataBaseUrl
} from './webBodyCatalogRuntime'
import { type BodyMetadata } from '../domain/body'

const baseMetadata: BodyMetadata[] = [
  {
    id: 'earth',
    displayName: 'Earth',
    color: '#3a7bd5',
    material: 'earth',
    radius: 0.72,
    focusOffset: [0, 0.25, 3.2],
    surfaceRotationSpeed: 0.01
  }
]

const manifestFixture = {
  SchemaVersion: 1,
  GeneratedAtUtc: '2026-04-21T00:00:00Z',
  SpkPath: null,
  LskPath: null,
  UsesApproximateUtcConversion: true,
  ApproximationNote: 'Approximate UTC mapping.',
  StartYear: 2000,
  EndYear: 2000,
  ChunkYears: 1,
  DefaultSampleDays: 1,
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
      BodyId: 399,
      BodyName: 'Earth',
      SourceBodyId: 399,
      SourceBodyName: 'Earth',
      SampleDays: 1
    }
  ],
  Chunks: [
    {
      FileName: 'chunk-0.json',
      StartUtc: '2000-01-01T12:00:00Z',
      EndUtc: '2000-01-03T12:00:00Z',
      StartTdbSecondsFromJ2000: 0,
      EndTdbSecondsFromJ2000: 172800
    }
  ]
}

const bodyMetadataFixture = {
  SchemaVersion: 1,
  GeneratedAtUtc: '2026-04-21T00:00:00Z',
  GeneratedAtUtcSource: 'current_utc',
  MetadataLayout: {
    ReferenceEpoch: 'J2000',
    PoleVectorFrame: 'J2000',
    AxialTiltReferencePlane: 'J2000 ecliptic',
    RadiiUnit: 'km',
    MeanRadiusUnit: 'km',
    ShapeRadiusUnit: 'km',
    ShapeVolumeUnit: 'km3',
    GravitationalParameterUnit: 'km3/s2',
    RotationPeriodUnit: 'hours',
    SurfaceGravityUnit: 'm/s2',
    EscapeVelocityUnit: 'km/s',
    BulkDensityUnit: 'kg/m3',
    DerivedPhysicalPropertiesNote: 'Derived note.'
  },
  Bodies: [
    {
      BodyId: 399,
      BodyName: 'Earth',
      Metadata: {
        RadiiKm: [6378.1, 6378.1, 6356.8],
        MeanRadiusKm: 6371.0084,
        GravitationalParameterKm3PerSec2: 398600.4,
        ShapeModel: {
          EquatorialRadiusKm: 6378.1,
          PolarRadiusKm: 6356.8,
          VolumeEquivalentRadiusKm: 6371.0084,
          ApproxVolumeKm3: 1,
          Flattening: 0.0033528,
          IsTriAxial: false,
          IsApproximatelySpherical: true
        },
        DerivedPhysicalProperties: {
          ReferenceRadiusKm: 6371.0084,
          ApproximateMassKg: 1,
          ApproximateSurfaceGravityMps2: 1,
          ApproximateEscapeVelocityKmPerSec: 1,
          ApproximateBulkDensityKgPerM3: 1
        },
        PoleOrientation: {
          ReferenceEpoch: 'J2000',
          PoleRightAscensionDegreesAtReferenceEpoch: 0,
          PoleDeclinationDegreesAtReferenceEpoch: 0,
          NorthPoleUnitVectorJ2000: [0, 0, 1],
          AxialTiltDegreesRelativeToJ2000Ecliptic: 23.4
        },
        RotationModel: {
          PrimeMeridianRateDegreesPerDay: 360,
          SiderealRotationPeriodHours: 24,
          IsRetrograde: false
        }
      }
    }
  ]
}

const chunkFixture = {
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
}

describe('webBodyCatalogRuntime', () => {
  it('returns undefined when the required runtime config is missing or invalid', () => {
    expect(getConfiguredWebEphemerisDataBaseUrl({})).toBeUndefined()
    expect(getConfiguredSceneUnitsPerKilometer({})).toBeUndefined()
    expect(
      getConfiguredSceneUnitsPerKilometer({
        VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER: 'nope'
      })
    ).toBeUndefined()
    expect(
      createConfiguredWebBodyCatalogSource({
        VITE_WEB_EPHEMERIS_DATA_BASE_URL: 'ephemeris/de440s'
      })
    ).toBeUndefined()
  })

  it('creates a working real catalog source when the runtime config is present', async () => {
    const earthBase = baseMetadata.find((body) => body.id === 'earth')
    const fetchMock = vi.fn<typeof fetch>(async (url: string | URL | Request) => {
      const value = url.toString()

      if (value.endsWith('/manifest.json')) {
        return new Response(JSON.stringify(manifestFixture), { status: 200 })
      }

      if (value.endsWith('/body-metadata.json')) {
        return new Response(JSON.stringify(bodyMetadataFixture), { status: 200 })
      }

      if (value.endsWith('/chunk-0.json')) {
        return new Response(JSON.stringify(chunkFixture), { status: 200 })
      }

      return new Response('Not found', { status: 404, statusText: 'Not Found' })
    })
    const source = createConfiguredWebBodyCatalogSource(
      {
        VITE_WEB_EPHEMERIS_DATA_BASE_URL: 'ephemeris/de440s',
        VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER: '0.001'
      },
      {
        fetchImpl: fetchMock,
        presentationMetadata: baseMetadata
      }
    )

    expect(source).toBeDefined()

    const catalog = await source?.loadBodyCatalogAtUtc('2000-01-02T12:00:00Z')
    const earth = catalog?.bodies.find((body) => body.id === 'earth')

    expect(earth).toMatchObject({
      id: 'earth',
      displayName: 'Earth',
      color: '#3a7bd5',
      material: 'earth',
      radius: 6.3710084,
      surfaceRotationSpeed: 0.01
    })
    expect(
      Math.hypot(...(earth?.focusOffset ?? [0, 0, 0])) / (earth?.radius ?? 1)
    ).toBeCloseTo(
      Math.hypot(...(earthBase?.focusOffset ?? [0, 0, 0])) / (earthBase?.radius ?? 1),
      9
    )
    expect(earth?.position[0]).toBeCloseTo(86.464184, 6)
    expect(earth?.position[1]).toBeCloseTo(0, 9)
    expect(earth?.position[2]).toBeCloseTo(0, 9)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
