import { useMemo } from 'react';
import { useWorldSpaceLighting } from '../hooks/useWorldSpaceLighting';
import { loadMoonDayTexture, loadMoonHeightTexture } from '../rendering/moonSurface';
import { setupBumpMappedMaterial, type ShaderType } from '../rendering/shaderInjection';

type MoonSurfaceMaterialProps = {
  bodyPosition: [number, number, number];
  sunPosition: [number, number, number];
};

/** Ambient light level for the Moon surface. */
const MOON_AMBIENT = 0.03;

/** Bump scale for the Moon's terrain features - higher value = more pronounced craters. */
const MOON_BUMP_SCALE = 4.0;

export function MoonSurfaceMaterial({
  bodyPosition,
  sunPosition
}: MoonSurfaceMaterialProps) {
  const moonTexture = useMemo(() => loadMoonDayTexture(), []);
  const moonHeightTexture = useMemo(() => loadMoonHeightTexture(), []);

  const { lightDirection, registerShader } = useWorldSpaceLighting({
    bodyPosition,
    sunPosition,
  });

  // Use meshBasicMaterial as base - our custom shader handles all lighting
  // Displacement is handled by the vertex shader includes in meshBasicMaterial
  return (
    <meshBasicMaterial
      color="#ffffff"
      map={moonTexture}
      onBeforeCompile={(shader) => {
        // Add displacement map support to meshBasicMaterial
        shader.uniforms.displacementMap = { value: moonHeightTexture };
        shader.uniforms.displacementScale = { value: 0.010 };
        shader.uniforms.displacementBias = { value: 0 };
        
        registerShader(shader as unknown as Parameters<typeof registerShader>[0]);
        setupBumpMappedMaterial(
          shader as unknown as ShaderType,
          lightDirection,
          moonHeightTexture,
          MOON_BUMP_SCALE,
          MOON_AMBIENT
        );
      }}
    />
  );
}
