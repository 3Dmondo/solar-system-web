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

  it('enables approved restored fast-moon textures', () => {
    expect(hasBodyTexture('phobos')).toBe(true)
    expect(hasBodyTexture('deimos')).toBe(true)
    expect(hasBodyTexture('io')).toBe(true)
    expect(hasBodyTexture('europa')).toBe(true)
    expect(hasBodyTexture('mimas')).toBe(true)
    expect(hasBodyTexture('enceladus')).toBe(true)
    expect(hasBodyTexture('tethys')).toBe(true)
    expect(hasBodyTexture('dione')).toBe(true)
    expect(hasBodyTexture('ariel')).toBe(true)
    expect(hasBodyTexture('miranda')).toBe(true)
  })
})
