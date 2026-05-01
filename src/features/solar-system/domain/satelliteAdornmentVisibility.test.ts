import { describe, expect, it } from 'vitest';
import { shouldShowSatelliteAdornment } from './satelliteAdornmentVisibility';

describe('shouldShowSatelliteAdornment', () => {
  it('always shows non-satellite adornments', () => {
    expect(shouldShowSatelliteAdornment({
      isSatellite: false,
      parentScreenRadiusPx: 100,
      screenSeparationFromParentPx: 0
    })).toBe(true);
  });

  it('always shows forced satellite adornments', () => {
    expect(shouldShowSatelliteAdornment({
      isSatellite: true,
      forcedVisible: true,
      parentScreenRadiusPx: 100,
      screenSeparationFromParentPx: 0
    })).toBe(true);
  });

  it('hides satellite adornments when they are too close to the parent on screen', () => {
    expect(shouldShowSatelliteAdornment({
      isSatellite: true,
      parentScreenRadiusPx: 20,
      screenSeparationFromParentPx: 30
    })).toBe(false);
  });

  it('shows satellite adornments once the satellite separates from the parent', () => {
    expect(shouldShowSatelliteAdornment({
      isSatellite: true,
      parentScreenRadiusPx: 20,
      screenSeparationFromParentPx: 60
    })).toBe(true);
  });

  it('uses parent apparent size when the parent is large on screen', () => {
    expect(shouldShowSatelliteAdornment({
      isSatellite: true,
      parentScreenRadiusPx: 80,
      screenSeparationFromParentPx: 80
    })).toBe(false);

    expect(shouldShowSatelliteAdornment({
      isSatellite: true,
      parentScreenRadiusPx: 80,
      screenSeparationFromParentPx: 130
    })).toBe(true);
  });
});
