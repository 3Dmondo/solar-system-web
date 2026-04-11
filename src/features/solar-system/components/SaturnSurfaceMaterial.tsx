import { useMemo } from 'react';
import { Vector3, type ColorRepresentation } from 'three';
import {
  createSaturnRingNormal,
  createSaturnRingTexture,
  SATURN_RING_INNER_MULTIPLIER,
  SATURN_RING_OUTER_MULTIPLIER
} from '../rendering/saturnRings';

type SaturnSurfaceMaterialProps = {
  color: ColorRepresentation;
  radius: number;
};

export function SaturnSurfaceMaterial({ color, radius }: SaturnSurfaceMaterialProps) {
  const ringTexture = useMemo(() => createSaturnRingTexture(), []);
  const ringNormal = useMemo(() => new Vector3(...createSaturnRingNormal()).normalize(), []);
  const ringInnerRadius = radius * SATURN_RING_INNER_MULTIPLIER;
  const ringOuterRadius = radius * SATURN_RING_OUTER_MULTIPLIER;

  return (
    <meshStandardMaterial
      color={color}
      metalness={0.02}
      onBeforeCompile={(shader) => {
        shader.uniforms.ringTexture = { value: ringTexture };
        shader.uniforms.ringNormal = { value: ringNormal };
        shader.uniforms.ringInnerRadius = { value: ringInnerRadius };
        shader.uniforms.ringOuterRadius = { value: ringOuterRadius };
        shader.uniforms.ringShadowStrength = { value: 0.72 };
        shader.uniforms.saturnLightDirection = { value: new Vector3(10, 6, 8).normalize() };

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
uniform sampler2D ringTexture;
uniform vec3 ringNormal;
uniform float ringInnerRadius;
uniform float ringOuterRadius;
uniform float ringShadowStrength;
uniform vec3 saturnLightDirection;
varying vec3 vLocalPosition;

float getRingShadowMask(vec3 localPosition, vec3 lightDirection) {
  vec3 localNormal = normalize(localPosition);
  float lightFacing = dot(localNormal, lightDirection);

  if (lightFacing <= -0.08) {
    return 0.0;
  }

  float litFade = smoothstep(-0.08, 0.18, lightFacing);

  float planeDot = dot(lightDirection, ringNormal);

  if (abs(planeDot) < 0.0001) {
    return 0.0;
  }

  float travel = -dot(localPosition, ringNormal) / planeDot;

  if (travel <= 0.0) {
    return 0.0;
  }

  vec3 intersection = localPosition + lightDirection * travel;
  vec3 radialVector = intersection - ringNormal * dot(intersection, ringNormal);
  float radialDistance = length(radialVector);

  if (radialDistance < ringInnerRadius || radialDistance > ringOuterRadius) {
    return 0.0;
  }

  float radialT = (radialDistance - ringInnerRadius) / (ringOuterRadius - ringInnerRadius);
  float bandAlpha = texture2D(ringTexture, vec2(radialT, 0.5)).a;

  return bandAlpha * ringShadowStrength * litFade;
}`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `float ringShadowMask = getRingShadowMask(vLocalPosition, normalize(saturnLightDirection));
gl_FragColor.rgb *= (1.0 - ringShadowMask);

#include <dithering_fragment>`
        );
      }}
      roughness={0.82}
    />
  );
}
