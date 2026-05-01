import { describe, expect, it } from 'vitest';
import {
  BODY_IDS,
  BODY_JUMP_GROUPS,
  BODY_REGISTRY,
  BODY_SYSTEM_GROUPS,
  getBodyDiscoveryGroups,
  getBodyCategory,
  getBodyRegistryEntry,
  getTidalLockTargetBody,
  getBodyIdForNaifBodyId,
  getNaifBodyId,
  getParentBody,
  isStar,
  isSatellite
} from './body';

describe('body registry', () => {
  it('keeps NAIF ids unique and reversible', () => {
    const naifIds = BODY_IDS.map((bodyId) => getNaifBodyId(bodyId));

    expect(new Set(naifIds).size).toBe(naifIds.length);
    expect(getBodyIdForNaifBodyId(399)).toBe('earth');
    expect(getBodyIdForNaifBodyId(301)).toBe('moon');
    expect(getBodyIdForNaifBodyId(501)).toBe('io');
    expect(getBodyIdForNaifBodyId(801)).toBe('triton');
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
    expect(getParentBody('phobos')).toBe('mars');
    expect(getParentBody('io')).toBe('jupiter');
    expect(getParentBody('triton')).toBe('neptune');
    expect(getTidalLockTargetBody('sun')).toBeNull();
    expect(getTidalLockTargetBody('earth')).toBeNull();
    expect(getTidalLockTargetBody('moon')).toBe('earth');
    expect(getTidalLockTargetBody('io')).toBe('jupiter');
    expect(isStar('sun')).toBe(true);
    expect(isStar('earth')).toBe(false);
    expect(isSatellite('earth')).toBe(false);
    expect(isSatellite('moon')).toBe(true);
  });

  it('keeps jump groups aligned with registered bodies', () => {
    const groupedBodyIds = new Set<string>();

    for (const group of BODY_JUMP_GROUPS) {
      expect(group.bodyIds.length).toBeGreaterThan(0);

      for (const bodyId of group.bodyIds) {
        expect(BODY_REGISTRY[bodyId]).toBeDefined();
        expect(getBodyRegistryEntry(bodyId).jumpGroups).toBeDefined();
        expect(groupedBodyIds.has(`${group.label}:${bodyId}`)).toBe(false);
        groupedBodyIds.add(`${group.label}:${bodyId}`);
      }
    }

    expect(BODY_JUMP_GROUPS).toEqual([
      {
        label: 'Quick picks',
        bodyIds: ['sun', 'earth', 'moon', 'saturn']
      }
    ]);
  });

  it('derives body categories and system groups from the registry', () => {
    expect(getBodyCategory('sun')).toBe('star');
    expect(getBodyCategory('earth')).toBe('planet');
    expect(getBodyCategory('moon')).toBe('natural-satellite');
    expect(getBodyCategory('titan')).toBe('natural-satellite');

    expect(BODY_SYSTEM_GROUPS).toEqual([
      {
        label: 'Solar system',
        bodyIds: [
          'sun',
          'mercury',
          'venus',
          'earth',
          'mars',
          'jupiter',
          'saturn',
          'uranus',
          'neptune'
        ]
      },
      {
        label: 'Earth system',
        bodyIds: ['moon']
      },
      {
        label: 'Mars system',
        bodyIds: ['phobos', 'deimos']
      },
      {
        label: 'Jupiter system',
        bodyIds: ['io', 'europa', 'ganymede', 'callisto']
      },
      {
        label: 'Saturn system',
        bodyIds: ['mimas', 'enceladus', 'tethys', 'dione', 'rhea', 'titan', 'iapetus']
      },
      {
        label: 'Uranus system',
        bodyIds: ['ariel', 'umbriel', 'titania', 'oberon', 'miranda']
      },
      {
        label: 'Neptune system',
        bodyIds: ['triton']
      }
    ]);
  });

  it('builds discovery groups from quick picks and available system bodies', () => {
    expect(getBodyDiscoveryGroups(BODY_IDS)).toEqual([
      {
        label: 'Quick picks',
        bodyIds: ['sun', 'earth', 'moon', 'saturn']
      },
      {
        label: 'Solar system',
        bodyIds: ['mercury', 'venus', 'mars', 'jupiter', 'uranus', 'neptune']
      },
      {
        label: 'Mars system',
        bodyIds: ['phobos', 'deimos']
      },
      {
        label: 'Jupiter system',
        bodyIds: ['io', 'europa', 'ganymede', 'callisto']
      },
      {
        label: 'Saturn system',
        bodyIds: ['mimas', 'enceladus', 'tethys', 'dione', 'rhea', 'titan', 'iapetus']
      },
      {
        label: 'Uranus system',
        bodyIds: ['ariel', 'umbriel', 'titania', 'oberon', 'miranda']
      },
      {
        label: 'Neptune system',
        bodyIds: ['triton']
      }
    ]);

    expect(getBodyDiscoveryGroups(['mars', 'jupiter'])).toEqual([
      {
        label: 'Solar system',
        bodyIds: ['mars', 'jupiter']
      }
    ]);
  });
});
