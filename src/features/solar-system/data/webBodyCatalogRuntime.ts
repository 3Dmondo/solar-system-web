import { type BodyMetadata } from '../domain/body'
import { type BodyCatalogSource } from './bodyStateStore'
import { createPhysicalSceneScale } from './ephemerisSceneMapping'
import { createWebBodyCatalogSource } from './webBodyCatalogSource'
import { createWebDatasetLoader } from './webDatasetLoader'
import { createWebEphemerisProvider } from './webEphemerisProvider'

const DEFAULT_WEB_EPHEMERIS_DATA_BASE_PATH = 'ephemeris/generated'
const EXPANDED_MAJOR_MOONS_WEB_EPHEMERIS_DATA_BASE_PATH =
  'ephemeris/generated-expanded-major-moons'
const DEFAULT_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER = 0.001

export type WebBodyCatalogRuntimeEnv = {
  readonly BASE_URL?: string
  readonly VITE_WEB_EPHEMERIS_BODY_METADATA_URL?: string
  readonly VITE_WEB_EPHEMERIS_DATA_BASE_URL?: string
  readonly VITE_WEB_EPHEMERIS_PROFILE?: string
  readonly VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER?: string
}

export type CreateConfiguredWebBodyCatalogSourceOptions = {
  fetchImpl?: typeof fetch
  presentationMetadata?: BodyMetadata[]
}

export function createConfiguredWebBodyCatalogSource(
  env: WebBodyCatalogRuntimeEnv,
  options: CreateConfiguredWebBodyCatalogSourceOptions = {}
): BodyCatalogSource | undefined {
  const dataBaseUrl = getConfiguredWebEphemerisDataBaseUrl(env)
  const bodyMetadataUrl = getConfiguredWebBodyMetadataUrl(env)
  const sceneUnitsPerKilometer = getConfiguredSceneUnitsPerKilometer(env)

  if (!dataBaseUrl || sceneUnitsPerKilometer === undefined) {
    return undefined
  }

  const datasetLoader = createWebDatasetLoader(
    {
      manifestUrl: `${dataBaseUrl}/manifest.json`,
      bodyMetadataUrl
    },
    options.fetchImpl
  )
  const ephemerisProvider = createWebEphemerisProvider({
    chunkBaseUrl: dataBaseUrl,
    datasetLoader,
    fetchImpl: options.fetchImpl,
    presentationMetadata: options.presentationMetadata
  })

  return createWebBodyCatalogSource({
    ephemerisProvider,
    datasetLoader,
    scale: createPhysicalSceneScale(sceneUnitsPerKilometer)
  })
}

export function getConfiguredWebEphemerisDataBaseUrl(
  env: WebBodyCatalogRuntimeEnv
) {
  const value = env.VITE_WEB_EPHEMERIS_DATA_BASE_URL?.trim()

  if (!value) {
    return `${getConfiguredBaseUrl(env)}${getConfiguredDataBasePath(env)}`
  }

  return value.replace(/[\\/]+$/, '')
}

export function getConfiguredWebBodyMetadataUrl(
  env: WebBodyCatalogRuntimeEnv
) {
  const value = env.VITE_WEB_EPHEMERIS_BODY_METADATA_URL?.trim()

  if (value) {
    return value
  }

  return `${getConfiguredBaseUrl(env)}ephemeris/body-metadata.json`
}

export function getConfiguredSceneUnitsPerKilometer(
  env: WebBodyCatalogRuntimeEnv
) {
  const value = env.VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER?.trim()

  if (!value) {
    return DEFAULT_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined
  }

  return parsed
}

function getConfiguredDataBasePath(env: WebBodyCatalogRuntimeEnv) {
  const profile = env.VITE_WEB_EPHEMERIS_PROFILE?.trim()

  if (profile === 'expanded-major-moons') {
    return EXPANDED_MAJOR_MOONS_WEB_EPHEMERIS_DATA_BASE_PATH
  }

  return DEFAULT_WEB_EPHEMERIS_DATA_BASE_PATH
}

function getConfiguredBaseUrl(env: WebBodyCatalogRuntimeEnv) {
  const value = env.BASE_URL?.trim()

  if (!value) {
    return './'
  }

  return value.endsWith('/') ? value : `${value}/`
}
