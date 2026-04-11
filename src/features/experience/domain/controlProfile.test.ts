import { describe, expect, it } from 'vitest';
import { getControlProfile } from './controlProfile';

describe('getControlProfile', () => {
  it('returns a mobile-friendly profile for coarse pointers', () => {
    expect(getControlProfile(true)).toMatchObject({
      dampingFactor: 0.12,
      rotateSpeed: 0.85,
      zoomSpeed: 0.9
    });
  });

  it('returns a desktop-friendly profile for fine pointers', () => {
    expect(getControlProfile(false)).toMatchObject({
      dampingFactor: 0.09,
      rotateSpeed: 0.65,
      zoomSpeed: 0.8
    });
  });
});
