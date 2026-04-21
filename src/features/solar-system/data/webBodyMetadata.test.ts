import { describe, expect, it } from 'vitest'
import {
  getBodyPhysicalMetadataById,
  parseWebBodyMetadataFile
} from './webBodyMetadata'

const rawBodyMetadataFixture = {
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
    },
    {
      BodyId: 699,
      BodyName: 'Saturn',
      Metadata: {
        RadiiKm: [60268, 60268, 54364],
        MeanRadiusKm: 58300,
        GravitationalParameterKm3PerSec2: 37931206.23436167,
        ShapeModel: {
          EquatorialRadiusKm: 60268,
          PolarRadiusKm: 54364,
          VolumeEquivalentRadiusKm: 58231.993022318304,
          ApproxVolumeKm3: 827129617817030.8,
          Flattening: 0.09796243445941462,
          IsTriAxial: false,
          IsApproximatelySpherical: false
        },
        DerivedPhysicalProperties: {
          ReferenceRadiusKm: 58231.993022318304,
          ApproximateMassKg: 5.683173701266301e26,
          ApproximateSurfaceGravityMps2: 11.185962139799777,
          ApproximateEscapeVelocityKmPerSec: 36.093790858615485,
          ApproximateBulkDensityKgPerM3: 687.0959011557817
        },
        PoleOrientation: {
          ReferenceEpoch: 'J2000',
          PoleRightAscensionDegreesAtReferenceEpoch: 40.589,
          PoleDeclinationDegreesAtReferenceEpoch: 83.537,
          NorthPoleUnitVectorJ2000: [0.08547883186107152, 0.07323575787752876, 0.9936447519469777],
          AxialTiltDegreesRelativeToJ2000Ecliptic: 28.052173725165137
        },
        RotationModel: {
          PrimeMeridianRateDegreesPerDay: 810.7939024,
          SiderealRotationPeriodHours: 10.656222221732387,
          IsRetrograde: false
        }
      }
    }
  ]
}

describe('webBodyMetadata', () => {
  it('parses kernel-derived physical metadata separately from cinematic metadata', () => {
    const metadataFile = parseWebBodyMetadataFile(rawBodyMetadataFixture)
    const earth = getBodyPhysicalMetadataById(metadataFile, 'earth')

    expect(metadataFile.layout.referenceEpoch).toBe('J2000')
    expect(earth).toMatchObject({
      id: 'earth',
      naifBodyId: 399,
      meanRadiusKm: 6371.008366666666,
      poleOrientation: {
        axialTiltDegreesRelativeToJ2000Ecliptic: 23.439291111000003
      },
      rotationModel: {
        siderealRotationPeriodHours: 23.93447117430703
      }
    })
  })

  it('rejects bodies outside the supported app body set', () => {
    expect(() =>
      parseWebBodyMetadataFile({
        ...rawBodyMetadataFixture,
        Bodies: [
          {
            ...rawBodyMetadataFixture.Bodies[0],
            BodyId: 999
          }
        ]
      })
    ).toThrowError(/current app body set/)
  })
})
