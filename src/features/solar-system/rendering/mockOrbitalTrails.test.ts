import { describe, expect, it } from 'vitest';
import {
  getMockBodySnapshot,
  mergeBodySnapshotWithMetadata
} from '../data/mockBodyCatalog';
import { buildCircularTrailPoints, getMockOrbitalTrails } from './mockOrbitalTrails';

const mockedSolarSystemBodies = mergeBodySnapshotWithMetadata(getMockBodySnapshot());

function toBrightness(hex: string) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);

  return ((value >> 16) & 255) + ((value >> 8) & 255) + (value & 255);
}

describe('getMockOrbitalTrails', () => {
  it('creates mocked trails for all orbiting bodies except the sun', () => {
    const trails = getMockOrbitalTrails(mockedSolarSystemBodies);

    expect(trails).toHaveLength(9);
    expect(trails.some((trail) => trail.bodyId === 'sun')).toBe(false);
  });

  it('anchors the moon trail around earth', () => {
    const trails = getMockOrbitalTrails(mockedSolarSystemBodies);
    const earth = mockedSolarSystemBodies.find((body) => body.id === 'earth');
    const moonTrail = trails.find((trail) => trail.bodyId === 'moon');

    expect(earth).toBeDefined();
    expect(moonTrail).toBeDefined();
    expect(moonTrail?.center).toEqual(earth?.position);
    expect(moonTrail?.radius).toBeGreaterThan(0);
  });

  it('keeps distant trails dimmer than the tighter inner-system trails', () => {
    const trails = getMockOrbitalTrails(mockedSolarSystemBodies);
    const mercuryTrail = trails.find((trail) => trail.bodyId === 'mercury');
    const neptuneTrail = trails.find((trail) => trail.bodyId === 'neptune');

    expect(toBrightness(mercuryTrail?.color ?? '#000000')).toBeGreaterThan(
      toBrightness(neptuneTrail?.color ?? '#ffffff')
    );
  });
});

describe('buildCircularTrailPoints', () => {
  it('builds a closed ring worth of evenly spaced points', () => {
    const points = buildCircularTrailPoints(5, 0.25, 12);

    expect(points).toHaveLength(13);
    expect(points[0]?.[1]).toBeCloseTo(0.25);
    expect(points[0]?.[0]).toBeCloseTo(5);
    expect(points[0]?.[2]).toBeCloseTo(0);
    expect(points.at(-1)).toEqual(points[0]);
  });
});
