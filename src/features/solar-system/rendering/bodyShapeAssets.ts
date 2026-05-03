import { type BodyId } from '../domain/body'

export type BodyShapeAsset = {
  bodyId: BodyId
  runtimeUrl: string
  runtimeFormat: 'glb'
  runtimeTier: 'optimized-glb'
  runtimeReady: boolean
  sourceFormat: 'gltf'
  sourceListedSizeMb: number
  sourceUrl: string
  creditLine: string
}

const bodyShapeAssets: Partial<Record<BodyId, BodyShapeAsset>> = {
  phobos: {
    bodyId: 'phobos',
    runtimeUrl: `${import.meta.env.BASE_URL}meshes/phobos.glb`,
    runtimeFormat: 'glb',
    runtimeTier: 'optimized-glb',
    runtimeReady: true,
    sourceFormat: 'gltf',
    sourceListedSizeMb: 3.68,
    sourceUrl: 'https://science.nasa.gov/resource/phobos-mars-moon-3d-model/',
    creditLine: 'NASA/JPL-Caltech'
  },
  deimos: {
    bodyId: 'deimos',
    runtimeUrl: `${import.meta.env.BASE_URL}meshes/deimos.glb`,
    runtimeFormat: 'glb',
    runtimeTier: 'optimized-glb',
    runtimeReady: true,
    sourceFormat: 'gltf',
    sourceListedSizeMb: 1.53,
    sourceUrl: 'https://science.nasa.gov/resource/deimos-mars-moon-3d-model/',
    creditLine: 'NASA/JPL-Caltech'
  }
}

export function getBodyShapeAsset(bodyId: BodyId): BodyShapeAsset | undefined {
  return bodyShapeAssets[bodyId]
}

export function getRenderableBodyShapeAsset(
  bodyId: BodyId
): BodyShapeAsset | undefined {
  const asset = getBodyShapeAsset(bodyId)
  return asset?.runtimeReady ? asset : undefined
}

export function hasBodyShapeAsset(bodyId: BodyId): boolean {
  return Object.prototype.hasOwnProperty.call(bodyShapeAssets, bodyId)
}

export function hasRenderableBodyShapeAsset(bodyId: BodyId): boolean {
  return getRenderableBodyShapeAsset(bodyId) !== undefined
}
