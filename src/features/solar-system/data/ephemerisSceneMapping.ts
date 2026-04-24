import {
  type BodyEphemerisSnapshot,
  type BodyMetadata,
  type BodyPhysicalMetadata,
  type BodySnapshot
} from '../domain/body'
import { measureRuntimeDebugMetric } from '../../experience/debug/runtimeDebugMetrics'
import { presentationBodyMetadata } from './bodyPresentation'

export type PhysicalSceneScale = {
  sceneUnitsPerKilometer: number
}

const J2000_ECLIPTIC_OBLIQUITY_RADIANS = (23.439291111 * Math.PI) / 180
const J2000_ECLIPTIC_OBLIQUITY_COSINE = Math.cos(J2000_ECLIPTIC_OBLIQUITY_RADIANS)
const J2000_ECLIPTIC_OBLIQUITY_SINE = Math.sin(J2000_ECLIPTIC_OBLIQUITY_RADIANS)

export function createPhysicalSceneScale(
  sceneUnitsPerKilometer: number
): PhysicalSceneScale {
  if (!Number.isFinite(sceneUnitsPerKilometer) || sceneUnitsPerKilometer <= 0) {
    throw new Error('sceneUnitsPerKilometer must be a finite number greater than zero')
  }

  return {
    sceneUnitsPerKilometer
  }
}

export function mapEphemerisSnapshotToSceneSnapshot(
  snapshot: BodyEphemerisSnapshot,
  scale: PhysicalSceneScale
): BodySnapshot {
  return measureRuntimeDebugMetric('sceneSpaceMapping', () => ({
    capturedAt: snapshot.capturedAt,
    bodies: snapshot.bodies.map((body) => ({
      id: body.id,
      position: mapJ2000PositionKmToScenePosition(body.positionKm, scale)
    })),
    trails: snapshot.trails.map((trail) => ({
      id: trail.id,
      positions: trail.positionsKm.map((positionKm) =>
        mapJ2000PositionKmToScenePosition(positionKm, scale)
      )
    }))
  }))
}

export function mapPhysicalMetadataToScaledBodyMetadata(
  physicalMetadata: BodyPhysicalMetadata[],
  scale: PhysicalSceneScale,
  baseMetadata: BodyMetadata[] = presentationBodyMetadata
) {
  const physicalMetadataById = getDistinctBodyMap(physicalMetadata, 'physicalMetadata')

  return baseMetadata.map((metadata) => {
    const physicalBody = physicalMetadataById.get(metadata.id)

    if (!physicalBody) {
      throw new Error(`physicalMetadata is missing body ${metadata.id}`)
    }

    const scaledRadius = physicalBody.meanRadiusKm * scale.sceneUnitsPerKilometer
    const focusOffsetScale =
      metadata.radius > 0 ? scaledRadius / metadata.radius : 1

    return {
      ...metadata,
      radius: scaledRadius,
      focusOffset: scaleVector(metadata.focusOffset, focusOffsetScale)
    }
  })
}

function getDistinctBodyMap<Value extends { id: string }>(
  values: Value[],
  label: string
): Map<string, Value> {
  const valuesById = new Map(values.map((value) => [value.id, value]))

  if (valuesById.size !== values.length) {
    throw new Error(`${label} must not repeat the same body id`)
  }

  return valuesById
}

function scaleVector(
  vector: [number, number, number],
  sceneUnitsPerKilometer: number
): [number, number, number] {
  return [
    vector[0] * sceneUnitsPerKilometer,
    vector[1] * sceneUnitsPerKilometer,
    vector[2] * sceneUnitsPerKilometer
  ]
}

function mapJ2000PositionKmToScenePosition(
  positionKm: [number, number, number],
  scale: PhysicalSceneScale
): [number, number, number] {
  const eclipticAligned = rotateJ2000EquatorialVectorToEcliptic(positionKm)

  return [
    eclipticAligned[0] * scale.sceneUnitsPerKilometer,
    eclipticAligned[2] * scale.sceneUnitsPerKilometer,
    -eclipticAligned[1] * scale.sceneUnitsPerKilometer
  ]
}

function rotateJ2000EquatorialVectorToEcliptic(
  vector: [number, number, number]
): [number, number, number] {
  return [
    vector[0],
    vector[1] * J2000_ECLIPTIC_OBLIQUITY_COSINE + vector[2] * J2000_ECLIPTIC_OBLIQUITY_SINE,
    -vector[1] * J2000_ECLIPTIC_OBLIQUITY_SINE + vector[2] * J2000_ECLIPTIC_OBLIQUITY_COSINE
  ]
}
