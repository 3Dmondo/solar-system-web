import {
  parseWebEphemerisManifest,
  type WebEphemerisManifest
} from './webEphemeris'
import {
  parseWebBodyMetadataFile,
  type WebBodyMetadataFile
} from './webBodyMetadata'

export type WebDatasetUrls = {
  manifestUrl: string
  bodyMetadataUrl: string
}

export type WebDataset = {
  manifest: WebEphemerisManifest
  bodyMetadata: WebBodyMetadataFile
}

export type WebDatasetLoader = {
  load: () => Promise<WebDataset>
  clearCache: () => void
}

export function createWebDatasetLoader(
  urls: WebDatasetUrls,
  fetchImpl: typeof fetch = fetch
): WebDatasetLoader {
  let datasetPromise: Promise<WebDataset> | null = null

  return {
    load: () => {
      if (!datasetPromise) {
        datasetPromise = loadWebDataset(urls, fetchImpl).catch((error) => {
          datasetPromise = null
          throw error
        })
      }

      return datasetPromise
    },
    clearCache: () => {
      datasetPromise = null
    }
  }
}

async function loadWebDataset(
  urls: WebDatasetUrls,
  fetchImpl: typeof fetch
): Promise<WebDataset> {
  const [manifest, bodyMetadata] = await Promise.all([
    loadJson(urls.manifestUrl, fetchImpl).then(parseWebEphemerisManifest),
    loadJson(urls.bodyMetadataUrl, fetchImpl).then(parseWebBodyMetadataFile)
  ])

  return {
    manifest,
    bodyMetadata
  }
}

async function loadJson(url: string, fetchImpl: typeof fetch) {
  const response = await fetchImpl(url)

  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
