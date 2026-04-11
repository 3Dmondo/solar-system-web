import { describe, expect, it } from 'vitest';
import { getSceneScaleLabel } from './scales';

describe('getSceneScaleLabel', () => {
  it('returns a readable label for cinematic mode', () => {
    expect(getSceneScaleLabel('cinematic')).toBe('Cinematic scale');
  });

  it('returns a readable label for realistic mode', () => {
    expect(getSceneScaleLabel('realistic')).toBe('Realistic scale');
  });
});
