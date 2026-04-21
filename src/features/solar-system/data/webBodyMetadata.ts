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

  const metadata = expectRecord(body.Metadata, `${path}.Metadata`)
  const shapeModel = expectRecord(metadata.ShapeModel, `${path}.Metadata.ShapeModel`)
  const derivedPhysicalProperties = expectRecord(
    metadata.DerivedPhysicalProperties,
    `${path}.Metadata.DerivedPhysicalProperties`
  )
  const poleOrientation = expectRecord(
    metadata.PoleOrientation,
    `${path}.Metadata.PoleOrientation`
  )
  const rotationModel = expectRecord(
    metadata.RotationModel,
    `${path}.Metadata.RotationModel`
  )

  return {
    id: bodyId,
    naifBodyId,
    radiiKm: expectFixedLengthNumberTuple(
      metadata.RadiiKm,
      `${path}.Metadata.RadiiKm`,
      3
    ) as [number, number, number],
    meanRadiusKm: expectNumber(metadata.MeanRadiusKm, `${path}.Metadata.MeanRadiusKm`),
    gravitationalParameterKm3PerSec2: expectNumber(
      metadata.GravitationalParameterKm3PerSec2,
      `${path}.Metadata.GravitationalParameterKm3PerSec2`
    ),
    shape: {
      equatorialRadiusKm: expectNumber(
        shapeModel.EquatorialRadiusKm,
        `${path}.Metadata.ShapeModel.EquatorialRadiusKm`
      ),
      polarRadiusKm: expectNumber(
        shapeModel.PolarRadiusKm,
        `${path}.Metadata.ShapeModel.PolarRadiusKm`
      ),
      volumeEquivalentRadiusKm: expectNumber(
        shapeModel.VolumeEquivalentRadiusKm,
        `${path}.Metadata.ShapeModel.VolumeEquivalentRadiusKm`
      ),
      flattening: expectNumber(
        shapeModel.Flattening,
        `${path}.Metadata.ShapeModel.Flattening`
      ),
      approximateVolumeKm3: expectNumber(
        shapeModel.ApproxVolumeKm3,
        `${path}.Metadata.ShapeModel.ApproxVolumeKm3`
      ),
      isTriAxial: expectBoolean(
        shapeModel.IsTriAxial,
        `${path}.Metadata.ShapeModel.IsTriAxial`
      ),
      isApproximatelySpherical: expectBoolean(
        shapeModel.IsApproximatelySpherical,
        `${path}.Metadata.ShapeModel.IsApproximatelySpherical`
      )
    },
    physicalProperties: {
      referenceRadiusKm: expectNumber(
        derivedPhysicalProperties.ReferenceRadiusKm,
        `${path}.Metadata.DerivedPhysicalProperties.ReferenceRadiusKm`
      ),
      approximateMassKg: expectNumber(
        derivedPhysicalProperties.ApproximateMassKg,
        `${path}.Metadata.DerivedPhysicalProperties.ApproximateMassKg`
      ),
      approximateSurfaceGravityMps2: expectNumber(
        derivedPhysicalProperties.ApproximateSurfaceGravityMps2,
        `${path}.Metadata.DerivedPhysicalProperties.ApproximateSurfaceGravityMps2`
      ),
      approximateEscapeVelocityKmPerSec: expectNumber(
        derivedPhysicalProperties.ApproximateEscapeVelocityKmPerSec,
        `${path}.Metadata.DerivedPhysicalProperties.ApproximateEscapeVelocityKmPerSec`
      ),
      approximateBulkDensityKgPerM3: expectNumber(
        derivedPhysicalProperties.ApproximateBulkDensityKgPerM3,
        `${path}.Metadata.DerivedPhysicalProperties.ApproximateBulkDensityKgPerM3`
      )
    },
    poleOrientation: {
      referenceEpoch: expectString(
        poleOrientation.ReferenceEpoch,
        `${path}.Metadata.PoleOrientation.ReferenceEpoch`
      ),
      axialTiltDegreesRelativeToJ2000Ecliptic: expectNumber(
        poleOrientation.AxialTiltDegreesRelativeToJ2000Ecliptic,
        `${path}.Metadata.PoleOrientation.AxialTiltDegreesRelativeToJ2000Ecliptic`
      ),
      poleRightAscensionDegreesAtReferenceEpoch: expectNumber(
        poleOrientation.PoleRightAscensionDegreesAtReferenceEpoch,
        `${path}.Metadata.PoleOrientation.PoleRightAscensionDegreesAtReferenceEpoch`
      ),
      poleDeclinationDegreesAtReferenceEpoch: expectNumber(
        poleOrientation.PoleDeclinationDegreesAtReferenceEpoch,
        `${path}.Metadata.PoleOrientation.PoleDeclinationDegreesAtReferenceEpoch`
      ),
      northPoleUnitVectorJ2000: expectFixedLengthNumberTuple(
        poleOrientation.NorthPoleUnitVectorJ2000,
        `${path}.Metadata.PoleOrientation.NorthPoleUnitVectorJ2000`,
        3
      ) as [number, number, number]
    },
    rotationModel: {
      siderealRotationPeriodHours: expectNumber(
        rotationModel.SiderealRotationPeriodHours,
        `${path}.Metadata.RotationModel.SiderealRotationPeriodHours`
      ),
      primeMeridianRateDegreesPerDay: expectNumber(
        rotationModel.PrimeMeridianRateDegreesPerDay,
        `${path}.Metadata.RotationModel.PrimeMeridianRateDegreesPerDay`
      ),
      isRetrograde: expectBoolean(
        rotationModel.IsRetrograde,
        `${path}.Metadata.RotationModel.IsRetrograde`
      )
    }
  }
}

function expectRecord(input: unknown, path: string): JsonRecord {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error(`${path} must be an object`)
  }

  return input as JsonRecord
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

function expectBoolean(input: unknown, path: string) {
  if (typeof input !== 'boolean') {
    throw new Error(`${path} must be a boolean`)
  }

  return input
}

function expectNumber(input: unknown, path: string) {
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    throw new Error(`${path} must be a finite number`)
  }

  return input
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
