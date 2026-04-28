import { describe, expect, it } from 'vitest';
import {
  BODY_IDS,
  BODY_JUMP_GROUPS,
  BODY_REGISTRY,
  getBodyIdForNaifBodyId,
  getNaifBodyId,
  getParentBody,
  isSatellite
} from './body';

describe('body registry', () => {
  it('keeps NAIF ids unique and reversible', () => {
    const naifIds = BODY_IDS.map((bodyId) => getNaifBodyId(bodyId));

    expect(new Set(naifIds).size).toBe(naifIds.length);
    expect(getBodyIdForNaifBodyId(399)).toBe('earth');
    expect(getBodyIdForNaifBodyId(301)).toBe('moon');
  });

  it('drives hierarchy helpers from the registry', () => {
    for (const bodyId of BODY_IDS) {
      const parentId = BODY_REGISTRY[bodyId].parentId;

      if (parentId) {
        expect(BODY_REGISTRY[parentId as keyof typeof BODY_REGISTRY]).toBeDefined();
      }
    }

    expect(getParentBody('sun')).toBeNull();
    expect(getParentBody('earth')).toBe('sun');
    expect(getParentBody('moon')).toBe('earth');
    expect(isSatellite('earth')).toBe(false);
    expect(isSatellite('moon')).toBe(true);
  });

  it('keeps jump groups aligned with registered bodies', () => {
    for (const group of BODY_JUMP_GROUPS) {
      expect(group.bodyIds.length).toBeGreaterThan(0);

      for (const bodyId of group.bodyIds) {
        expect(BODY_REGISTRY[bodyId]).toBeDefined();
      }
    }
  });
});
