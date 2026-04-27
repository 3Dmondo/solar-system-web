import { describe, expect, it } from 'vitest';
import { getSkyShellRadius } from './skyLayer';

describe('skyLayer helpers', () => {
  it('keeps the sky shell just inside the far plane for wide frustums', () => {
    const radius = getSkyShellRadius(0.01, 25_000_000);

    expect(radius).toBeCloseTo(24_500_000, 3);
  });

  it('keeps the sky shell between near and far for narrow frustums', () => {
    const radius = getSkyShellRadius(10, 11);

    expect(radius).toBeGreaterThan(10);
    expect(radius).toBeLessThan(11);
  });

  it('keeps the sky shell visible for physically scaled overview clip planes', () => {
    const near = 1_125_006.15575;
    const far = 23_209_816.38305521;
    const radius = getSkyShellRadius(near, far);

    expect(radius).toBeGreaterThan(near);
    expect(radius).toBeLessThan(far);
  });
});
