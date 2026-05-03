import { type BodyDefinition } from '../domain/body'
import { hasBodyTexture } from '../rendering/bodyTextures'
import { EarthSurfaceMaterial } from './EarthSurfaceMaterial'
import { MoonSurfaceMaterial } from './MoonSurfaceMaterial'
import { SaturnSurfaceMaterial } from './SaturnSurfaceMaterial'
import { SolidBodyMaterial } from './SolidBodyMaterial'
import { TexturedPlanetMaterial } from './TexturedPlanetMaterial'

type BodySurfaceMaterialProps = {
  body: BodyDefinition
  sunPosition: [number, number, number]
}

export function BodySurfaceMaterial({
  body,
  sunPosition
}: BodySurfaceMaterialProps) {
  const useSolidMaterial = body.material === 'basic' && !hasBodyTexture(body.id)

  if (body.material === 'saturn') {
    return (
      <SaturnSurfaceMaterial
        bodyPosition={body.position}
        poleDirectionRender={body.poleDirectionRender}
        radius={body.radius}
        sunPosition={sunPosition}
      />
    )
  }

  if (body.material === 'earth') {
    return (
      <EarthSurfaceMaterial
        bodyPosition={body.position}
        poleDirectionRender={body.poleDirectionRender}
        sunPosition={sunPosition}
      />
    )
  }

  if (body.material === 'moon') {
    return (
      <MoonSurfaceMaterial
        bodyPosition={body.position}
        sunPosition={sunPosition}
      />
    )
  }

  if (useSolidMaterial) {
    return (
      <SolidBodyMaterial
        bodyPosition={body.position}
        color={body.color}
        sunPosition={sunPosition}
      />
    )
  }

  return (
    <TexturedPlanetMaterial
      bodyId={body.id}
      bodyPosition={body.position}
      sunPosition={sunPosition}
    />
  )
}

