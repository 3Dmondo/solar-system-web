import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type ConstellationCatalog = {
  constellations: Array<{
    id: string;
    lines: Array<Array<[number, number]>>;
  }>;
};

const EXPECTED_CURATED_IDS = [
  'UMa', 'UMi', 'Ori', 'Sco', 'Cyg', 'Lyr', 'Aql', 'Leo', 'Cas', 'Cep',
  'Gem', 'Tau', 'CMa', 'CMi', 'Vir', 'Boo', 'CrB', 'Her', 'Peg', 'And',
  'Per', 'Aur', 'Sgr', 'Cap', 'Aqr', 'Psc', 'Ari', 'Cnc', 'Lib', 'Crv',
  'Crt', 'Dra', 'Cen', 'Cru'
] as const;

describe('constellations catalog data', () => {
  const catalog = loadConstellationCatalog();

  it('keeps the curated constellation ID set stable', () => {
    expect(catalog.constellations.map((constellation) => constellation.id)).toEqual(
      EXPECTED_CURATED_IDS
    );
  });

  it('contains only valid polyline strips with at least two points', () => {
    for (const constellation of catalog.constellations) {
      for (const line of constellation.lines) {
        expect(line.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('does not contain implausibly long segment jumps', () => {
    let maxSegmentDegrees = 0;

    for (const constellation of catalog.constellations) {
      for (const line of constellation.lines) {
        for (let i = 0; i < line.length - 1; i += 1) {
          const current = line[i];
          const next = line[i + 1];
          if (!current || !next) {
            continue;
          }
          const segmentDegrees = getAngularDistanceDegrees(current, next);
          maxSegmentDegrees = Math.max(maxSegmentDegrees, segmentDegrees);
        }
      }
    }

    expect(maxSegmentDegrees).toBeLessThan(20);
  });
});

function loadConstellationCatalog(): ConstellationCatalog {
  const filePath = join(process.cwd(), 'public', 'stars', 'constellations.json');
  const text = readFileSync(filePath, 'utf8');
  return JSON.parse(text) as ConstellationCatalog;
}

function getAngularDistanceDegrees(
  [raHoursA, decDegreesA]: [number, number],
  [raHoursB, decDegreesB]: [number, number]
) {
  const vectorA = toUnitVector(raHoursA, decDegreesA);
  const vectorB = toUnitVector(raHoursB, decDegreesB);
  const dot = clamp(
    vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1] + vectorA[2] * vectorB[2],
    -1,
    1
  );
  return (Math.acos(dot) * 180) / Math.PI;
}

function toUnitVector(raHours: number, decDegrees: number): [number, number, number] {
  const raRadians = (raHours * Math.PI) / 12;
  const decRadians = (decDegrees * Math.PI) / 180;
  const cosDec = Math.cos(decRadians);

  return [
    cosDec * Math.cos(raRadians),
    cosDec * Math.sin(raRadians),
    Math.sin(decRadians)
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
