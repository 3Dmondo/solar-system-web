import { describe, expect, it } from 'vitest';
import { createAnchoredTrailLineGeometry } from './trailLineGeometry';

describe('createAnchoredTrailLineGeometry', () => {
  it('keeps far-from-origin satellite trail geometry in local coordinates', () => {
    const positions: Array<[number, number, number]> = [
      [2_870_000.02, 120_000.04, -60_000.01],
      [2_870_000.03, 120_000.03, -60_000.02],
      [2_870_000.04, 120_000.02, -60_000.01]
    ];

    const geometry = createAnchoredTrailLineGeometry(positions);
    const maxLocalMagnitude = Math.max(
      ...geometry.points.map((point) => Math.hypot(...point))
    );

    expect(maxLocalMagnitude).toBeLessThan(0.03);
    geometry.points.forEach((point, index) => {
      expect(point[0] + geometry.anchor[0]).toBeCloseTo(positions[index]![0], 9);
      expect(point[1] + geometry.anchor[1]).toBeCloseTo(positions[index]![1], 9);
      expect(point[2] + geometry.anchor[2]).toBeCloseTo(positions[index]![2], 9);
    });
  });

  it('handles empty trails', () => {
    expect(createAnchoredTrailLineGeometry([])).toEqual({
      anchor: [0, 0, 0],
      points: []
    });
  });
});
