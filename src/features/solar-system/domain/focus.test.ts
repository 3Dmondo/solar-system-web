import { describe, expect, it } from 'vitest';
import {
  getFocusCameraPosition,
  getFocusCameraPositionForViewDirection,
  getFocusDistance,
  getFocusTarget,
  getFocusTransitionProfile
} from './focus';

describe('focus helpers', () => {
  it('returns the selected body position as the focus target', () => {
    expect(getFocusTarget('earth')).toEqual([-7.3723683986009245, 0, 5.162187927159417]);
  });

  it('returns the selected body position for the Moon', () => {
    expect(getFocusTarget('moon')).toEqual([-6.3, -0.18, 5.65]);
  });

  it('returns a body-specific camera position for Saturn', () => {
    expect(getFocusCameraPosition('saturn')).toEqual([
      19.424847042896396,
      0.45,
      -4.528374381289598
    ]);
  });

  it('returns the overview camera position', () => {
    expect(getFocusCameraPosition('overview')).toEqual([0, 14, 46]);
  });

  it('returns a focus distance based on the authored offset', () => {
    expect(getFocusDistance('earth')).toBeCloseTo(3.209750769140807);
  });

  it('preserves the current view direction when deriving a focused camera position', () => {
    expect(getFocusCameraPositionForViewDirection('earth', [0, 14, 46])).toEqual([
      -7.3723683986009245,
      0.9345562202027888,
      8.232872650682866
    ]);
  });

  it('uses a target-leading profile when moving from overview into a body', () => {
    expect(getFocusTransitionProfile('overview', 'earth')).toEqual({
      cameraEasingRate: 3.8,
      targetEasingRate: 5.6,
      settleDistanceSquared: 0.0001
    });
  });

  it('uses a faster pullback profile when returning to overview', () => {
    expect(getFocusTransitionProfile('earth', 'overview')).toEqual({
      cameraEasingRate: 5.4,
      targetEasingRate: 4.2,
      settleDistanceSquared: 0.0001
    });
  });

  it('uses a balanced profile when switching between focused bodies', () => {
    expect(getFocusTransitionProfile('earth', 'saturn')).toEqual({
      cameraEasingRate: 4.5,
      targetEasingRate: 4.5,
      settleDistanceSquared: 0.0001
    });
  });
});
