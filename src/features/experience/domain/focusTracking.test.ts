import { describe, expect, it } from 'vitest';
import {
  getFocusViewCameraOffsetDistanceSquared,
  translateFocusView
} from './focusTracking';

describe('focusTracking', () => {
  it('translates camera and target together when a focused body moves', () => {
    const translated = translateFocusView(
      {
        cameraPosition: [10, 5, -2],
        target: [4, 1, -1]
      },
      [3, -2, 7]
    );

    expect(translated).toEqual({
      cameraPosition: [13, 3, 5],
      target: [7, -1, 6]
    });
  });

  it('preserves the camera-to-target offset while translating', () => {
    const translated = translateFocusView(
      {
        cameraPosition: [18, 4, 12],
        target: [6, 1, 2]
      },
      [-5, 3, 8]
    );

    expect([
      translated.cameraPosition[0] - translated.target[0],
      translated.cameraPosition[1] - translated.target[1],
      translated.cameraPosition[2] - translated.target[2]
    ]).toEqual([12, 3, 10]);
  });

  it('treats equally translated views as the same camera offset', () => {
    const desiredView = {
      cameraPosition: [18, 4, 12] as [number, number, number],
      target: [6, 1, 2] as [number, number, number]
    };
    const currentView = translateFocusView(desiredView, [12, -5, 9]);

    expect(getFocusViewCameraOffsetDistanceSquared(currentView, desiredView)).toBe(0);
  });

  it('detects when the camera offset from the target is still changing', () => {
    expect(
      getFocusViewCameraOffsetDistanceSquared(
        {
          cameraPosition: [24, 7, 15],
          target: [10, 2, 6]
        },
        {
          cameraPosition: [20, 6, 14],
          target: [10, 2, 6]
        }
      )
    ).toBe(18);
  });
});
