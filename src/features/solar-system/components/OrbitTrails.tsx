import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { type Object3D } from 'three'
import { type BodyMetadata, type BodyTrail, type ViewTargetId } from '../domain/body'

type OrbitTrailsProps = {
  focusedBodyId: ViewTargetId
  metadata: BodyMetadata[]
  trails: BodyTrail[]
}

const ignoreTrailRaycast: Object3D['raycast'] = () => undefined

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
          <OrbitTrail
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

function OrbitTrail({
  color,
  opacity,
  positions
}: {
  color: string
  opacity: number
  positions: Array<[number, number, number]>
}) {
  return (
    <Line
      color={color}
      depthWrite={false}
      frustumCulled={false}
      lineWidth={2}
      opacity={opacity}
      points={positions}
      raycast={ignoreTrailRaycast}
      renderOrder={1}
      toneMapped={false}
      transparent
    />
  )
}

function getTrailOpacity(focusedBodyId: ViewTargetId, trailBodyId: BodyTrail['id']) {
  if (focusedBodyId === 'overview') {
    return 0.22
  }

  return focusedBodyId === trailBodyId ? 0.55 : 0.12
}
