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
    ],
    trails: []
  }
)

const physicallyScaledCatalog: ResolvedBodyCatalog = {
  metadata: [],
  snapshot: {
    capturedAt: '2026-04-22T00:00:00.000Z',
    bodies: [],
    trails: []
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

const jupiterSystemCatalog = resolveBodyCatalog(
  presentationBodyMetadata,
  {
    capturedAt: '2026-04-22T00:00:00.000Z',
    bodies: [
      {
        id: 'jupiter',
        position: [1000, 0, 0]
      },
      {
        id: 'ganymede',
        position: [1120, 0, 0]
      },
      {
        id: 'callisto',
        position: [1000, 0, 220]
      }
    ],
    trails: []
  }
);

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

  it('targets the parent body for a planetary system view', () => {
    expect(getFocusTarget('system:jupiter', jupiterSystemCatalog)).toEqual([1000, 0, 0]);
  });

  it('frames the loaded satellites from farther away than a normal body focus', () => {
    const aspect = 16 / 9;
    const systemDistance = getFocusDistance('system:jupiter', jupiterSystemCatalog, aspect);
    const bodyDistance = getFocusDistance('jupiter', jupiterSystemCatalog, aspect);
    const halfVerticalFieldOfView = (40 * Math.PI) / 360;
    const halfHorizontalFieldOfView = Math.atan(Math.tan(halfVerticalFieldOfView) * aspect);
    const limitingHalfFieldOfView = Math.min(halfVerticalFieldOfView, halfHorizontalFieldOfView);
    const framedRadius = systemDistance * Math.sin(limitingHalfFieldOfView);

    expect(systemDistance).toBeGreaterThan(bodyDistance);
    expect(framedRadius).toBeGreaterThanOrEqual((220 + 0.22) * 1.25);
  });

  it('uses the parent focus direction for planetary system camera positions', () => {
    const cameraPosition = getFocusCameraPosition('system:jupiter', jupiterSystemCatalog, 16 / 9);
    const systemDistance = getFocusDistance('system:jupiter', jupiterSystemCatalog, 16 / 9);
    const jupiterFocusOffset = presentationBodyMetadata.find((body) => body.id === 'jupiter')!
      .focusOffset;
    const focusOffsetLength = Math.hypot(...jupiterFocusOffset);

    expect(cameraPosition[0]).toBeCloseTo(1000, 9);
    expect(cameraPosition[1]).toBeCloseTo(
      systemDistance * (jupiterFocusOffset[1] / focusOffsetLength),
      6
    );
    expect(cameraPosition[2]).toBeCloseTo(
      systemDistance * (jupiterFocusOffset[2] / focusOffsetLength),
      6
    );
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

  it('keeps focused-view clip planes beyond long background trails', () => {
    const focusedCatalog: ResolvedBodyCatalog = {
      ...physicallyScaledCatalog,
      snapshot: {
        ...physicallyScaledCatalog.snapshot,
        trails: [
          {
            id: 'saturn',
            positions: [
              [1_430_000, 0, 0],
              [1_430_000, 0, -1_500_000],
              [1_430_000, 0, -3_000_000]
            ]
          }
        ]
      }
    };
    const cameraPosition: [number, number, number] = [4_500_000, 0, 250];
    const farthestTrailPoint: [number, number, number] = [1_430_000, 0, -3_000_000];
    const farthestTrailPointDistance = Math.hypot(
      cameraPosition[0] - farthestTrailPoint[0],
      cameraPosition[1] - farthestTrailPoint[1],
      cameraPosition[2] - farthestTrailPoint[2]
    );

    const clipPlanes = getCameraClipPlanes(
      'neptune',
      cameraPosition,
      [4_500_000, 0, 0],
      focusedCatalog
    );

    expect(clipPlanes.far).toBeGreaterThan(farthestTrailPointDistance);
  });
});
