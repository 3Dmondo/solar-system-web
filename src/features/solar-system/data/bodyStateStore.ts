import {
  getBodyMetadataById,
  mockBodyStateProvider
} from './mockBodyCatalog';
import { type BodyDefinition, type BodyId, type BodyMetadata, type BodySnapshot } from '../domain/body';

export type ResolvedBodyCatalog = {
  metadata: BodyMetadata[];
  snapshot: BodySnapshot;
  bodies: BodyDefinition[];
};

export type BodyCatalogSource = {
  loadBodyCatalogAtUtc: (utc: Date | string) => Promise<ResolvedBodyCatalog>;
  prefetchAroundUtc: (utc: Date | string) => Promise<void>;
};

export function resolveBodyCatalog(
  metadata: BodyMetadata[],
  snapshot: BodySnapshot
): ResolvedBodyCatalog {
  return {
    metadata,
    snapshot,
    bodies: mergeBodySnapshotWithMetadata(metadata, snapshot)
  };
}

export function createEmptyResolvedBodyCatalog(
  capturedAt: string
): ResolvedBodyCatalog {
  return resolveBodyCatalog([], {
    capturedAt,
    bodies: []
  });
}

export function getResolvedBodyCatalog(capturedAt?: string): ResolvedBodyCatalog {
  const metadata = mockBodyStateProvider.getBodyMetadata();
  const snapshot = mockBodyStateProvider.getSnapshot(capturedAt);

  return resolveBodyCatalog(metadata, snapshot);
}

export function getResolvedBodies(capturedAt?: string) {
  return getResolvedBodyCatalog(capturedAt).bodies;
}

export function getResolvedBodyById(bodyId: BodyId, capturedAt?: string) {
  return getResolvedBodies(capturedAt).find((body) => body.id === bodyId);
}

export function getResolvedBodyMetadataById(bodyId: BodyId) {
  return getBodyMetadataById(bodyId);
}

function mergeBodySnapshotWithMetadata(
  metadata: BodyMetadata[],
  snapshot: BodySnapshot
): BodyDefinition[] {
  return metadata.flatMap((bodyMetadata) => {
    const state = snapshot.bodies.find((body) => body.id === bodyMetadata.id);

    if (!state) {
      return [];
    }

    return [
      {
        ...bodyMetadata,
        ...state
      }
    ];
  });
}
