import { describe, expect, it } from 'vitest'
import {
  getBodyShapeAsset,
  getRenderableBodyShapeAsset,
  hasBodyShapeAsset,
  hasRenderableBodyShapeAsset
} from './bodyShapeAssets'

describe('body shape assets', () => {
  it('maps approved first-pass irregular moons to optimized GLB targets', () => {
    expect(getBodyShapeAsset('phobos')).toMatchObject({
      bodyId: 'phobos',
      runtimeUrl: '/meshes/phobos.glb',
      runtimeFormat: 'glb',
      runtimeTier: 'optimized-glb',
      runtimeReady: true,
      sourceFormat: 'gltf',
      sourceListedSizeMb: 3.68,
      creditLine: 'NASA/JPL-Caltech'
    })

    expect(getBodyShapeAsset('deimos')).toMatchObject({
      bodyId: 'deimos',
      runtimeUrl: '/meshes/deimos.glb',
      runtimeFormat: 'glb',
      runtimeTier: 'optimized-glb',
      runtimeReady: true,
      sourceFormat: 'gltf',
      sourceListedSizeMb: 1.53,
      creditLine: 'NASA/JPL-Caltech'
    })
  })

  it('keeps spherical rendering as the default for bodies without approved shape assets', () => {
    expect(hasBodyShapeAsset('moon')).toBe(false)
    expect(hasBodyShapeAsset('mars')).toBe(false)
    expect(getBodyShapeAsset('miranda')).toBeUndefined()
  })

  it('enables runtime rendering after reviewed GLB files are committed', () => {
    expect(hasRenderableBodyShapeAsset('phobos')).toBe(true)
    expect(hasRenderableBodyShapeAsset('deimos')).toBe(true)
    expect(getRenderableBodyShapeAsset('phobos')).toMatchObject({
      bodyId: 'phobos',
      runtimeReady: true
    })
  })
})
