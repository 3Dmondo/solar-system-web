import { describe, expect, it } from 'vitest'
import { computeBodyShapeNormalization } from './bodyShapeScaling'

describe('body shape scaling', () => {
  it('normalizes imported mesh bounds to the app body radius', () => {
    expect(
      computeBodyShapeNormalization({
        bodyRadius: 0.055,
        sourceBoundingRadius: 11,
        sourceCenter: [2, -4, 6]
      })
    ).toEqual({
      position: [-0.01, 0.02, -0.03],
      scale: 0.005
    })
  })

  it('falls back to identity scale for invalid imported bounds', () => {
    expect(
      computeBodyShapeNormalization({
        bodyRadius: 0.055,
        sourceBoundingRadius: 0,
        sourceCenter: [2, -4, 6]
      })
    ).toEqual({
      position: [-2, 4, -6],
      scale: 1
    })
  })
})

