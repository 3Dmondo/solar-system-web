import {
  getBodyIdForNaifBodyId,
  supportedWebEphemerisSchemaVersion
} from './webEphemeris'
import { type BodyId, type BodyPhysicalMetadata } from '../domain/body'

type JsonRecord = Record<string, unknown>

export type WebBodyMetadataLayout = {
  referenceEpoch: string
  poleVectorFrame: string
  axialTiltReferencePlane: string
  radiiUnit: string
  meanRadiusUnit: string
  shapeRadiusUnit: string
  shapeVolumeUnit: string
  gravitationalParameterUnit: string
  rotationPeriodUnit: string
  surfaceGravityUnit: string
  escapeVelocityUnit: string
  bulkDensityUnit: string
  derivedPhysicalPropertiesNote: string
}

export type WebBodyMetadataFile = {
  schemaVersion: number
  generatedAtUtc: string
  generatedAtUtcSource: string
  layout: WebBodyMetadataLayout
  bodies: BodyPhysicalMetadata[]
}

export function parseWebBodyMetadataFile(input: unknown): WebBodyMetadataFile {
  const file = expectRecord(input, 'bodyMetadata')
  const schemaVersion = expectInteger(file.SchemaVersion, 'bodyMetadata.SchemaVersion')

  if (schemaVersion !== supportedWebEphemerisSchemaVersion) {
    throw new Error(
      `bodyMetadata.SchemaVersion must equal ${supportedWebEphemerisSchemaVersion}, received ${schemaVersion}`
    )
  }

  return {
    schemaVersion,
    generatedAtUtc: expectString(file.GeneratedAtUtc, 'bodyMetadata.GeneratedAtUtc'),
    generatedAtUtcSource: expectString(
      file.GeneratedAtUtcSource,
      'bodyMetadata.GeneratedAtUtcSource'
    ),
    layout: parseMetadataLayout(file.MetadataLayout, 'bodyMetadata.MetadataLayout'),
    bodies: expectArray(file.Bodies, 'bodyMetadata.Bodies').map((body, index) =>
      parseBodyPhysicalMetadata(body, `bodyMetadata.Bodies[${index}]`)
    )
  }
}

export function getBodyPhysicalMetadataById(
  metadataFile: WebBodyMetadataFile,
  bodyId: BodyId
) {
  return metadataFile.bodies.find((body) => body.id === bodyId)
}

function parseMetadataLayout(input: unknown, path: string): WebBodyMetadataLayout {
  const layout = expectRecord(input, path)

  return {
    referenceEpoch: expectString(layout.ReferenceEpoch, `${path}.ReferenceEpoch`),
    poleVectorFrame: expectString(layout.PoleVectorFrame, `${path}.PoleVectorFrame`),
    axialTiltReferencePlane: expectString(
      layout.AxialTiltReferencePlane,
      `${path}.AxialTiltReferencePlane`
    ),
    radiiUnit: expectString(layout.RadiiUnit, `${path}.RadiiUnit`),
    meanRadiusUnit: expectString(layout.MeanRadiusUnit, `${path}.MeanRadiusUnit`),
    shapeRadiusUnit: expectString(layout.ShapeRadiusUnit, `${path}.ShapeRadiusUnit`),
    shapeVolumeUnit: expectString(layout.ShapeVolumeUnit, `${path}.ShapeVolumeUnit`),
    gravitationalParameterUnit: expectString(
      layout.GravitationalParameterUnit,
      `${path}.GravitationalParameterUnit`
    ),
    rotationPeriodUnit: expectString(
      layout.RotationPeriodUnit,
      `${path}.RotationPeriodUnit`
    ),
    surfaceGravityUnit: expectString(
      layout.SurfaceGravityUnit,
      `${path}.SurfaceGravityUnit`
    ),
    escapeVelocityUnit: expectString(
      layout.EscapeVelocityUnit,
      `${path}.EscapeVelocityUnit`
    ),
    bulkDensityUnit: expectString(layout.BulkDensityUnit, `${path}.BulkDensityUnit`),
    derivedPhysicalPropertiesNote: expectString(
      layout.DerivedPhysicalPropertiesNote,
      `${path}.DerivedPhysicalPropertiesNote`
    )
  }
}

function parseBodyPhysicalMetadata(input: unknown, path: string): BodyPhysicalMetadata {
  const body = expectRecord(input, path)
  const naifBodyId = expectInteger(body.BodyId, `${path}.BodyId`)
  const bodyId = getBodyIdForNaifBodyId(naifBodyId)

  if (!bodyId) {
    throw new Error(`${path}.BodyId ${naifBodyId} is not part of the current app body set`)
  }

  const metadata = expectOptionalRecord(body.Metadata, `${path}.Metadata`)

  if (!metadata) {
    return {
      id: bodyId,
      naifBodyId
    }
  }

  const shapeModel = expectOptionalRecord(metadata.ShapeModel, `${path}.Metadata.ShapeModel`)
  const derivedPhysicalProperties = expectOptionalRecord(
    metadata.DerivedPhysicalProperties,
    `${path}.Metadata.DerivedPhysicalProperties`
  )
  const poleOrientation = expectOptionalRecord(
    metadata.PoleOrientation,
    `${path}.Metadata.PoleOrientation`
  )
  const rotationModel = expectOptionalRecord(
    metadata.RotationModel,
    `${path}.Metadata.RotationModel`
  )

  return {
    id: bodyId,
    naifBodyId,
    radiiKm: expectOptionalFixedLengthNumberTuple(
      metadata.RadiiKm,
      `${path}.Metadata.RadiiKm`,
      3
    ) as [number, number, number],
    meanRadiusKm: expectOptionalNumber(
      metadata.MeanRadiusKm,
      `${path}.Metadata.MeanRadiusKm`
    ),
    gravitationalParameterKm3PerSec2: expectOptionalNumber(
      metadata.GravitationalParameterKm3PerSec2,
      `${path}.Metadata.GravitationalParameterKm3PerSec2`
    ),
    shape: shapeModel
      ? {
      equatorialRadiusKm: expectOptionalNumber(
        shapeModel.EquatorialRadiusKm,
        `${path}.Metadata.ShapeModel.EquatorialRadiusKm`
      ),
      polarRadiusKm: expectOptionalNumber(
        shapeModel.PolarRadiusKm,
        `${path}.Metadata.ShapeModel.PolarRadiusKm`
      ),
      volumeEquivalentRadiusKm: expectOptionalNumber(
        shapeModel.VolumeEquivalentRadiusKm,
        `${path}.Metadata.ShapeModel.VolumeEquivalentRadiusKm`
      ),
      flattening: expectOptionalNumber(
        shapeModel.Flattening,
        `${path}.Metadata.ShapeModel.Flattening`
      ),
      approximateVolumeKm3: expectOptionalNumber(
        shapeModel.ApproxVolumeKm3,
        `${path}.Metadata.ShapeModel.ApproxVolumeKm3`
      ),
      isTriAxial: expectOptionalBoolean(
        shapeModel.IsTriAxial,
        `${path}.Metadata.ShapeModel.IsTriAxial`
      ),
      isApproximatelySpherical: expectOptionalBoolean(
        shapeModel.IsApproximatelySpherical,
        `${path}.Metadata.ShapeModel.IsApproximatelySpherical`
      )
    }
      : undefined,
    physicalProperties: derivedPhysicalProperties
      ? {
      referenceRadiusKm: expectOptionalNumber(
        derivedPhysicalProperties.ReferenceRadiusKm,
        `${path}.Metadata.DerivedPhysicalProperties.ReferenceRadiusKm`
      ),
      approximateMassKg: expectOptionalNumber(
        derivedPhysicalProperties.ApproximateMassKg,
        `${path}.Metadata.DerivedPhysicalProperties.ApproximateMassKg`
      ),
      approximateSurfaceGravityMps2: expectOptionalNumber(
        derivedPhysicalProperties.ApproximateSurfaceGravityMps2,
        `${path}.Metadata.DerivedPhysicalProperties.ApproximateSurfaceGravityMps2`
      ),
      approximateEscapeVelocityKmPerSec: expectOptionalNumber(
        derivedPhysicalProperties.ApproximateEscapeVelocityKmPerSec,
        `${path}.Metadata.DerivedPhysicalProperties.ApproximateEscapeVelocityKmPerSec`
      ),
      approximateBulkDensityKgPerM3: expectOptionalNumber(
        derivedPhysicalProperties.ApproximateBulkDensityKgPerM3,
        `${path}.Metadata.DerivedPhysicalProperties.ApproximateBulkDensityKgPerM3`
      )
    }
      : undefined,
    poleOrientation: poleOrientation
      ? {
      referenceEpoch: expectOptionalString(
        poleOrientation.ReferenceEpoch,
        `${path}.Metadata.PoleOrientation.ReferenceEpoch`
      ),
      axialTiltDegreesRelativeToJ2000Ecliptic: expectOptionalNumber(
        poleOrientation.AxialTiltDegreesRelativeToJ2000Ecliptic,
        `${path}.Metadata.PoleOrientation.AxialTiltDegreesRelativeToJ2000Ecliptic`
      ),
      poleRightAscensionDegreesAtReferenceEpoch: expectOptionalNumber(
        poleOrientation.PoleRightAscensionDegreesAtReferenceEpoch,
        `${path}.Metadata.PoleOrientation.PoleRightAscensionDegreesAtReferenceEpoch`
      ),
      poleDeclinationDegreesAtReferenceEpoch: expectOptionalNumber(
        poleOrientation.PoleDeclinationDegreesAtReferenceEpoch,
        `${path}.Metadata.PoleOrientation.PoleDeclinationDegreesAtReferenceEpoch`
      ),
      northPoleUnitVectorJ2000: expectOptionalFixedLengthNumberTuple(
        poleOrientation.NorthPoleUnitVectorJ2000,
        `${path}.Metadata.PoleOrientation.NorthPoleUnitVectorJ2000`,
        3
      ) as [number, number, number]
    }
      : undefined,
    rotationModel: rotationModel
      ? {
      siderealRotationPeriodHours: expectOptionalNumber(
        rotationModel.SiderealRotationPeriodHours,
        `${path}.Metadata.RotationModel.SiderealRotationPeriodHours`
      ),
      primeMeridianRateDegreesPerDay: expectOptionalNumber(
        rotationModel.PrimeMeridianRateDegreesPerDay,
        `${path}.Metadata.RotationModel.PrimeMeridianRateDegreesPerDay`
      ),
      isRetrograde: expectOptionalBoolean(
        rotationModel.IsRetrograde,
        `${path}.Metadata.RotationModel.IsRetrograde`
      )
    }
      : undefined
  }
}

function expectRecord(input: unknown, path: string): JsonRecord {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error(`${path} must be an object`)
  }

  return input as JsonRecord
}

function expectOptionalRecord(input: unknown, path: string): JsonRecord | undefined {
  if (input === null || input === undefined) {
    return undefined
  }

  return expectRecord(input, path)
}

function expectArray(input: unknown, path: string) {
  if (!Array.isArray(input)) {
    throw new Error(`${path} must be an array`)
  }

  return input
}

function expectString(input: unknown, path: string) {
  if (typeof input !== 'string') {
    throw new Error(`${path} must be a string`)
  }

  return input
}

function expectOptionalString(input: unknown, path: string) {
  if (input === null || input === undefined) {
    return undefined
  }

  return expectString(input, path)
}

function expectBoolean(input: unknown, path: string) {
  if (typeof input !== 'boolean') {
    throw new Error(`${path} must be a boolean`)
  }

  return input
}

function expectOptionalBoolean(input: unknown, path: string) {
  if (input === null || input === undefined) {
    return undefined
  }

  return expectBoolean(input, path)
}

function expectNumber(input: unknown, path: string) {
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    throw new Error(`${path} must be a finite number`)
  }

  return input
}

function expectOptionalNumber(input: unknown, path: string) {
  if (input === null || input === undefined) {
    return undefined
  }

  return expectNumber(input, path)
}

function expectInteger(input: unknown, path: string) {
  const value = expectNumber(input, path)

  if (!Number.isInteger(value)) {
    throw new Error(`${path} must be an integer`)
  }

  return value
}

function expectFixedLengthNumberTuple(
  input: unknown,
  path: string,
  expectedLength: number
) {
  const values = expectArray(input, path)

  if (values.length !== expectedLength) {
    throw new Error(`${path} must contain ${expectedLength} numbers, received ${values.length}`)
  }

  values.forEach((value, index) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`${path}[${index}] must be a finite number`)
    }
  })

  return values as number[]
}

function expectOptionalFixedLengthNumberTuple(
  input: unknown,
  path: string,
  expectedLength: number
) {
  if (input === null || input === undefined) {
    return undefined
  }

  return expectFixedLengthNumberTuple(input, path, expectedLength)
}
