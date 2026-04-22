import { describe, expect, it } from 'vitest';
import {
  createEmptyResolvedBodyCatalog,
  getResolvedBodies,
  getResolvedBodyById,
  getResolvedBodyCatalog,
  getResolvedBodyMetadataById
} from './bodyStateStore';
import { mockedBodyMetadata } from './mockBodyCatalog';

describe('bodyStateStore', () => {
  it('resolves metadata and snapshot state together through one selector', () => {
    const catalog = getResolvedBodyCatalog();

    expect(catalog.metadata).toHaveLength(mockedBodyMetadata.length);
    expect(catalog.snapshot.capturedAt).toBe('mock-overview');
    expect(catalog.bodies).toHaveLength(mockedBodyMetadata.length);
  });

  it('returns merged body definitions by id', () => {
    expect(getResolvedBodyById('earth')).toMatchObject({
      id: 'earth',
      displayName: 'Earth',
      position: [expect.any(Number), expect.any(Number), expect.any(Number)]
    });
  });

  it('returns static metadata by id for HUD labels and jump targets', () => {
    expect(getResolvedBodyMetadataById('saturn')).toMatchObject({
      id: 'saturn',
      displayName: 'Saturn',
      hasRings: true
    });
    expect(getResolvedBodies().find((body) => body.id === 'moon')?.displayName).toBe('Moon');
  });

  it('can create an explicit empty catalog for real-data loading and error states', () => {
    const catalog = createEmptyResolvedBodyCatalog('2000-01-01T12:00:00.000Z');

    expect(catalog.metadata).toEqual([]);
    expect(catalog.bodies).toEqual([]);
    expect(catalog.snapshot).toEqual({
      capturedAt: '2000-01-01T12:00:00.000Z',
      bodies: []
    });
  });
});
