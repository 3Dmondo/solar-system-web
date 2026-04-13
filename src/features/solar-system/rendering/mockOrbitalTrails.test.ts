import { describe, expect, it } from 'vitest';
import { mockedSolarSystemBodies } from '../data/mockBodyCatalog';
import { buildCircularTrailPositions, getMockOrbitalTrails } from './mockOrbitalTrails';

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
});

describe('buildCircularTrailPositions', () => {
  it('builds a closed ring worth of evenly spaced positions', () => {
    const positions = buildCircularTrailPositions(5, 0.25, 12);

    expect(positions).toHaveLength(36);
    expect(positions[1]).toBeCloseTo(0.25);
    expect(positions[0]).toBeCloseTo(5);
    expect(positions[2]).toBeCloseTo(0);
  });
});
