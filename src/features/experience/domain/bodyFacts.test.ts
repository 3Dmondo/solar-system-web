import { describe, expect, it } from 'vitest';
import { getFocusedBodyFacts } from './bodyFacts';
import { type BodyMetadata } from '../../solar-system/domain/body';

describe('bodyFacts', () => {
  it('combines Wikipedia-sourced copy and generated physical facts without parent or role rows', () => {
    const facts = getFocusedBodyFacts({
      id: 'ganymede',
      displayName: 'Ganymede',
      color: '#a99078',
      radius: 2.6341,
      focusOffset: [0, 0.12, 1.7],
      facts: {
        meanRadiusKm: 2634.1,
        approximateSurfaceGravityMps2: 1.43,
        approximateBulkDensityKgPerM3: 1942,
        provenance: 'Generated physical metadata, NAIF 503'
      }
    } satisfies BodyMetadata);

    expect(facts?.summaryParagraphs).toHaveLength(2);
    expect(facts?.summaryParagraphs.join(' ')).toMatch(/largest natural satellite/i);
    expect(facts?.rows).toContainEqual({ label: 'Radius', value: '2,634 km' });
    expect(facts?.rows.some((row) => row.label === 'Parent')).toBe(false);
    expect(facts?.rows.some((row) => row.label === 'Role')).toBe(false);
    expect(facts?.rows).toContainEqual({ label: 'Gravity', value: '1.43 m/s^2' });
    expect(facts?.rows).toContainEqual({ label: 'Density', value: '1,942 kg/m^3' });
    expect(facts?.rows).toContainEqual({
      label: 'Source',
      value: 'Wikipedia description; Generated physical metadata, NAIF 503'
    });
  });

  it('keeps focused bodies useful when generated physical fields are unavailable', () => {
    const facts = getFocusedBodyFacts({
      id: 'phobos',
      displayName: 'Phobos',
      color: '#8c7467',
      radius: 0.055,
      focusOffset: [0, 0.03, 0.55]
    } satisfies BodyMetadata);

    expect(facts?.summaryParagraphs.join(' ')).toMatch(/Stickney/i);
    expect(facts?.rows.some((row) => row.label === 'Parent')).toBe(false);
    expect(facts?.rows).toContainEqual({ label: 'Radius', value: 'Not available' });
    expect(facts?.rows).toContainEqual({
      label: 'Source',
      value: 'Wikipedia description; physical fields unavailable'
    });
  });

  it('returns null for overview', () => {
    expect(getFocusedBodyFacts(null)).toBeNull();
  });
});
