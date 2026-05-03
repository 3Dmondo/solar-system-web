export type BodyShapeNormalization = {
  position: [number, number, number]
  scale: number
}

export function computeBodyShapeNormalization({
  bodyRadius,
  sourceBoundingRadius,
  sourceCenter
}: {
  bodyRadius: number
  sourceBoundingRadius: number
  sourceCenter: [number, number, number]
}): BodyShapeNormalization {
  const scale =
    Number.isFinite(sourceBoundingRadius) && sourceBoundingRadius > 0
      ? bodyRadius / sourceBoundingRadius
      : 1

  return {
    position: [
      -sourceCenter[0] * scale,
      -sourceCenter[1] * scale,
      -sourceCenter[2] * scale
    ],
    scale
  }
}

