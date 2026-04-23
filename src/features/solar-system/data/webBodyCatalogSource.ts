import { type BodyEphemerisProvider } from '../domain/body'
import {
  type PhysicalSceneScale,
  mapEphemerisSnapshotToSceneSnapshot,
  mapPhysicalMetadataToScaledBodyMetadata
} from './ephemerisSceneMapping'
import { resolveBodyCatalog, type BodyCatalogSource } from './bodyStateStore'
import { type WebDatasetLoader } from './webDatasetLoader'

export type WebBodyCatalogSourceOptions = {
  ephemerisProvider: BodyEphemerisProvider
  datasetLoader: WebDatasetLoader
  scale: PhysicalSceneScale
}

export function createWebBodyCatalogSource({
  ephemerisProvider,
  datasetLoader,
  scale
}: WebBodyCatalogSourceOptions): BodyCatalogSource {
  let scaledMetadataPromise: Promise<ReturnType<typeof mapPhysicalMetadataToScaledBodyMetadata>>
    | undefined

  return {
    loadBodyCatalogAtUtc: async (utc) => {
      const [metadata, ephemerisSnapshot] = await Promise.all([
        loadScaledMetadata(),
        ephemerisProvider.loadSnapshotAtUtc(utc)
      ])
      const snapshot = mapEphemerisSnapshotToSceneSnapshot(ephemerisSnapshot, scale)

      return resolveBodyCatalog(metadata, snapshot)
    },
    prefetchAroundUtc: async (utc) => {
      await Promise.all([loadScaledMetadata(), ephemerisProvider.prefetchAroundUtc(utc)])
    }
  }

  function loadScaledMetadata() {
    if (scaledMetadataPromise) {
      return scaledMetadataPromise
    }

    scaledMetadataPromise = datasetLoader
      .load()
      .then((dataset) =>
        mapPhysicalMetadataToScaledBodyMetadata(
          dataset.bodyMetadata.bodies,
          scale,
          ephemerisProvider.getBodyMetadata()
        )
      )
      .catch((error) => {
        scaledMetadataPromise = undefined
        throw error
      })

    return scaledMetadataPromise
  }
}
