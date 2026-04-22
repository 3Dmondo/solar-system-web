import { describe, expect, it } from 'vitest';
import {
  createEmptyResolvedBodyCatalog,
  resolveBodyCatalog
} from './bodyStateStore';
import { type BodyMetadata, type BodySnapshot } from '../domain/body'

describe('bodyStateStore', () => {
  const metadata: BodyMetadata[] = [
    {
      id: 'earth',
      displayName: 'Earth',
      color: '#3a7bd5',
      radius: 0.72,
      focusOffset: [0, 0.25, 3.2]
    },
    {
      id: 'moon',
      displayName: 'Moon',
      color: '#b0b4be',
      radius: 0.22,
      focusOffset: [0, 0.12, 1.7]
    }
  ]
  const snapshot: BodySnapshot = {
    capturedAt: '2000-01-01T12:00:00.000Z',
    bodies: [
      {
        id: 'earth',
        position: [1, 2, 3]
      },
      {
        id: 'moon',
        position: [4, 5, 6]
      }
    ],
    trails: [
      {
        id: 'earth',
        positions: [
          [0, 0, 0],
          [1, 2, 3]
        ]
      }
    ]
  }

  it('resolves metadata and snapshot state together through one selector', () => {
    const catalog = resolveBodyCatalog(metadata, snapshot)

    expect(catalog.metadata).toEqual(metadata)
    expect(catalog.snapshot).toEqual(snapshot)
    expect(catalog.bodies).toEqual([
      {
        ...metadata[0],
        ...snapshot.bodies[0]
      },
      {
        ...metadata[1],
        ...snapshot.bodies[1]
      }
    ])
  })

  it('can create an explicit empty catalog for real-data loading and error states', () => {
    const catalog = createEmptyResolvedBodyCatalog('2000-01-01T12:00:00.000Z');

    expect(catalog.metadata).toEqual([]);
    expect(catalog.bodies).toEqual([]);
    expect(catalog.snapshot).toEqual({
      capturedAt: '2000-01-01T12:00:00.000Z',
      bodies: [],
      trails: []
    });
  });
})
