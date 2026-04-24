import { describe, expect, it } from 'vitest'
import { getSunLightDirection } from './sunLighting'

describe('sunLighting', () => {
  it('points from a body toward the live Sun position instead of scene origin', () => {
    const direction = getSunLightDirection([10, -5, 2], [4, 1, -1])

    expect(direction.x).toBeCloseTo(-0.6666666667, 9)
    expect(direction.y).toBeCloseTo(0.6666666667, 9)
    expect(direction.z).toBeCloseTo(-0.3333333333, 9)
  })

  it('keeps the origin-based fallback for callers that do not pass a Sun position', () => {
    const direction = getSunLightDirection([0, 3, 4])

    expect(direction.x).toBeCloseTo(0, 9)
    expect(direction.y).toBeCloseTo(-0.6, 9)
    expect(direction.z).toBeCloseTo(-0.8, 9)
  })
})
