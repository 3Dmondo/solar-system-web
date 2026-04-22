import { type BodyDefinition, type BodyMetadata, type BodySnapshot } from '../domain/body'

export type ResolvedBodyCatalog = {
  metadata: BodyMetadata[]
  snapshot: BodySnapshot
  bodies: BodyDefinition[]
}

export type BodyCatalogSource = {
  loadBodyCatalogAtUtc: (utc: Date | string) => Promise<ResolvedBodyCatalog>
  prefetchAroundUtc: (utc: Date | string) => Promise<void>
}

export function resolveBodyCatalog(
  metadata: BodyMetadata[],
  snapshot: BodySnapshot
): ResolvedBodyCatalog {
  return {
    metadata,
    snapshot,
    bodies: mergeBodySnapshotWithMetadata(metadata, snapshot)
  }
}

export function createEmptyResolvedBodyCatalog(
  capturedAt: string
): ResolvedBodyCatalog {
  return resolveBodyCatalog([], {
    capturedAt,
    bodies: [],
    trails: []
  })
}

export const EMPTY_RESOLVED_BODY_CATALOG = createEmptyResolvedBodyCatalog('unresolved')

function mergeBodySnapshotWithMetadata(
  metadata: BodyMetadata[],
  snapshot: BodySnapshot
): BodyDefinition[] {
  return metadata.flatMap((bodyMetadata) => {
    const state = snapshot.bodies.find((body) => body.id === bodyMetadata.id)

    if (!state) {
      return []
    }

    return [
      {
        ...bodyMetadata,
        ...state
      }
    ]
  })
}
