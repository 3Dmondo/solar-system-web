import { describe, expect, it } from 'vitest';
import { getTrailRenderStyle } from './trailRenderStyle';

describe('getTrailRenderStyle', () => {
  it('uses a stable opaque ribbon style', () => {
    expect(getTrailRenderStyle()).toEqual({
      lineWidth: 2.35,
      colorIntensity: 0.85
    });
  });
});
