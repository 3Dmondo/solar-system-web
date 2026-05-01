import { type BodyEphemerisProvider } from '../domain/body'
import { measureRuntimeDebugMetric } from '../../experience/debug/runtimeDebugMetrics'
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
    loadBodyCatalogAtUtc: async (utc, options) => {
      const [metadata, ephemerisSnapshot] = await Promise.all([
        loadScaledMetadata(),
        ephemerisProvider.loadSnapshotAtUtc(utc, {
          trailOriginBodyId: options?.trailOriginBodyId ?? null
        })
      ])
      const snapshot = mapEphemerisSnapshotToSceneSnapshot(ephemerisSnapshot, scale)

      return measureRuntimeDebugMetric('catalogRefresh', () =>
        resolveBodyCatalog(metadata, snapshot)
      )
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
      .then((dataset) => {
        const loadedBodyIds = new Set(dataset.manifest.bodies.map((body) => body.bodyId))
        const loadedPresentationMetadata = ephemerisProvider
          .getBodyMetadata()
          .filter((metadata) => loadedBodyIds.has(metadata.id))

        return mapPhysicalMetadataToScaledBodyMetadata(
          dataset.bodyMetadata.bodies,
          scale,
          loadedPresentationMetadata
        )
      })
      .catch((error) => {
        scaledMetadataPromise = undefined
        throw error
      })

    return scaledMetadataPromise
  }
}
