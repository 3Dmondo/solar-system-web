import { describe, expect, it } from 'vitest';
import { getFocusCameraPosition, getFocusTarget } from './focus';

describe('focus helpers', () => {
  it('returns the selected body position as the focus target', () => {
    expect(getFocusTarget('earth')).toEqual([0.5, 0, 0]);
  });

  it('returns a body-specific camera position for Saturn', () => {
    expect(getFocusCameraPosition('saturn')).toEqual([-2.8, 0.45, 5.8]);
  });
});
