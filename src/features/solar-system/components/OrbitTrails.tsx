import { useMemo } from 'react'
import { type BodyMetadata, type BodyTrail, type ViewTargetId } from '../domain/body'
import { GlowingTrailLine } from './GlowingTrailLine'

type OrbitTrailsProps = {
  focusedBodyId: ViewTargetId
  metadata: BodyMetadata[]
  trails: BodyTrail[]
}

export function OrbitTrails({
  focusedBodyId,
  metadata,
  trails
}: OrbitTrailsProps) {
  const metadataByBodyId = useMemo(
    () => new Map(metadata.map((body) => [body.id, body])),
    [metadata]
  )

  return (
    <>
      {trails.map((trail) => {
        const trailMetadata = metadataByBodyId.get(trail.id)

        if (!trailMetadata || trail.positions.length < 2) {
          return null
        }

        return (
          <GlowingTrailLine
            key={trail.id}
            color={trailMetadata.color}
            opacity={getTrailOpacity(focusedBodyId, trail.id)}
            positions={trail.positions}
          />
        )
      })}
    </>
  )
}

function getTrailOpacity(focusedBodyId: ViewTargetId, trailBodyId: BodyTrail['id']) {
  if (focusedBodyId === 'overview') {
    return 0.35
  }

  return focusedBodyId === trailBodyId ? 0.65 : 0.18
}
