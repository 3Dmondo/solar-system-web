import { describe, expect, it } from 'vitest';
import {
  getCameraClipPlanes,
  getFocusCameraPosition,
  getFocusCameraPositionForViewDirection,
  getFocusDistance,
  getFocusTarget,
  getFocusTransitionProfile
} from './focus';
import { type ResolvedBodyCatalog } from '../data/bodyStateStore';

const physicallyScaledCatalog: ResolvedBodyCatalog = {
  metadata: [],
  snapshot: {
    capturedAt: '2026-04-22T00:00:00.000Z',
    bodies: []
  },
  bodies: [
    {
      id: 'sun',
      displayName: 'Sun',
      color: '#ffd27a',
      radius: 695.7,
      focusOffset: [0, 235.4, 2342],
      position: [0, 0, 0]
    },
    {
      id: 'earth',
      displayName: 'Earth',
      color: '#3a7bd5',
      radius: 6.371,
      focusOffset: [0, 2.2, 28.2],
      position: [150_000, 0, 0]
    },
    {
      id: 'saturn',
      displayName: 'Saturn',
      color: '#cdb075',
      radius: 58.3,
      focusOffset: [0, 19.4, 249.7],
      hasRings: true,
      position: [1_430_000, 0, 0]
    },
    {
      id: 'neptune',
      displayName: 'Neptune',
      color: '#557fda',
      radius: 24.623,
      focusOffset: [0, 7.8, 106.3],
      position: [4_500_000, 0, 0]
    }
  ]
};

describe('focus helpers', () => {
  it('returns the selected body position as the focus target', () => {
    expect(getFocusTarget('earth')).toEqual([-7.3723683986009245, 0, 5.162187927159417]);
  });

  it('returns the selected body position for the Moon', () => {
    expect(getFocusTarget('moon')).toEqual([-6.3, -0.18, 5.65]);
  });

  it('returns a body-specific camera position for Saturn', () => {
    const saturnCameraPosition = getFocusCameraPosition('saturn');

    expect(saturnCameraPosition[0]).toBeCloseTo(19.424847042896396, 12);
    expect(saturnCameraPosition[1]).toBeCloseTo(1.04427543854535, 12);
    expect(saturnCameraPosition[2]).toBeCloseTo(3.13117571551716, 12);
  });

  it('returns the overview camera position', () => {
    expect(getFocusCameraPosition('overview')).toEqual([0, 14, 46]);
  });

  it('expands the overview camera distance for large physically scaled scenes', () => {
    const overviewPosition = getFocusCameraPosition('overview', physicallyScaledCatalog, 1);

    expect(Math.hypot(...overviewPosition)).toBeGreaterThan(10_000_000);
  });

  it('returns a focus distance based on the configured body-radius multiplier', () => {
    expect(getFocusDistance('earth')).toBeCloseTo(7.2, 9);
  });

  it('preserves the current view direction when deriving a focused camera position', () => {
    const earthCameraPosition = getFocusCameraPositionForViewDirection('earth', [0, 14, 46]);

    expect(earthCameraPosition[0]).toBeCloseTo(-7.3723683986009245, 12);
    expect(earthCameraPosition[1]).toBeCloseTo(2.09636363363541, 12);
    expect(earthCameraPosition[2]).toBeCloseTo(12.0502398662472, 12);
  });

  it('uses a target-leading profile when moving from overview into a body', () => {
    expect(getFocusTransitionProfile('overview', 'earth')).toEqual({
      cameraEasingRate: 3.8,
      targetEasingRate: 5.6,
      settleDistanceSquared: 0.0001
    });
  });

  it('uses a faster pullback profile when returning to overview', () => {
    expect(getFocusTransitionProfile('earth', 'overview')).toEqual({
      cameraEasingRate: 5.4,
      targetEasingRate: 4.2,
      settleDistanceSquared: 0.0001
    });
  });

  it('uses a balanced profile when switching between focused bodies', () => {
    expect(getFocusTransitionProfile('earth', 'saturn')).toEqual({
      cameraEasingRate: 4.5,
      targetEasingRate: 4.5,
      settleDistanceSquared: 0.0001
    });
  });

  it('derives clip planes that cover the full physical scene without clipping the focused body', () => {
    const clipPlanes = getCameraClipPlanes(
      'earth',
      [150_000, 0, 28.2],
      [150_000, 0, 0],
      physicallyScaledCatalog
    );

    expect(clipPlanes.near).toBeGreaterThan(1);
    expect(clipPlanes.far).toBeGreaterThan(4_000_000);
    expect(clipPlanes.far).toBeGreaterThan(clipPlanes.near);
  });
});
