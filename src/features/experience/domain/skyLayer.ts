const SKY_NEAR_PADDING = 1.2
const SKY_FAR_PADDING = 0.98

/**
 * Derives a sky-shell radius that stays inside the camera frustum.
 * The shell is centered on the camera and rendered around the scene.
 */
export function getSkyShellRadius(near: number, far: number) {
  const safeNear = Number.isFinite(near) && near > 0 ? near : 1
  const safeFar = Number.isFinite(far) && far > safeNear ? far : safeNear + 1

  const minRadius = safeNear * SKY_NEAR_PADDING
  const maxRadius = safeFar * SKY_FAR_PADDING

  if (maxRadius > minRadius) {
    return maxRadius
  }

  return safeNear + (safeFar - safeNear) * 0.5
}
