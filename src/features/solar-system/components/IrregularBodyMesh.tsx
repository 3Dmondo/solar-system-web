import { useMemo } from 'react'
import { useLoader, type ThreeElements, type ThreeEvent } from '@react-three/fiber'
import { Box3, BufferGeometry, Mesh, Quaternion, Sphere, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { type BodyDefinition } from '../domain/body'
import { type BodyShapeAsset } from '../rendering/bodyShapeAssets'
import { computeBodyShapeNormalization } from '../rendering/bodyShapeScaling'
import { BodySurfaceMaterial } from './BodySurfaceMaterial'

type IrregularBodyMeshProps = {
  asset: BodyShapeAsset
  body: BodyDefinition
  meshProps: ThreeElements['mesh']
  onDoubleClick: (event: ThreeEvent<MouseEvent>) => void
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void
  sunPosition: [number, number, number]
}

type MeshGeometryEntry = {
  geometry: BufferGeometry
  position: [number, number, number]
  quaternion: [number, number, number, number]
  scale: [number, number, number]
}

export function IrregularBodyMesh({
  asset,
  body,
  meshProps,
  onDoubleClick,
  onPointerDown,
  sunPosition
}: IrregularBodyMeshProps) {
  const gltf = useLoader(GLTFLoader, asset.runtimeUrl)
  const { geometryEntries, normalization } = useMemo(() => {
    const entries: MeshGeometryEntry[] = []
    const position = new Vector3()
    const quaternion = new Quaternion()
    const scale = new Vector3()

    gltf.scene.updateMatrixWorld(true)
    gltf.scene.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return
      }

      object.matrixWorld.decompose(position, quaternion, scale)
      entries.push({
        geometry: object.geometry,
        position: [position.x, position.y, position.z],
        quaternion: [
          quaternion.x,
          quaternion.y,
          quaternion.z,
          quaternion.w
        ],
        scale: [scale.x, scale.y, scale.z]
      })
    })

    const sourceBounds = new Box3().setFromObject(gltf.scene)
    const sourceSphere = sourceBounds.getBoundingSphere(new Sphere())

    return {
      geometryEntries: entries,
      normalization: computeBodyShapeNormalization({
        bodyRadius: body.radius,
        sourceBoundingRadius: sourceSphere.radius,
        sourceCenter: [sourceSphere.center.x, sourceSphere.center.y, sourceSphere.center.z]
      })
    }
  }, [body.radius, gltf])

  return (
    <group
      position={normalization.position}
      scale={normalization.scale}
    >
      {geometryEntries.map((entry, index) => (
        <mesh
          {...meshProps}
          castShadow
          geometry={entry.geometry}
          key={`${asset.bodyId}-${index}`}
          onDoubleClick={onDoubleClick}
          onPointerDown={onPointerDown}
          position={entry.position}
          quaternion={entry.quaternion}
          receiveShadow
          scale={entry.scale}
        >
          <BodySurfaceMaterial body={body} sunPosition={sunPosition} />
        </mesh>
      ))}
    </group>
  )
}
