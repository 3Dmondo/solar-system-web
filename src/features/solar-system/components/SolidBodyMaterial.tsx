import { useWorldSpaceLighting } from '../hooks/useWorldSpaceLighting'
import { setupBasicDiffuseMaterial, type ShaderType } from '../rendering/shaderInjection'

type SolidBodyMaterialProps = {
  color: string
  bodyPosition: [number, number, number]
  sunPosition: [number, number, number]
}

const SOLID_BODY_AMBIENT = 0.08

export function SolidBodyMaterial({
  color,
  bodyPosition,
  sunPosition
}: SolidBodyMaterialProps) {
  const { lightDirection, registerShader } = useWorldSpaceLighting({
    bodyPosition,
    sunPosition
  })

  return (
    <meshBasicMaterial
      color={color}
      onBeforeCompile={(shader) => {
        registerShader(shader as unknown as Parameters<typeof registerShader>[0])
        setupBasicDiffuseMaterial(
          shader as unknown as ShaderType,
          lightDirection,
          SOLID_BODY_AMBIENT
        )
      }}
    />
  )
}
