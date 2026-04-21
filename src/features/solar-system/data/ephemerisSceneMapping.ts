import {
  type BodyEphemerisSnapshot,
  type BodyMetadata,
  type BodyPhysicalMetadata,
  type BodySnapshot
} from '../domain/body'
import { mockedBodyMetadata } from './mockBodyCatalog'

export type PhysicalSceneScale = {
  sceneUnitsPerKilometer: number
}

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
  return {
    capturedAt: snapshot.capturedAt,
    bodies: snapshot.bodies.map((body) => ({
      id: body.id,
      position: scaleVector(body.positionKm, scale.sceneUnitsPerKilometer)
    }))
  }
}

export function mapPhysicalMetadataToScaledBodyMetadata(
  physicalMetadata: BodyPhysicalMetadata[],
  scale: PhysicalSceneScale,
  baseMetadata: BodyMetadata[] = mockedBodyMetadata
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
