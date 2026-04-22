import { describe, expect, it } from 'vitest'
import {
  createPhysicalSceneScale,
  mapEphemerisSnapshotToSceneSnapshot,
  mapPhysicalMetadataToScaledBodyMetadata
} from './ephemerisSceneMapping'
import {
  type BodyEphemerisSnapshot,
  type BodyMetadata,
  type BodyPhysicalMetadata
} from '../domain/body'

const referenceEphemerisSnapshot: BodyEphemerisSnapshot = {
  capturedAt: 'reference-barycentric-ephemeris',
  approximateTdbSecondsFromJ2000: 0,
  chunkFileName: 'chunk-0.json',
  chunkStartTdbSecondsFromJ2000: 0,
  chunkEndTdbSecondsFromJ2000: 100,
  bodies: [
    { id: 'sun', positionKm: [-100, 20, 5], velocityKmPerSecond: [0, 0, 0] },
    { id: 'earth', positionKm: [1_000, 20, 5], velocityKmPerSecond: [0, 0, 0] },
    { id: 'moon', positionKm: [1_004, 23, 5], velocityKmPerSecond: [0, 0, 0] }
  ]
}

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

const physicalMetadata: BodyPhysicalMetadata[] = [
  {
    id: 'earth',
    naifBodyId: 399,
    radiiKm: [6378.1, 6378.1, 6356.8],
    meanRadiusKm: 6371.0084,
    gravitationalParameterKm3PerSec2: 398600.435436,
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

describe('ephemerisSceneMapping', () => {
  it('scales barycentric positions into the shared scene frame without re-centering them', () => {
    const scale = createPhysicalSceneScale(0.01)
    const mappedSnapshot = mapEphemerisSnapshotToSceneSnapshot(referenceEphemerisSnapshot, scale)
    const sun = mappedSnapshot.bodies.find((body) => body.id === 'sun')
    const earth = mappedSnapshot.bodies.find((body) => body.id === 'earth')
    const moon = mappedSnapshot.bodies.find((body) => body.id === 'moon')
    const earthSunDistance = getDistance(earth?.position ?? [0, 0, 0], sun?.position ?? [0, 0, 0])
    const earthMoonDistance = getDistance(moon?.position ?? [0, 0, 0], earth?.position ?? [0, 0, 0])

    expect(mappedSnapshot.capturedAt).toBe(referenceEphemerisSnapshot.capturedAt)
    expect(sun?.position[0]).toBeCloseTo(-1, 9)
    expect(sun?.position[1]).toBeCloseTo(-0.0336813277, 9)
    expect(sun?.position[2]).toBeCloseTo(-0.2033852701, 9)
    expect(earth?.position[0]).toBeCloseTo(10, 9)
    expect(earth?.position[1]).toBeCloseTo(-0.0336813277, 9)
    expect(earth?.position[2]).toBeCloseTo(-0.2033852701, 9)
    expect(moon?.position[0]).toBeCloseTo(10.04, 9)
    expect(moon?.position[1]).toBeCloseTo(-0.0456146424, 9)
    expect(moon?.position[2]).toBeCloseTo(-0.230909732, 9)
    expect(earthMoonDistance / earthSunDistance).toBeCloseTo(0.0045454545, 9)
  })

  it('maps real radii with the same scale factor while preserving presentation fields', () => {
    const scale = createPhysicalSceneScale(0.0001)
    const mappedMetadata = mapPhysicalMetadataToScaledBodyMetadata(
      physicalMetadata,
      scale,
      baseMetadata
    )
    const earth = mappedMetadata.find((body) => body.id === 'earth')
    const moon = mappedMetadata.find((body) => body.id === 'moon')
    const earthPhysical = physicalMetadata.find((body) => body.id === 'earth')
    const moonPhysical = physicalMetadata.find((body) => body.id === 'moon')
    const earthBase = baseMetadata.find((body) => body.id === 'earth')
    const moonBase = baseMetadata.find((body) => body.id === 'moon')

    expect(earth?.displayName).toBe('Earth')
    expect(earth?.material).toBe('earth')
    expect(earth?.focusOffset[0]).toBeCloseTo(0, 9)
    expect(earth?.radius).toBeCloseTo(0.63710084, 9)
    expect(moon?.radius).toBeCloseTo(0.17374, 9)
    expect((moon?.radius ?? 0) / (earth?.radius ?? 1)).toBeCloseTo(
      (moonPhysical?.meanRadiusKm ?? 0) / (earthPhysical?.meanRadiusKm ?? 1),
      9
    )
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

  it('rejects invalid scale factors and incomplete physical metadata', () => {
    expect(() => createPhysicalSceneScale(0)).toThrowError(/greater than zero/)

    expect(() =>
      mapPhysicalMetadataToScaledBodyMetadata(
        physicalMetadata.filter((body) => body.id !== 'moon'),
        createPhysicalSceneScale(0.0001),
        baseMetadata
      )
    ).toThrowError(/moon/)
  })
})

function getDistance(
  left: [number, number, number],
  right: [number, number, number]
) {
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2])
}
