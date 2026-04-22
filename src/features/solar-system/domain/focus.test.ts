import { describe, expect, it } from 'vitest';
import {
  getCameraClipPlanes,
  getFocusCameraPosition,
  getFocusCameraPositionForViewDirection,
  getFocusDistance,
  getFocusTarget,
  getFocusTransitionProfile
} from './focus';
import { EMPTY_RESOLVED_BODY_CATALOG, resolveBodyCatalog, type ResolvedBodyCatalog } from '../data/bodyStateStore'
import { presentationBodyMetadata } from '../data/bodyPresentation'

const focusCatalog = resolveBodyCatalog(
  presentationBodyMetadata,
  {
    capturedAt: '2026-04-22T00:00:00.000Z',
    bodies: [
      {
        id: 'sun',
        position: [0, 0, 0]
      },
      {
        id: 'earth',
        position: [100, 0, 50]
      },
      {
        id: 'moon',
        position: [102, -0.2, 51]
      },
      {
        id: 'saturn',
        position: [400, 0, -150]
      }
    ]
  }
)

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
    expect(getFocusTarget('earth', focusCatalog)).toEqual([100, 0, 50])
  });

  it('returns the selected body position for the Moon', () => {
    expect(getFocusTarget('moon', focusCatalog)).toEqual([102, -0.2, 51])
  });

  it('returns a body-specific camera position for Saturn', () => {
    const saturnCameraPosition = getFocusCameraPosition('saturn', focusCatalog)

    expect(saturnCameraPosition[0]).toBeCloseTo(400, 9)
    expect(saturnCameraPosition[1]).toBeCloseTo(1.044275439, 9)
    expect(saturnCameraPosition[2]).toBeCloseTo(-136.54045, 6)
  });

  it('returns the overview camera position', () => {
    expect(getFocusCameraPosition('overview', EMPTY_RESOLVED_BODY_CATALOG)).toEqual([0, 14, 46])
  });

  it('expands the overview camera distance for large physically scaled scenes', () => {
    const overviewPosition = getFocusCameraPosition('overview', physicallyScaledCatalog, 1);

    expect(Math.hypot(...overviewPosition)).toBeGreaterThan(10_000_000);
  });

  it('returns a focus distance based on the configured body-radius multiplier', () => {
    expect(getFocusDistance('earth', focusCatalog)).toBeCloseTo(7.2, 9)
  });

  it('preserves the current view direction when deriving a focused camera position', () => {
    const earthCameraPosition = getFocusCameraPositionForViewDirection('earth', [0, 14, 46], focusCatalog)

    expect(earthCameraPosition[0]).toBeCloseTo(100, 9)
    expect(earthCameraPosition[1]).toBeCloseTo(2.096363634, 9)
    expect(earthCameraPosition[2]).toBeCloseTo(56.888052, 6)
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
