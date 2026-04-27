import { useMemo } from 'react'
import { type BodyMetadata, type BodyTrail } from '../domain/body'
import { getTrailRenderStyle } from '../rendering/trailRenderStyle'
import { GlowingTrailLine } from './GlowingTrailLine'

type OrbitTrailsProps = {
  metadata: BodyMetadata[]
  trails: BodyTrail[]
}

export function OrbitTrails({
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

        const trailStyle = getTrailRenderStyle()

        return (
          <GlowingTrailLine
            key={trail.id}
            color={trailMetadata.color}
            colorIntensity={trailStyle.colorIntensity}
            lineWidth={trailStyle.lineWidth}
            positions={trail.positions}
          />
        )
      })}
    </>
  )
}
