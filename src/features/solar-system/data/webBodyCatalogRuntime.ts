import { type BodyMetadata } from '../domain/body'
import { type BodyCatalogSource } from './bodyStateStore'
import { createPhysicalSceneScale } from './ephemerisSceneMapping'
import { createWebBodyCatalogSource } from './webBodyCatalogSource'
import { createWebDatasetLoader } from './webDatasetLoader'
import { createWebEphemerisProvider } from './webEphemerisProvider'

export type WebBodyCatalogRuntimeEnv = {
  readonly VITE_WEB_EPHEMERIS_DATA_BASE_URL?: string
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
  const sceneUnitsPerKilometer = getConfiguredSceneUnitsPerKilometer(env)

  if (!dataBaseUrl || sceneUnitsPerKilometer === undefined) {
    return undefined
  }

  const datasetLoader = createWebDatasetLoader(
    {
      manifestUrl: `${dataBaseUrl}/manifest.json`,
      bodyMetadataUrl: `${dataBaseUrl}/body-metadata.json`
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
    return undefined
  }

  return value.replace(/[\\/]+$/, '')
}

export function getConfiguredSceneUnitsPerKilometer(
  env: WebBodyCatalogRuntimeEnv
) {
  const value = env.VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER?.trim()

  if (!value) {
    return undefined
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined
  }

  return parsed
}
