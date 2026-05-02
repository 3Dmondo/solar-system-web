import { describe, expect, it } from 'vitest';
import {
  computeSunImpostorOpacity,
  SUN_IMPOSTOR_THRESHOLDS
} from './sunImpostorOpacity';

describe('computeSunImpostorOpacity', () => {
  it('shows the impostor fully below the lower screen-space radius threshold', () => {
    expect(
      computeSunImpostorOpacity(SUN_IMPOSTOR_THRESHOLDS.fullImpostorBelowPx)
    ).toBe(1);
    expect(
      computeSunImpostorOpacity(SUN_IMPOSTOR_THRESHOLDS.fullImpostorBelowPx - 1)
    ).toBe(1);
  });

  it('hides the impostor at and above the upper screen-space radius threshold', () => {
    expect(
      computeSunImpostorOpacity(SUN_IMPOSTOR_THRESHOLDS.fullSphereAbovePx)
    ).toBe(0);
    expect(
      computeSunImpostorOpacity(SUN_IMPOSTOR_THRESHOLDS.fullSphereAbovePx + 1)
    ).toBe(0);
  });

  it('smoothly blends between thresholds', () => {
    const midpoint =
      (SUN_IMPOSTOR_THRESHOLDS.fullImpostorBelowPx +
        SUN_IMPOSTOR_THRESHOLDS.fullSphereAbovePx) /
      2;

    expect(computeSunImpostorOpacity(midpoint)).toBeCloseTo(0.5, 9);
  });
});
