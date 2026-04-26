import { type BodyDefinition, type BodyId, type BodyMetadata, type BodySnapshot } from '../domain/body'

export type ResolvedBodyCatalog = {
  metadata: BodyMetadata[]
  snapshot: BodySnapshot
  bodies: BodyDefinition[]
}

export type LoadCatalogOptions = {
  /**
   * Body ID to use as the origin for trail positions.
   * When set, trail positions are computed relative to this body at each sample time.
   */
  trailOriginBodyId?: BodyId | null
}

export type BodyCatalogSource = {
  loadBodyCatalogAtUtc: (utc: Date | string, options?: LoadCatalogOptions) => Promise<ResolvedBodyCatalog>
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
  const snapshotBodiesById = new Map(snapshot.bodies.map((body) => [body.id, body]))

  return metadata.flatMap((bodyMetadata) => {
    const state = snapshotBodiesById.get(bodyMetadata.id)

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
