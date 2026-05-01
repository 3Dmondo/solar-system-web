import { describe, expect, it } from 'vitest';
import { transformCatalogToFrame } from './referenceFrameTransform';
import {
  REFERENCE_FRAMES,
  getReferenceFrame,
  getReferenceFramesForLoadedBodies,
  type ReferenceFrame
} from '../domain/referenceFrame';
import type { ResolvedBodyCatalog } from './bodyStateStore';

describe('transformCatalogToFrame', () => {
  // Moon trail positions are parent-relative (moon - earth at each sample time)
  // since the provider computes satellite trails relative to their parent
  const createMockCatalog = (): ResolvedBodyCatalog => ({
    metadata: [
      { id: 'sun', displayName: 'Sun', color: '#fff', radius: 1, focusOffset: [0, 0, 1] },
      { id: 'earth', displayName: 'Earth', color: '#0ff', radius: 0.1, focusOffset: [0, 0, 1] },
      { id: 'moon', displayName: 'Moon', color: '#888', radius: 0.01, focusOffset: [0, 0, 1] },
      { id: 'mars', displayName: 'Mars', color: '#f00', radius: 0.05, focusOffset: [0, 0, 1] }
    ],
    snapshot: {
      capturedAt: '2024-01-01T00:00:00Z',
      bodies: [
        { id: 'sun', position: [0, 0, 0] },
        { id: 'earth', position: [100, 0, 0] },
        { id: 'moon', position: [100.5, 0, 0] },  // 0.5 units from Earth
        { id: 'mars', position: [150, 0, 0] }
      ],
      trails: [
        { id: 'sun', positions: [] },
        { id: 'earth', positions: [[95, 0, 0], [100, 0, 0]] },
        // Moon trail is parent-relative: [moon - earth] at each sample time
        { id: 'moon', positions: [[0.4, 0.1, 0], [0.5, 0, 0]] },
        { id: 'mars', positions: [[145, 0, 0], [150, 0, 0]] }
      ]
    },
    bodies: [
      { id: 'sun', displayName: 'Sun', color: '#fff', radius: 1, focusOffset: [0, 0, 1], position: [0, 0, 0] },
      { id: 'earth', displayName: 'Earth', color: '#0ff', radius: 0.1, focusOffset: [0, 0, 1], position: [100, 0, 0] },
      { id: 'moon', displayName: 'Moon', color: '#888', radius: 0.01, focusOffset: [0, 0, 1], position: [100.5, 0, 0] },
      { id: 'mars', displayName: 'Mars', color: '#f00', radius: 0.05, focusOffset: [0, 0, 1], position: [150, 0, 0] }
    ]
  });

  describe('SSB frame (no position transformation)', () => {
    it('keeps body positions unchanged', () => {
      const catalog = createMockCatalog();
      const ssbFrame = getReferenceFrame('ssb');

      const result = transformCatalogToFrame(catalog, ssbFrame);

      expect(result.snapshot.bodies).toEqual(catalog.snapshot.bodies);
    });

    it('transforms satellite trails to parent-relative', () => {
      const catalog = createMockCatalog();
      const ssbFrame = getReferenceFrame('ssb');

      const result = transformCatalogToFrame(catalog, ssbFrame);

      // Moon trail (parent-relative: [0.4,0.1,0],[0.5,0,0]) is offset by Earth's current position
      // Earth is at [100,0,0], so transformed positions are [100.4,0.1,0],[100.5,0,0]
      const moonTrail = result.snapshot.trails.find((t) => t.id === 'moon');
      expect(moonTrail).toBeDefined();

      const lastPos = moonTrail!.positions[moonTrail!.positions.length - 1];
      expect(lastPos![0]).toBeCloseTo(100.5, 1); // Moon's orbit position around Earth
    });

    it('keeps planet trails unchanged', () => {
      const catalog = createMockCatalog();
      const ssbFrame = getReferenceFrame('ssb');

      const result = transformCatalogToFrame(catalog, ssbFrame);

      const marsTrail = result.snapshot.trails.find((t) => t.id === 'mars');
      const originalMarsTrail = catalog.snapshot.trails.find((t) => t.id === 'mars');
      expect(marsTrail?.positions).toEqual(originalMarsTrail?.positions);
    });
  });

  describe('Earth-centered frame', () => {
    it('places Earth at origin', () => {
      const catalog = createMockCatalog();
      const earthFrame = getReferenceFrame('earth');

      const result = transformCatalogToFrame(catalog, earthFrame);

      const earthBody = result.snapshot.bodies.find((b) => b.id === 'earth');
      expect(earthBody?.position).toEqual([0, 0, 0]);
    });

    it('transforms Sun position relative to Earth', () => {
      const catalog = createMockCatalog();
      const earthFrame = getReferenceFrame('earth');

      const result = transformCatalogToFrame(catalog, earthFrame);

      const sunBody = result.snapshot.bodies.find((b) => b.id === 'sun');
      // Sun was at [0,0,0], Earth at [100,0,0], so Sun should be at [-100,0,0]
      expect(sunBody?.position).toEqual([-100, 0, 0]);
    });

    it('transforms Mars position relative to Earth', () => {
      const catalog = createMockCatalog();
      const earthFrame = getReferenceFrame('earth');

      const result = transformCatalogToFrame(catalog, earthFrame);

      const marsBody = result.snapshot.bodies.find((b) => b.id === 'mars');
      // Mars was at [150,0,0], Earth at [100,0,0], so Mars should be at [50,0,0]
      expect(marsBody?.position).toEqual([50, 0, 0]);
    });

    it('leaves non-satellite trails unchanged (trails are pre-computed frame-relative)', () => {
      const catalog = createMockCatalog();
      const earthFrame = getReferenceFrame('earth');

      const result = transformCatalogToFrame(catalog, earthFrame);

      const marsTrail = result.snapshot.trails.find((t) => t.id === 'mars');
      // Mars trail was [145,0,0],[150,0,0] - left unchanged since provider computes frame-relative
      expect(marsTrail?.positions[0]).toEqual([145, 0, 0]);
      expect(marsTrail?.positions[1]).toEqual([150, 0, 0]);
    });

    it('offsets Moon trail to Earth position (Earth at origin)', () => {
      const catalog = createMockCatalog();
      const earthFrame = getReferenceFrame('earth');

      const result = transformCatalogToFrame(catalog, earthFrame);

      const moonTrail = result.snapshot.trails.find((t) => t.id === 'moon');
      expect(moonTrail).toBeDefined();

      // Moon trail (parent-relative: [0.4,0.1,0],[0.5,0,0]) is offset by Earth's position in frame
      // Earth is at origin [0,0,0], so trail positions remain unchanged
      const lastPos = moonTrail!.positions[moonTrail!.positions.length - 1];
      expect(lastPos![0]).toBeCloseTo(0.5, 1);
    });

    it('updates bodies array with transformed positions', () => {
      const catalog = createMockCatalog();
      const earthFrame = getReferenceFrame('earth');

      const result = transformCatalogToFrame(catalog, earthFrame);

      const marsBody = result.bodies.find((b) => b.id === 'mars');
      expect(marsBody?.position).toEqual([50, 0, 0]);
    });
  });

  describe('edge cases', () => {
    it('handles empty catalog gracefully', () => {
      const emptyCatalog: ResolvedBodyCatalog = {
        metadata: [],
        snapshot: { capturedAt: '2024-01-01T00:00:00Z', bodies: [], trails: [] },
        bodies: []
      };
      const earthFrame = getReferenceFrame('earth');

      const result = transformCatalogToFrame(emptyCatalog, earthFrame);

      expect(result.snapshot.bodies).toEqual([]);
      expect(result.snapshot.trails).toEqual([]);
    });

    it('handles missing origin body by returning unchanged catalog', () => {
      const catalog = createMockCatalog();
      // Create a frame with a body that doesn't exist in the catalog
      const fakeFrame: ReferenceFrame = {
        id: 'earth',
        shortLabel: 'Earth',
        displayName: 'Earth',
        description: 'Test frame',
        originBodyId: 'jupiter'
      };

      const result = transformCatalogToFrame(catalog, fakeFrame);

      // Should return unchanged since jupiter is not in the catalog
      expect(result.snapshot.bodies).toEqual(catalog.snapshot.bodies);
    });

    it('handles empty trails array', () => {
      const catalog = createMockCatalog();
      catalog.snapshot.trails = [];
      const earthFrame = getReferenceFrame('earth');

      const result = transformCatalogToFrame(catalog, earthFrame);

      expect(result.snapshot.trails).toEqual([]);
    });
  });
});

describe('getReferenceFrame', () => {
  it('returns SSB frame', () => {
    const frame = getReferenceFrame('ssb');
    expect(frame.id).toBe('ssb');
    expect(frame.originBodyId).toBeNull();
  });

  it('returns Earth frame', () => {
    const frame = getReferenceFrame('earth');
    expect(frame.id).toBe('earth');
    expect(frame.shortLabel).toBe('Earth');
    expect(frame.displayName).toBe('Earth-centered');
    expect(frame.originBodyId).toBe('earth');
  });

  it('returns body-centered frames from registry body ids', () => {
    const frame = getReferenceFrame('jupiter');

    expect(frame.id).toBe('jupiter');
    expect(frame.shortLabel).toBe('Jupiter');
    expect(frame.displayName).toBe('Jupiter-centered');
    expect(frame.originBodyId).toBe('jupiter');
  });

  it('throws for unknown frame', () => {
    // @ts-expect-error Testing invalid input
    expect(() => getReferenceFrame('unknown')).toThrow();
  });
});

describe('REFERENCE_FRAMES', () => {
  it('contains SSB and Earth frames', () => {
    expect(REFERENCE_FRAMES.length).toBeGreaterThanOrEqual(2);
    expect(REFERENCE_FRAMES.map((f) => f.id)).toContain('ssb');
    expect(REFERENCE_FRAMES.map((f) => f.id)).toContain('earth');
  });
});

describe('getReferenceFramesForLoadedBodies', () => {
  it('keeps the current baseline menu to SSB and Earth-centered', () => {
    expect(getReferenceFramesForLoadedBodies(['sun', 'earth', 'moon', 'mars']).map((frame) => frame.id))
      .toEqual(['ssb', 'earth']);
  });

  it('adds loaded parent system centers for expanded moon catalogs', () => {
    expect(
      getReferenceFramesForLoadedBodies([
        'sun',
        'earth',
        'moon',
        'mars',
        'phobos',
        'jupiter',
        'io',
        'europa',
        'saturn',
        'titan',
        'neptune',
        'triton'
      ]).map((frame) => frame.id)
    ).toEqual(['ssb', 'earth', 'mars', 'jupiter', 'saturn', 'neptune']);
  });

  it('does not expose a parent frame until both parent and satellite are loaded', () => {
    expect(getReferenceFramesForLoadedBodies(['sun', 'jupiter', 'saturn', 'titan']).map((frame) => frame.id))
      .toEqual(['ssb', 'saturn']);
  });
});
