import {
  getBodyIdForNaifBodyId,
  type BodyId
} from '../domain/body'

export { getBodyIdForNaifBodyId, getNaifBodyId } from '../domain/body'

const SECONDS_PER_DAY = 86_400
const SAMPLE_COMPONENTS_PER_ENTRY = 6

type JsonRecord = Record<string, unknown>

export const supportedWebEphemerisSchemaVersion = 1

export const supportedWebEphemerisRuntimeLayout = {
  chunkBoundaryTimeEncoding: 'approximate_tdb_seconds_from_j2000',
  sampleTimeEncoding: 'chunk_start_plus_body_cadence_days_with_terminal_chunk_end_sample',
  sampleValueLayout: 'xyz_vxvyvz',
  sampleComponentsPerSample: SAMPLE_COMPONENTS_PER_ENTRY,
  positionUnits: 'km',
  velocityUnits: 'km/s',
  interpolationHint: 'cubic_hermite_position_velocity'
} as const

export type WebEphemerisRuntimeLayout = typeof supportedWebEphemerisRuntimeLayout

export type WebEphemerisManifestBody = {
  bodyId: BodyId
  naifBodyId: number
  bodyName: string
  sourceNaifBodyId: number
  sourceBodyName: string
  sampleDays: number
}

export type WebEphemerisChunkRange = {
  fileName: string
  startUtc: string
  endUtc: string
  startTdbSecondsFromJ2000: number
  endTdbSecondsFromJ2000: number
}

export type WebEphemerisManifest = {
  schemaVersion: number
  generatedAtUtc: string
  sourceSpkPath: string | null
  sourceLskPath: string | null
  usesApproximateUtcConversion: boolean
  approximationNote: string | null
  startYear: number
  endYear: number
  chunkYears: number
  defaultSampleDays: number
  centerNaifBodyId: number
  runtimeLayout: WebEphemerisRuntimeLayout
  bodies: WebEphemerisManifestBody[]
  chunks: WebEphemerisChunkRange[]
}

export type WebEphemerisSampleBuffer = ArrayLike<number> & { length: number }

export type WebEphemerisChunkBody = {
  bodyId: BodyId
  naifBodyId: number
  samples: WebEphemerisSampleBuffer
}

export type WebEphemerisChunk = {
  schemaVersion: number
  centerNaifBodyId: number
  range: WebEphemerisChunkRange
  bodies: WebEphemerisChunkBody[]
}

export type WebEphemerisStateSample = {
  positionKm: [number, number, number]
  velocityKmPerSecond: [number, number, number]
}

export function getManifestBodyById(manifest: WebEphemerisManifest, bodyId: BodyId) {
  return manifest.bodies.find((body) => body.bodyId === bodyId)
}

export function getChunkBodyById(chunk: WebEphemerisChunk, bodyId: BodyId) {
  return chunk.bodies.find((body) => body.bodyId === bodyId)
}

export function parseWebEphemerisManifest(input: unknown): WebEphemerisManifest {
  const manifest = expectRecord(input, 'manifest')
  const schemaVersion = expectInteger(manifest.SchemaVersion, 'manifest.SchemaVersion')

  if (schemaVersion !== supportedWebEphemerisSchemaVersion) {
    throw new Error(
      `manifest.SchemaVersion must equal ${supportedWebEphemerisSchemaVersion}, received ${schemaVersion}`
    )
  }

  const runtimeLayout = parseSupportedRuntimeLayout(manifest.RuntimeLayout, 'manifest.RuntimeLayout')
  const bodies = expectArray(manifest.Bodies, 'manifest.Bodies').map((body, index) =>
    parseManifestBody(body, `manifest.Bodies[${index}]`)
  )
  const chunks = expectArray(manifest.Chunks, 'manifest.Chunks').map((chunk, index) =>
    parseChunkRange(chunk, `manifest.Chunks[${index}]`)
  )

  return {
    schemaVersion,
    generatedAtUtc: expectString(manifest.GeneratedAtUtc, 'manifest.GeneratedAtUtc'),
    sourceSpkPath: expectNullableString(manifest.SpkPath, 'manifest.SpkPath'),
    sourceLskPath: expectNullableString(manifest.LskPath, 'manifest.LskPath'),
    usesApproximateUtcConversion: expectBoolean(
      manifest.UsesApproximateUtcConversion,
      'manifest.UsesApproximateUtcConversion'
    ),
    approximationNote: expectNullableString(
      manifest.ApproximationNote,
      'manifest.ApproximationNote'
    ),
    startYear: expectInteger(manifest.StartYear, 'manifest.StartYear'),
    endYear: expectInteger(manifest.EndYear, 'manifest.EndYear'),
    chunkYears: expectPositiveNumber(manifest.ChunkYears, 'manifest.ChunkYears'),
    defaultSampleDays: expectPositiveNumber(
      manifest.DefaultSampleDays,
      'manifest.DefaultSampleDays'
    ),
    centerNaifBodyId: expectInteger(manifest.CenterBodyId, 'manifest.CenterBodyId'),
    runtimeLayout,
    bodies,
    chunks
  }
}

export function parseWebEphemerisChunk(
  input: unknown,
  manifest: WebEphemerisManifest
): WebEphemerisChunk {
  const chunk = expectRecord(input, 'chunk')
  const schemaVersion = expectInteger(chunk.SchemaVersion, 'chunk.SchemaVersion')

  if (schemaVersion !== manifest.schemaVersion) {
    throw new Error(
      `chunk.SchemaVersion must equal manifest schema version ${manifest.schemaVersion}, received ${schemaVersion}`
    )
  }

  const centerNaifBodyId = expectInteger(chunk.CenterBodyId, 'chunk.CenterBodyId')

  if (centerNaifBodyId !== manifest.centerNaifBodyId) {
    throw new Error(
      `chunk.CenterBodyId must equal manifest center body id ${manifest.centerNaifBodyId}, received ${centerNaifBodyId}`
    )
  }

  const startTdbSecondsFromJ2000 = expectNumber(
    chunk.StartTdbSecondsFromJ2000,
    'chunk.StartTdbSecondsFromJ2000'
  )
  const endTdbSecondsFromJ2000 = expectNumber(
    chunk.EndTdbSecondsFromJ2000,
    'chunk.EndTdbSecondsFromJ2000'
  )
  const range = manifest.chunks.find(
    (candidate) =>
      candidate.startTdbSecondsFromJ2000 === startTdbSecondsFromJ2000 &&
      candidate.endTdbSecondsFromJ2000 === endTdbSecondsFromJ2000
  )

  if (!range) {
    throw new Error(
      `chunk range ${startTdbSecondsFromJ2000}..${endTdbSecondsFromJ2000} does not exist in the manifest`
    )
  }

  const rawBodies = expectArray(chunk.Bodies, 'chunk.Bodies').map((body, index) =>
    parseChunkBody(body, `chunk.Bodies[${index}]`)
  )
  const rawBodiesByNaifId = new Map(rawBodies.map((body) => [body.naifBodyId, body]))

  if (rawBodiesByNaifId.size !== rawBodies.length) {
    throw new Error('chunk.Bodies must not repeat the same BodyId value')
  }

  const bodies = manifest.bodies.map((manifestBody) => {
    const chunkBody = rawBodiesByNaifId.get(manifestBody.naifBodyId)

    if (!chunkBody) {
      throw new Error(
        `chunk.Bodies is missing ${manifestBody.bodyName} (${manifestBody.naifBodyId})`
      )
    }

    const expectedSampleCount = getExpectedChunkBodySampleCount(range, manifestBody)
    const actualSampleCount = getChunkBodySampleCount(chunkBody)

    if (actualSampleCount !== expectedSampleCount) {
      throw new Error(
        `${manifestBody.bodyName} (${manifestBody.naifBodyId}) expected ${expectedSampleCount} samples, received ${actualSampleCount}`
      )
    }

    return chunkBody
  })

  if (rawBodies.length !== manifest.bodies.length) {
    throw new Error(
      `chunk.Bodies must contain ${manifest.bodies.length} supported bodies, received ${rawBodies.length}`
    )
  }

  return {
    schemaVersion,
    centerNaifBodyId,
    range,
    bodies
  }
}

export function getExpectedChunkBodySampleCount(
  chunkRange: WebEphemerisChunkRange,
  manifestBody: WebEphemerisManifestBody
) {
  const cadenceSeconds = manifestBody.sampleDays * SECONDS_PER_DAY
  let sampleCount = 1
  let currentSampleTime = chunkRange.startTdbSecondsFromJ2000

  while (currentSampleTime + cadenceSeconds < chunkRange.endTdbSecondsFromJ2000) {
    currentSampleTime += cadenceSeconds
    sampleCount += 1
  }

  if (currentSampleTime !== chunkRange.endTdbSecondsFromJ2000) {
    sampleCount += 1
  }

  return sampleCount
}

export function getChunkBodySampleCount(chunkBody: WebEphemerisChunkBody) {
  return chunkBody.samples.length / SAMPLE_COMPONENTS_PER_ENTRY
}

export function getChunkBodySampleTime(
  chunk: WebEphemerisChunk,
  manifestBody: WebEphemerisManifestBody,
  sampleIndex: number
) {
  const sampleCount = getExpectedChunkBodySampleCount(chunk.range, manifestBody)

  if (sampleIndex < 0 || sampleIndex >= sampleCount) {
    throw new RangeError(
      `sample index ${sampleIndex} is out of range for ${manifestBody.bodyName}; valid range is 0..${sampleCount - 1}`
    )
  }

  if (sampleIndex === sampleCount - 1) {
    return chunk.range.endTdbSecondsFromJ2000
  }

  return chunk.range.startTdbSecondsFromJ2000 + sampleIndex * manifestBody.sampleDays * SECONDS_PER_DAY
}

export function getChunkBodySampleAt(
  chunkBody: WebEphemerisChunkBody,
  sampleIndex: number
): WebEphemerisStateSample {
  const sampleCount = getChunkBodySampleCount(chunkBody)

  if (sampleIndex < 0 || sampleIndex >= sampleCount) {
    throw new RangeError(
      `sample index ${sampleIndex} is out of range for ${chunkBody.bodyId}; valid range is 0..${sampleCount - 1}`
    )
  }

  const offset = sampleIndex * SAMPLE_COMPONENTS_PER_ENTRY

  return {
    positionKm: [
      getRequiredSampleComponent(chunkBody, offset),
      getRequiredSampleComponent(chunkBody, offset + 1),
      getRequiredSampleComponent(chunkBody, offset + 2)
    ],
    velocityKmPerSecond: [
      getRequiredSampleComponent(chunkBody, offset + 3),
      getRequiredSampleComponent(chunkBody, offset + 4),
      getRequiredSampleComponent(chunkBody, offset + 5)
    ]
  }
}

function parseSupportedRuntimeLayout(input: unknown, path: string): WebEphemerisRuntimeLayout {
  const layout = expectRecord(input, path)
  const chunkBoundaryTimeEncoding = expectString(
    layout.ChunkBoundaryTimeEncoding,
    `${path}.ChunkBoundaryTimeEncoding`
  )
  const sampleTimeEncoding = expectString(
    layout.SampleTimeEncoding,
    `${path}.SampleTimeEncoding`
  )
  const sampleValueLayout = expectString(
    layout.SampleValueLayout,
    `${path}.SampleValueLayout`
  )
  const sampleComponentsPerSample = expectInteger(
    layout.SampleComponentsPerSample,
    `${path}.SampleComponentsPerSample`
  )
  const positionUnits = expectString(layout.PositionUnits, `${path}.PositionUnits`)
  const velocityUnits = expectString(layout.VelocityUnits, `${path}.VelocityUnits`)
  const interpolationHint = expectString(
    layout.InterpolationHint,
    `${path}.InterpolationHint`
  )

  for (const [key, expectedValue] of Object.entries(supportedWebEphemerisRuntimeLayout)) {
    const actualValue = {
      chunkBoundaryTimeEncoding,
      sampleTimeEncoding,
      sampleValueLayout,
      sampleComponentsPerSample,
      positionUnits,
      velocityUnits,
      interpolationHint
    }[key as keyof WebEphemerisRuntimeLayout]

    if (actualValue !== expectedValue) {
      throw new Error(`${path}.${toPascalCase(key)} must equal ${expectedValue}, received ${actualValue}`)
    }
  }

  return supportedWebEphemerisRuntimeLayout
}

function parseManifestBody(input: unknown, path: string): WebEphemerisManifestBody {
  const body = expectRecord(input, path)
  const naifBodyId = expectInteger(body.BodyId, `${path}.BodyId`)
  const bodyId = getBodyIdForNaifBodyId(naifBodyId)

  if (!bodyId) {
    throw new Error(`${path}.BodyId ${naifBodyId} is not part of the current app body set`)
  }

  return {
    bodyId,
    naifBodyId,
    bodyName: expectString(body.BodyName, `${path}.BodyName`),
    sourceNaifBodyId: expectInteger(body.SourceBodyId, `${path}.SourceBodyId`),
    sourceBodyName: expectString(body.SourceBodyName, `${path}.SourceBodyName`),
    sampleDays: expectPositiveNumber(body.SampleDays, `${path}.SampleDays`)
  }
}

function parseChunkRange(input: unknown, path: string): WebEphemerisChunkRange {
  const chunkRange = expectRecord(input, path)

  return {
    fileName: expectString(chunkRange.FileName, `${path}.FileName`),
    startUtc: expectString(chunkRange.StartUtc, `${path}.StartUtc`),
    endUtc: expectString(chunkRange.EndUtc, `${path}.EndUtc`),
    startTdbSecondsFromJ2000: expectNumber(
      chunkRange.StartTdbSecondsFromJ2000,
      `${path}.StartTdbSecondsFromJ2000`
    ),
    endTdbSecondsFromJ2000: expectNumber(
      chunkRange.EndTdbSecondsFromJ2000,
      `${path}.EndTdbSecondsFromJ2000`
    )
  }
}

function parseChunkBody(input: unknown, path: string): WebEphemerisChunkBody {
  const body = expectRecord(input, path)
  const naifBodyId = expectInteger(body.BodyId, `${path}.BodyId`)
  const bodyId = getBodyIdForNaifBodyId(naifBodyId)

  if (!bodyId) {
    throw new Error(`${path}.BodyId ${naifBodyId} is not part of the current app body set`)
  }

  const samples = expectNumberArray(body.Samples, `${path}.Samples`)

  if (samples.length % SAMPLE_COMPONENTS_PER_ENTRY !== 0) {
    throw new Error(
      `${path}.Samples length must be divisible by ${SAMPLE_COMPONENTS_PER_ENTRY}, received ${samples.length}`
    )
  }

  return {
    bodyId,
    naifBodyId,
    samples: new Float64Array(samples)
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

function expectNullableString(input: unknown, path: string) {
  if (input === null || input === undefined) {
    return null
  }

  return expectString(input, path)
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

function expectPositiveNumber(input: unknown, path: string) {
  const value = expectNumber(input, path)

  if (value <= 0) {
    throw new Error(`${path} must be greater than zero`)
  }

  return value
}

function expectNumberArray(input: unknown, path: string) {
  const values = expectArray(input, path)

  values.forEach((value, index) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`${path}[${index}] must be a finite number`)
    }
  })

  return values as number[]
}

function getRequiredSampleComponent(chunkBody: WebEphemerisChunkBody, index: number) {
  const value = chunkBody.samples[index]

  if (value === undefined) {
    throw new RangeError(`sample component ${index} is missing for ${chunkBody.bodyId}`)
  }

  return value
}

function toPascalCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
