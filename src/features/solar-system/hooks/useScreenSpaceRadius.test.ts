import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import {
  computeScreenSpaceRadius,
  computeScreenSpaceRadiiBatch
} from './useScreenSpaceRadius';

describe('computeScreenSpaceRadius', () => {
  const defaultFov = 50;
  const defaultAspect = 16 / 9;
  const defaultViewportHeight = 1080;

  it('returns larger radius when body is closer to camera', () => {
    const cameraPosition = new Vector3(0, 0, 100);
    const bodyRadius = 1;

    const nearRadius = computeScreenSpaceRadius(
      [0, 0, 50],
      bodyRadius,
      cameraPosition,
      defaultFov,
      defaultAspect,
      defaultViewportHeight
    );

    const farRadius = computeScreenSpaceRadius(
      [0, 0, 0],
      bodyRadius,
      cameraPosition,
      defaultFov,
      defaultAspect,
      defaultViewportHeight
    );

    expect(nearRadius).toBeGreaterThan(farRadius);
  });

  it('returns larger radius for bigger bodies at same distance', () => {
    const cameraPosition = new Vector3(0, 0, 100);
    const bodyPosition: [number, number, number] = [0, 0, 0];

    const smallBodyRadius = computeScreenSpaceRadius(
      bodyPosition,
      1,
      cameraPosition,
      defaultFov,
      defaultAspect,
      defaultViewportHeight
    );

    const largeBodyRadius = computeScreenSpaceRadius(
      bodyPosition,
      10,
      cameraPosition,
      defaultFov,
      defaultAspect,
      defaultViewportHeight
    );

    expect(largeBodyRadius).toBeGreaterThan(smallBodyRadius);
  });

  it('fills viewport when camera is inside the body', () => {
    const cameraPosition = new Vector3(0, 0, 0);
    const bodyRadius = 10;

    const screenRadius = computeScreenSpaceRadius(
      [0, 0, 0],
      bodyRadius,
      cameraPosition,
      defaultFov,
      defaultAspect,
      defaultViewportHeight
    );

    // Should return max of viewportHeight or viewportHeight * aspect
    expect(screenRadius).toBe(defaultViewportHeight * defaultAspect);
  });

  it('returns smaller radius with larger FOV (wider view)', () => {
    const cameraPosition = new Vector3(0, 0, 100);
    const bodyPosition: [number, number, number] = [0, 0, 0];
    const bodyRadius = 1;

    const narrowFovRadius = computeScreenSpaceRadius(
      bodyPosition,
      bodyRadius,
      cameraPosition,
      30, // narrow FOV
      defaultAspect,
      defaultViewportHeight
    );

    const wideFovRadius = computeScreenSpaceRadius(
      bodyPosition,
      bodyRadius,
      cameraPosition,
      90, // wide FOV
      defaultAspect,
      defaultViewportHeight
    );

    expect(narrowFovRadius).toBeGreaterThan(wideFovRadius);
  });

  it('scales proportionally with viewport height', () => {
    const cameraPosition = new Vector3(0, 0, 100);
    const bodyPosition: [number, number, number] = [0, 0, 0];
    const bodyRadius = 1;

    const smallViewport = computeScreenSpaceRadius(
      bodyPosition,
      bodyRadius,
      cameraPosition,
      defaultFov,
      defaultAspect,
      540
    );

    const largeViewport = computeScreenSpaceRadius(
      bodyPosition,
      bodyRadius,
      cameraPosition,
      defaultFov,
      defaultAspect,
      1080
    );

    expect(largeViewport).toBeCloseTo(smallViewport * 2, 5);
  });
});

describe('computeScreenSpaceRadiiBatch', () => {
  const defaultFov = 50;
  const defaultAspect = 16 / 9;
  const defaultViewportHeight = 1080;

  it('computes radii for multiple bodies', () => {
    const cameraPosition = new Vector3(0, 0, 100);
    const bodies = [
      { position: [0, 0, 0] as [number, number, number], radius: 1 },
      { position: [0, 0, 50] as [number, number, number], radius: 1 },
      { position: [0, 0, 80] as [number, number, number], radius: 1 }
    ];

    const radii = computeScreenSpaceRadiiBatch(
      bodies,
      cameraPosition,
      defaultFov,
      defaultAspect,
      defaultViewportHeight
    );

    expect(radii).toHaveLength(3);
    // Closer bodies should have larger screen radii
    const [r0, r1, r2] = radii;
    expect(r0).toBeDefined();
    expect(r1).toBeDefined();
    expect(r2).toBeDefined();
    expect(r2!).toBeGreaterThan(r1!);
    expect(r1!).toBeGreaterThan(r0!);
  });

  it('returns empty array for empty input', () => {
    const cameraPosition = new Vector3(0, 0, 100);

    const radii = computeScreenSpaceRadiiBatch(
      [],
      cameraPosition,
      defaultFov,
      defaultAspect,
      defaultViewportHeight
    );

    expect(radii).toHaveLength(0);
  });
});
