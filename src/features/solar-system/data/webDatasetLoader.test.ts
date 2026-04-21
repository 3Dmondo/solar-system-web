import { describe, expect, it, vi } from 'vitest'
import { createWebDatasetLoader } from './webDatasetLoader'

const manifestFixture = {
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

const bodyMetadataFixture = {
  SchemaVersion: 1,
  GeneratedAtUtc: '2026-04-20T07:16:19.2107705+00:00',
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
    DerivedPhysicalPropertiesNote: 'Derived physical properties note.'
  },
  Bodies: [
    {
      BodyId: 399,
      BodyName: 'Earth',
      Metadata: {
        RadiiKm: [6378.1366, 6378.1366, 6356.7519],
        MeanRadiusKm: 6371.008366666666,
        GravitationalParameterKm3PerSec2: 398600.43550702266,
        ShapeModel: {
          EquatorialRadiusKm: 6378.1366,
          PolarRadiusKm: 6356.7519,
          VolumeEquivalentRadiusKm: 6371.000385249621,
          ApproxVolumeKm3: 1083207113347.9102,
          Flattening: 0.0033528131084554717,
          IsTriAxial: false,
          IsApproximatelySpherical: false
        },
        DerivedPhysicalProperties: {
          ReferenceRadiusKm: 6371.000385249621,
          ApproximateMassKg: 5.972168399787583e24,
          ApproximateSurfaceGravityMps2: 9.8202491443786,
          ApproximateEscapeVelocityKmPerSec: 11.18613526487887,
          ApproximateBulkDensityKgPerM3: 5513.413202512279
        },
        PoleOrientation: {
          ReferenceEpoch: 'J2000',
          PoleRightAscensionDegreesAtReferenceEpoch: 0,
          PoleDeclinationDegreesAtReferenceEpoch: 90,
          NorthPoleUnitVectorJ2000: [0, 0, 1],
          AxialTiltDegreesRelativeToJ2000Ecliptic: 23.439291111000003
        },
        RotationModel: {
          PrimeMeridianRateDegreesPerDay: 360.9856235,
          SiderealRotationPeriodHours: 23.93447117430703,
          IsRetrograde: false
        }
      }
    }
  ]
}

describe('webDatasetLoader', () => {
  it('loads and caches the accepted SpiceNet manifest and physical metadata together', async () => {
    const fetchMock = vi.fn<typeof fetch>(async (url: string | URL | Request) => {
      const value = url.toString()

      if (value.endsWith('/manifest.json')) {
        return new Response(JSON.stringify(manifestFixture), { status: 200 })
      }

      if (value.endsWith('/body-metadata.json')) {
        return new Response(JSON.stringify(bodyMetadataFixture), { status: 200 })
      }

      return new Response('Not found', { status: 404, statusText: 'Not Found' })
    })
    const loader = createWebDatasetLoader(
      {
        manifestUrl: '/data/manifest.json',
        bodyMetadataUrl: '/data/body-metadata.json'
      },
      fetchMock
    )

    const [firstLoad, secondLoad] = await Promise.all([loader.load(), loader.load()])

    expect(firstLoad).toBe(secondLoad)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(firstLoad.manifest.bodies[0]).toMatchObject({
      bodyId: 'earth',
      sampleDays: 7
    })
    expect(firstLoad.bodyMetadata.bodies[0]).toMatchObject({
      id: 'earth',
      meanRadiusKm: 6371.008366666666
    })
  })

  it('clears the cache after a failed load so the next attempt can retry', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('boom', { status: 500, statusText: 'Server Error' }))
      .mockResolvedValueOnce(new Response(JSON.stringify(bodyMetadataFixture), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(manifestFixture), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(bodyMetadataFixture), { status: 200 }))
    const loader = createWebDatasetLoader(
      {
        manifestUrl: '/data/manifest.json',
        bodyMetadataUrl: '/data/body-metadata.json'
      },
      fetchMock
    )

    await expect(loader.load()).rejects.toThrowError(/manifest\.json/)
    const dataset = await loader.load()

    expect(dataset.manifest.schemaVersion).toBe(1)
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})
