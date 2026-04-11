import { Vector3, type Texture } from 'three';

type SaturnRingMaterialProps = {
  ringTexture: Texture;
  radius: number;
};

export function SaturnRingMaterial({ ringTexture, radius }: SaturnRingMaterialProps) {
  return (
    <meshStandardMaterial
      alphaMap={ringTexture}
      alphaTest={0.08}
      color="#d8c39a"
      depthWrite={false}
      map={ringTexture}
      metalness={0.02}
      onBeforeCompile={(shader) => {
        shader.uniforms.saturnRadius = { value: radius };
        shader.uniforms.saturnLightDirection = { value: new Vector3(10, 6, 8).normalize() };
        shader.uniforms.saturnRingOcclusionStrength = { value: 0.82 };

        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `#include <common>
varying vec3 vLocalPosition;`
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
vLocalPosition = position;`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `#include <common>
uniform float saturnRadius;
uniform vec3 saturnLightDirection;
uniform float saturnRingOcclusionStrength;
varying vec3 vLocalPosition;

float getSphereOcclusion(vec3 ringPoint, vec3 lightDirection) {
  float b = dot(ringPoint, lightDirection);
  float c = dot(ringPoint, ringPoint) - saturnRadius * saturnRadius;
  float discriminant = b * b - c;

  if (discriminant <= 0.0) {
    return 0.0;
  }

  float nearestHit = -b - sqrt(discriminant);

  if (nearestHit <= 0.0) {
    return 0.0;
  }

  return saturnRingOcclusionStrength;
}`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `float sphereOcclusion = getSphereOcclusion(vLocalPosition, normalize(saturnLightDirection));
gl_FragColor.rgb *= (1.0 - sphereOcclusion);

#include <dithering_fragment>`
        );
      }}
      opacity={0.95}
      roughness={0.96}
      side={2}
      transparent
    />
  );
}
