import { useMemo } from 'react'
import { type BodyId } from '../domain/body'
import { loadBodyTexture } from '../rendering/bodyTextures'

type TexturedPlanetMaterialProps = {
  bodyId: BodyId
}

export function TexturedPlanetMaterial({ bodyId }: TexturedPlanetMaterialProps) {
  const texture = useMemo(() => loadBodyTexture(bodyId), [bodyId])

  return (
    <meshStandardMaterial
      color="#ffffff"
      map={texture}
      metalness={0.01}
      roughness={bodyId === 'sun' ? 0.72 : 0.93}
      emissive={bodyId === 'sun' ? '#ffffff' : '#000000'}
      emissiveMap={bodyId === 'sun' ? texture : null}
      emissiveIntensity={bodyId === 'sun' ? 1.15 : 0}
    />
  )
}
