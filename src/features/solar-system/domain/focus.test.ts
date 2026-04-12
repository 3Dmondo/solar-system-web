import { describe, expect, it } from 'vitest';
import { getFocusCameraPosition, getFocusTarget } from './focus';

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
});
