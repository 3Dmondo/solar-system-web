import { describe, expect, it, vi } from 'vitest'
import { createWebBodyCatalogSource } from './webBodyCatalogSource'
import { createPhysicalSceneScale } from './ephemerisSceneMapping'
import {
  type BodyEphemerisProvider,
  type BodyEphemerisSnapshot,
  type BodyMetadata
} from '../domain/body'
import { type WebDataset, type WebDatasetLoader } from './webDatasetLoader'

const baseMetadata: BodyMetadata[] = [
  {
    id: 'earth',
    displayName: 'Earth',
    color: '#3a7bd5',
    material: 'earth',
    radius: 0.72,
    focusOffset: [0, 0.25, 3.2],
    surfaceRotationSpeed: 0.01
  },
  {
    id: 'moon',
    displayName: 'Moon',
    color: '#b0b4be',
    material: 'moon',
    radius: 0.22,
    focusOffset: [0, 0.12, 1.7],
    surfaceRotationSpeed: 0.018
  }
]

const dataset = {
  manifest: {
    schemaVersion: 1,
    generatedAtUtc: '2026-04-21T00:00:00Z',
    sourceSpkPath: null,
    sourceLskPath: null,
    usesApproximateUtcConversion: true,
    approximationNote: null,
    startYear: 2000,
    endYear: 2000,
    chunkYears: 25,
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
    bodies: [],
    chunks: []
  },
  bodyMetadata: {
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
      derivedPhysicalPropertiesNote: 'Derived note.'
    },
    bodies: [
      {
        id: 'earth',
        naifBodyId: 399,
        radiiKm: [6378.1, 6378.1, 6356.8],
        meanRadiusKm: 6371.0084,
        gravitationalParameterKm3PerSec2: 398600.4,
        shape: {
          equatorialRadiusKm: 6378.1,
          polarRadiusKm: 6356.8,
          volumeEquivalentRadiusKm: 6371.0084,
          flattening: 0.0033528,
          approximateVolumeKm3: 1,
          isTriAxial: false,
          isApproximatelySpherical: true
        },
        physicalProperties: {
          referenceRadiusKm: 6371.0084,
          approximateMassKg: 1,
          approximateSurfaceGravityMps2: 1,
          approximateEscapeVelocityKmPerSec: 1,
          approximateBulkDensityKgPerM3: 1
        },
        poleOrientation: {
          referenceEpoch: 'J2000',
          axialTiltDegreesRelativeToJ2000Ecliptic: 23.4,
          poleRightAscensionDegreesAtReferenceEpoch: 0,
          poleDeclinationDegreesAtReferenceEpoch: 0,
          northPoleUnitVectorJ2000: [0, 0, 1]
        },
        rotationModel: {
          siderealRotationPeriodHours: 24,
          primeMeridianRateDegreesPerDay: 360,
          isRetrograde: false
        }
      },
      {
        id: 'moon',
        naifBodyId: 301,
        radiiKm: [1738.1, 1738.1, 1736],
        meanRadiusKm: 1737.4,
        gravitationalParameterKm3PerSec2: 4902.8,
        shape: {
          equatorialRadiusKm: 1738.1,
          polarRadiusKm: 1736,
          volumeEquivalentRadiusKm: 1737.4,
          flattening: 0.0012,
          approximateVolumeKm3: 1,
          isTriAxial: false,
          isApproximatelySpherical: true
        },
        physicalProperties: {
          referenceRadiusKm: 1737.4,
          approximateMassKg: 1,
          approximateSurfaceGravityMps2: 1,
          approximateEscapeVelocityKmPerSec: 1,
          approximateBulkDensityKgPerM3: 1
        },
        poleOrientation: {
          referenceEpoch: 'J2000',
          axialTiltDegreesRelativeToJ2000Ecliptic: 6.7,
          poleRightAscensionDegreesAtReferenceEpoch: 0,
          poleDeclinationDegreesAtReferenceEpoch: 0,
          northPoleUnitVectorJ2000: [0, 0, 1]
        },
        rotationModel: {
          siderealRotationPeriodHours: 655.7,
          primeMeridianRateDegreesPerDay: 13.176,
          isRetrograde: false
        }
      }
    ]
  }
} satisfies WebDataset

describe('webBodyCatalogSource', () => {
  it('loads a resolved catalog with physically scaled metadata and positions', async () => {
    const earthBase = baseMetadata.find((body) => body.id === 'earth')
    const moonBase = baseMetadata.find((body) => body.id === 'moon')
    const datasetLoader = createDatasetLoaderStub(dataset)
    const ephemerisProvider = createEphemerisProviderStub()
    const source = createWebBodyCatalogSource({
      ephemerisProvider,
      datasetLoader,
      scale: createPhysicalSceneScale(0.001)
    })

    const catalog = await source.loadBodyCatalogAtUtc('2000-01-01T12:00:00Z')
    const earth = catalog.bodies.find((body) => body.id === 'earth')
    const moon = catalog.bodies.find((body) => body.id === 'moon')

    expect(datasetLoader.load).toHaveBeenCalledTimes(1)
    expect(ephemerisProvider.loadSnapshotAtUtc).toHaveBeenCalledWith('2000-01-01T12:00:00Z')
    expect(catalog.snapshot.capturedAt).toBe('2000-01-01T12:00:00.000Z')
    expect(earth).toMatchObject({
      id: 'earth',
      radius: 6.3710084,
      position: [100, 0, 0]
    })
    expect(moon).toMatchObject({
      id: 'moon',
      radius: 1.7374,
      position: [100.4, 0.3, 0]
    })
    expect(
      Math.hypot(...(earth?.focusOffset ?? [0, 0, 0])) / (earth?.radius ?? 1)
    ).toBeCloseTo(
      Math.hypot(...(earthBase?.focusOffset ?? [0, 0, 0])) / (earthBase?.radius ?? 1),
      9
    )
    expect(
      Math.hypot(...(moon?.focusOffset ?? [0, 0, 0])) / (moon?.radius ?? 1)
    ).toBeCloseTo(
      Math.hypot(...(moonBase?.focusOffset ?? [0, 0, 0])) / (moonBase?.radius ?? 1),
      9
    )
  })

  it('warms the dataset and delegates prefetching to the ephemeris provider', async () => {
    const datasetLoader = createDatasetLoaderStub(dataset)
    const ephemerisProvider = createEphemerisProviderStub()
    const source = createWebBodyCatalogSource({
      ephemerisProvider,
      datasetLoader,
      scale: createPhysicalSceneScale(0.001)
    })

    await source.prefetchAroundUtc('2000-01-01T12:00:00Z')

    expect(datasetLoader.load).toHaveBeenCalledTimes(1)
    expect(ephemerisProvider.prefetchAroundUtc).toHaveBeenCalledWith('2000-01-01T12:00:00Z')
  })
})

function createDatasetLoaderStub(datasetValue: WebDataset): WebDatasetLoader & {
  load: ReturnType<typeof vi.fn>
  clearCache: ReturnType<typeof vi.fn>
} {
  return {
    load: vi.fn(async () => datasetValue),
    clearCache: vi.fn()
  }
}

function createEphemerisProviderStub(): BodyEphemerisProvider & {
  loadSnapshotAtUtc: ReturnType<typeof vi.fn>
  prefetchAroundUtc: ReturnType<typeof vi.fn>
} {
  return {
    getBodyMetadata: () => baseMetadata,
    loadSnapshotAtUtc: vi.fn(async (utc: Date | string) => {
      const snapshot: BodyEphemerisSnapshot = {
        capturedAt: new Date(utc).toISOString(),
        approximateTdbSecondsFromJ2000: 0,
        chunkFileName: 'chunk-0.json',
        chunkStartTdbSecondsFromJ2000: 0,
        chunkEndTdbSecondsFromJ2000: 100,
        bodies: [
          {
            id: 'earth',
            positionKm: [100000, 0, 0],
            velocityKmPerSecond: [0, 0, 0]
          },
          {
            id: 'moon',
            positionKm: [100400, 300, 0],
            velocityKmPerSecond: [0, 0, 0]
          }
        ]
      }

      return snapshot
    }),
    prefetchAroundUtc: vi.fn(async () => undefined),
    clearCache: vi.fn()
  }
}
