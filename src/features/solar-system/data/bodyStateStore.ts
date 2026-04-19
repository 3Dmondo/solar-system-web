import {
  getBodyMetadataById,
  mergeBodySnapshotWithMetadata,
  mockBodyStateProvider
} from './mockBodyCatalog';
import { type BodyDefinition, type BodyId, type BodyMetadata, type BodySnapshot } from '../domain/body';

export type ResolvedBodyCatalog = {
  metadata: BodyMetadata[];
  snapshot: BodySnapshot;
  bodies: BodyDefinition[];
};

export function getResolvedBodyCatalog(capturedAt?: string): ResolvedBodyCatalog {
  const metadata = mockBodyStateProvider.getBodyMetadata();
  const snapshot = mockBodyStateProvider.getSnapshot(capturedAt);

  return {
    metadata,
    snapshot,
    bodies: mergeBodySnapshotWithMetadata(snapshot)
  };
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
