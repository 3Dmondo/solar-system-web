// Impostor thresholds in screen-space pixels (radius)
const FULL_IMPOSTOR_BELOW_PX = 3;
const FULL_SPHERE_ABOVE_PX = 15;

/**
 * Computes the opacity for the Sun impostor based on screen-space radius.
 * Returns 0 when sphere is fully visible, 1 when impostor should be fully visible,
 * and a smooth blend in between.
 */
export function computeSunImpostorOpacity(screenSpaceRadius: number): number {
  if (screenSpaceRadius >= FULL_SPHERE_ABOVE_PX) {
    return 0;
  }
  if (screenSpaceRadius <= FULL_IMPOSTOR_BELOW_PX) {
    return 1;
  }

  const t =
    (screenSpaceRadius - FULL_IMPOSTOR_BELOW_PX) /
    (FULL_SPHERE_ABOVE_PX - FULL_IMPOSTOR_BELOW_PX);
  return 1 - t * t * (3 - 2 * t);
}

/**
 * Configuration for Sun impostor visibility thresholds.
 */
export const SUN_IMPOSTOR_THRESHOLDS = {
  /** Full impostor when Sun radius below this (pixels) */
  fullImpostorBelowPx: FULL_IMPOSTOR_BELOW_PX,
  /** Full sphere (no impostor) when Sun radius above this (pixels) */
  fullSphereAbovePx: FULL_SPHERE_ABOVE_PX
} as const;
