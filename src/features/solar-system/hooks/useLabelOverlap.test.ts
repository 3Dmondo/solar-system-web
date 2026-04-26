import { describe, expect, it } from 'vitest';
import type { BodyId } from '../domain/body';
import {
  __testing,
  LABEL_OVERLAP_CONFIG
} from './useLabelOverlap';

const { labelsOverlap, computeSpreadOffsets } = __testing;

describe('labelsOverlap', () => {
  const width = LABEL_OVERLAP_CONFIG.labelWidthPx;
  const height = LABEL_OVERLAP_CONFIG.labelHeightPx;

  it('detects overlap when labels are at the same position', () => {
    const result = labelsOverlap(
      { x: 100, y: 100 },
      { x: 100, y: 100 },
      width,
      height
    );
    expect(result).toBe(true);
  });

  it('detects overlap when labels are close horizontally', () => {
    // Labels are 70px wide, so centers within 70px horizontally overlap
    const result = labelsOverlap(
      { x: 100, y: 100 },
      { x: 130, y: 100 },
      width,
      height
    );
    expect(result).toBe(true);
  });

  it('does not overlap when labels are far apart horizontally', () => {
    const result = labelsOverlap(
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      width,
      height
    );
    expect(result).toBe(false);
  });

  it('detects overlap when labels are close vertically', () => {
    const result = labelsOverlap(
      { x: 100, y: 100 },
      { x: 100, y: 110 },
      width,
      height
    );
    expect(result).toBe(true);
  });

  it('does not overlap when labels are far apart vertically', () => {
    const result = labelsOverlap(
      { x: 100, y: 100 },
      { x: 100, y: 150 },
      width,
      height
    );
    expect(result).toBe(false);
  });

  it('detects diagonal overlap', () => {
    // Within both horizontal and vertical thresholds
    const result = labelsOverlap(
      { x: 100, y: 100 },
      { x: 130, y: 110 },
      width,
      height
    );
    expect(result).toBe(true);
  });
});

describe('computeSpreadOffsets', () => {
  const minSeparation = LABEL_OVERLAP_CONFIG.minSeparationPx;
  const maxSpread = LABEL_OVERLAP_CONFIG.maxSpreadPx;
  const iterations = LABEL_OVERLAP_CONFIG.iterations;

  it('returns empty map for single label', () => {
    const positions = [{ bodyId: 'earth' as BodyId, screenX: 100, screenY: 100 }];
    const result = computeSpreadOffsets(positions, minSeparation, maxSpread, iterations);
    expect(result.size).toBe(0);
  });

  it('returns zero offsets for non-overlapping labels', () => {
    const positions = [
      { bodyId: 'earth' as BodyId, screenX: 100, screenY: 100 },
      { bodyId: 'mars' as BodyId, screenX: 300, screenY: 100 }
    ];
    const result = computeSpreadOffsets(positions, minSeparation, maxSpread, iterations);

    // Both should have near-zero offsets since they don't overlap
    const earthOffset = result.get('earth')!;
    const marsOffset = result.get('mars')!;

    expect(Math.abs(earthOffset[0])).toBeLessThan(1);
    expect(Math.abs(earthOffset[1])).toBeLessThan(1);
    expect(Math.abs(marsOffset[0])).toBeLessThan(1);
    expect(Math.abs(marsOffset[1])).toBeLessThan(1);
  });

  it('pushes apart overlapping labels', () => {
    const positions = [
      { bodyId: 'uranus' as BodyId, screenX: 100, screenY: 100 },
      { bodyId: 'neptune' as BodyId, screenX: 105, screenY: 100 }
    ];
    const result = computeSpreadOffsets(positions, minSeparation, maxSpread, iterations);

    const uranusOffset = result.get('uranus')!;
    const neptuneOffset = result.get('neptune')!;

    // Uranus should be pushed left (negative X)
    expect(uranusOffset[0]).toBeLessThan(0);
    // Neptune should be pushed right (positive X)
    expect(neptuneOffset[0]).toBeGreaterThan(0);

    // They should be pushed apart by at least minSeparation total
    const separation = neptuneOffset[0] - uranusOffset[0];
    // After spreading, original 5px gap + spread should reach minSeparation
    expect(separation).toBeGreaterThan(minSeparation - 10);
  });

  it('handles exact overlap with horizontal push', () => {
    const positions = [
      { bodyId: 'earth' as BodyId, screenX: 100, screenY: 100 },
      { bodyId: 'mars' as BodyId, screenX: 100, screenY: 100 }
    ];
    const result = computeSpreadOffsets(positions, minSeparation, maxSpread, iterations);

    const earthOffset = result.get('earth')!;
    const marsOffset = result.get('mars')!;

    // Should push apart horizontally for exact overlap
    expect(earthOffset[0]).not.toBe(marsOffset[0]);
  });

  it('clamps offsets to max spread distance', () => {
    // Create a tight cluster that would need large offsets
    const positions = [
      { bodyId: 'mercury' as BodyId, screenX: 100, screenY: 100 },
      { bodyId: 'venus' as BodyId, screenX: 100, screenY: 100 },
      { bodyId: 'earth' as BodyId, screenX: 100, screenY: 100 },
      { bodyId: 'mars' as BodyId, screenX: 100, screenY: 100 }
    ];
    const result = computeSpreadOffsets(positions, minSeparation, maxSpread, iterations);

    // All offsets should be within max spread
    result.forEach((offset) => {
      const distance = Math.sqrt(offset[0] ** 2 + offset[1] ** 2);
      expect(distance).toBeLessThanOrEqual(maxSpread + 0.001); // Small epsilon for float comparison
    });
  });

  it('spreads multiple overlapping labels apart', () => {
    const positions = [
      { bodyId: 'jupiter' as BodyId, screenX: 100, screenY: 100 },
      { bodyId: 'saturn' as BodyId, screenX: 102, screenY: 100 },
      { bodyId: 'uranus' as BodyId, screenX: 104, screenY: 100 }
    ];
    const result = computeSpreadOffsets(positions, minSeparation, maxSpread, iterations);

    const jupiterOffset = result.get('jupiter')!;
    const saturnOffset = result.get('saturn')!;
    const uranusOffset = result.get('uranus')!;

    // Jupiter should be pushed most left, Uranus most right
    expect(jupiterOffset[0]).toBeLessThan(saturnOffset[0]);
    expect(saturnOffset[0]).toBeLessThan(uranusOffset[0]);
  });
});

describe('body hierarchy', () => {
  // These tests verify the domain helpers used by useLabelOverlap
  it('correctly identifies Moon as satellite of Earth', async () => {
    const { isSatellite, getParentBody } = await import('../domain/body');

    expect(isSatellite('moon')).toBe(true);
    expect(getParentBody('moon')).toBe('earth');
  });

  it('correctly identifies planets as non-satellites', async () => {
    const { isSatellite } = await import('../domain/body');

    expect(isSatellite('earth')).toBe(false);
    expect(isSatellite('mars')).toBe(false);
    expect(isSatellite('jupiter')).toBe(false);
  });

  it('returns sun as parent for all planets', async () => {
    const { getParentBody } = await import('../domain/body');

    expect(getParentBody('mercury')).toBe('sun');
    expect(getParentBody('venus')).toBe('sun');
    expect(getParentBody('earth')).toBe('sun');
    expect(getParentBody('mars')).toBe('sun');
    expect(getParentBody('jupiter')).toBe('sun');
    expect(getParentBody('saturn')).toBe('sun');
    expect(getParentBody('uranus')).toBe('sun');
    expect(getParentBody('neptune')).toBe('sun');
  });

  it('returns null parent for sun', async () => {
    const { getParentBody } = await import('../domain/body');
    expect(getParentBody('sun')).toBe(null);
  });
});
