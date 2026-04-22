import { describe, expect, it } from 'vitest';
import { getControlDistanceRange, getControlProfile } from './controlProfile';
import { type ResolvedBodyCatalog } from '../../solar-system/data/bodyStateStore';

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
      id: 'neptune',
      displayName: 'Neptune',
      color: '#557fda',
      radius: 24.623,
      focusOffset: [0, 7.8, 106.3],
      position: [4_500_000, 0, 0]
    }
  ]
};

describe('getControlProfile', () => {
  it('returns a mobile-friendly profile for coarse pointers', () => {
    expect(getControlProfile(true)).toMatchObject({
      dampingFactor: 0.12,
      rotateSpeed: 0.85,
      zoomSpeed: 0.9
    });
  });

  it('returns a desktop-friendly profile for fine pointers', () => {
    expect(getControlProfile(false)).toMatchObject({
      dampingFactor: 0.09,
      rotateSpeed: 0.65,
      zoomSpeed: 0.8
    });
  });

  it('expands overview zoom limits for the physically scaled runtime', () => {
    const range = getControlDistanceRange('overview', physicallyScaledCatalog, false);

    expect(range.minDistance).toBeGreaterThan(4_500_000);
    expect(range.maxDistance).toBeGreaterThan(range.minDistance);
  });

  it('keeps the focused-body minimum distance outside the body while allowing zoom back out', () => {
    const range = getControlDistanceRange('earth', physicallyScaledCatalog, false);
    const earth = physicallyScaledCatalog.bodies.find((body) => body.id === 'earth');

    expect(earth).toBeDefined();
    expect(range.minDistance).toBeGreaterThan(earth?.radius ?? 0);
    expect(range.maxDistance).toBeGreaterThan(10_000_000);
  });
});
