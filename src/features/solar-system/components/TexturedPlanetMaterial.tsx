import { useMemo } from 'react'
import { type BodyId } from '../domain/body'
import { useWorldSpaceLighting } from '../hooks/useWorldSpaceLighting'
import { loadBodyTexture } from '../rendering/bodyTextures'
import { setupBasicDiffuseMaterial, type ShaderType } from '../rendering/shaderInjection'

type TexturedPlanetMaterialProps = {
  bodyId: BodyId
  bodyPosition: [number, number, number]
  sunPosition: [number, number, number]
}

/** Ambient light level for standard planets (non-Sun bodies). */
const PLANET_AMBIENT = 0.06

export function TexturedPlanetMaterial({
  bodyId,
  bodyPosition,
  sunPosition
}: TexturedPlanetMaterialProps) {
  const texture = useMemo(() => loadBodyTexture(bodyId), [bodyId])
  const isSun = bodyId === 'sun'

  // For the Sun, we don't need lighting since it's emissive
  const { lightDirection, registerShader } = useWorldSpaceLighting({
    bodyPosition,
    sunPosition,
  })

  // Sun uses meshBasicMaterial with emissive appearance (no lighting needed)
  // Other planets use meshBasicMaterial with custom world-space lighting
  if (isSun) {
    return (
      <meshBasicMaterial
        color="#ffffff"
        map={texture}
      />
    )
  }

  return (
    <meshBasicMaterial
      color="#ffffff"
      map={texture}
      onBeforeCompile={(shader) => {
        registerShader(shader as unknown as Parameters<typeof registerShader>[0])
        setupBasicDiffuseMaterial(
          shader as unknown as ShaderType,
          lightDirection,
          PLANET_AMBIENT
        )
      }}
    />
  )
}
