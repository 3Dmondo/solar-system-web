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
  return {
    loadBodyCatalogAtUtc: async (utc) => {
      const [dataset, ephemerisSnapshot] = await Promise.all([
        datasetLoader.load(),
        ephemerisProvider.loadSnapshotAtUtc(utc)
      ])
      const metadata = mapPhysicalMetadataToScaledBodyMetadata(
        dataset.bodyMetadata.bodies,
        scale,
        ephemerisProvider.getBodyMetadata()
      )
      const snapshot = mapEphemerisSnapshotToSceneSnapshot(ephemerisSnapshot, scale)

      return resolveBodyCatalog(metadata, snapshot)
    },
    prefetchAroundUtc: async (utc) => {
      await Promise.all([datasetLoader.load(), ephemerisProvider.prefetchAroundUtc(utc)])
    }
  }
}
