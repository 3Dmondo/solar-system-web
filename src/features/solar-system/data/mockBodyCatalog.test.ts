import { describe, expect, it } from 'vitest';
import {
  getBodyDefinitionById,
  getBodyMetadataById,
  getBodyStateById,
  getMockBodySnapshot,
  mergeBodySnapshotWithMetadata,
  mockedBodyMetadata
} from './mockBodyCatalog';

describe('mockBodyCatalog provider helpers', () => {
  it('keeps metadata and snapshot state aligned by body id', () => {
    const snapshot = getMockBodySnapshot();
    const earthMetadata = getBodyMetadataById('earth');
    const earthState = getBodyStateById(snapshot, 'earth');

    expect(earthMetadata?.displayName).toBe('Earth');
    expect(earthState?.position).toEqual([expect.any(Number), expect.any(Number), expect.any(Number)]);
  });

  it('merges metadata and snapshot state into renderable body definitions', () => {
    const snapshot = getMockBodySnapshot();
    const bodies = mergeBodySnapshotWithMetadata(snapshot);

    expect(bodies).toHaveLength(mockedBodyMetadata.length);
    expect(bodies.find((body) => body.id === 'saturn')).toMatchObject({
      displayName: 'Saturn',
      hasRings: true,
      position: [expect.any(Number), expect.any(Number), expect.any(Number)]
    });
  });

  it('builds a full body definition for focus helpers', () => {
    const body = getBodyDefinitionById(getMockBodySnapshot(), 'moon');

    expect(body).toMatchObject({
      id: 'moon',
      displayName: 'Moon',
      radius: 0.22,
      position: [-6.3, -0.18, 5.65]
    });
  });
});
