import { describe, expect, it } from 'vitest'
import { hasBodyTexture } from './bodyTextures'

describe('body textures', () => {
  it('enables approved reduced moon textures', () => {
    expect(hasBodyTexture('ganymede')).toBe(true)
    expect(hasBodyTexture('callisto')).toBe(true)
    expect(hasBodyTexture('rhea')).toBe(true)
    expect(hasBodyTexture('titan')).toBe(true)
    expect(hasBodyTexture('iapetus')).toBe(true)
    expect(hasBodyTexture('umbriel')).toBe(true)
    expect(hasBodyTexture('titania')).toBe(true)
    expect(hasBodyTexture('oberon')).toBe(true)
    expect(hasBodyTexture('triton')).toBe(true)
  })

  it('keeps fast moons without dedicated local texture assets on the solid fallback path', () => {
    expect(hasBodyTexture('phobos')).toBe(false)
    expect(hasBodyTexture('deimos')).toBe(false)
    expect(hasBodyTexture('io')).toBe(false)
    expect(hasBodyTexture('europa')).toBe(false)
    expect(hasBodyTexture('mimas')).toBe(false)
    expect(hasBodyTexture('enceladus')).toBe(false)
    expect(hasBodyTexture('tethys')).toBe(false)
    expect(hasBodyTexture('dione')).toBe(false)
    expect(hasBodyTexture('ariel')).toBe(false)
    expect(hasBodyTexture('miranda')).toBe(false)
  })
})
