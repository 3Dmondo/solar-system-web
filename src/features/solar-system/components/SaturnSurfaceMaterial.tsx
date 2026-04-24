import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import {
  createSaturnRingNormalFromPole,
  createSaturnRingTexture,
  SATURN_RING_INNER_MULTIPLIER,
  SATURN_RING_OUTER_MULTIPLIER
  ,
  SATURN_RING_SHADOW_TEXTURE_MAX_U,
  SATURN_RING_SHADOW_TEXTURE_MIN_U
} from '../rendering/saturnRings';
import { loadSaturnSurfaceTexture } from '../rendering/saturnSurface';
import { getSunLightDirection } from '../rendering/sunLighting';

type SaturnSurfaceMaterialProps = {
  bodyPosition: [number, number, number];
  poleDirectionRender?: [number, number, number];
  radius: number;
  sunPosition: [number, number, number];
};

export function SaturnSurfaceMaterial({
  bodyPosition,
  poleDirectionRender,
  radius,
  sunPosition
}: SaturnSurfaceMaterialProps) {
  const ringTexture = useMemo(() => createSaturnRingTexture(), []);
  const surfaceTexture = useMemo(() => loadSaturnSurfaceTexture(), []);
  const ringNormal = useMemo(
    () =>
      poleDirectionRender
        ? createSaturnRingNormalFromPole(poleDirectionRender)
        : new Vector3(0, 1, 0),
    [poleDirectionRender]
  );
  const bodyCenter = useMemo(() => new Vector3(...bodyPosition), [bodyPosition]);
  const lightDirection = useMemo(
    () => getSunLightDirection(bodyPosition, sunPosition),
    [bodyPosition, sunPosition]
  );
  const shaderRef = useRef<{
    uniforms: {
      bodyCenter?: { value: Vector3 };
      saturnLightDirection?: { value: Vector3 };
    };
  } | null>(null);
  const ringInnerRadius = radius * SATURN_RING_INNER_MULTIPLIER;
  const ringOuterRadius = radius * SATURN_RING_OUTER_MULTIPLIER;

  useFrame(() => {
    const shader = shaderRef.current;

    if (!shader) {
      return;
    }

    shader.uniforms.bodyCenter?.value.copy(bodyCenter);
    shader.uniforms.saturnLightDirection?.value.copy(lightDirection);
  });

  return (
    <meshStandardMaterial
      color="#ffffff"
      map={surfaceTexture}
      metalness={0.02}
      onBeforeCompile={(shader) => {
        shader.uniforms.bodyCenter = { value: bodyCenter };
        shader.uniforms.ringTexture = { value: ringTexture };
        shader.uniforms.ringNormal = { value: ringNormal };
        shader.uniforms.ringInnerRadius = { value: ringInnerRadius };
        shader.uniforms.ringOuterRadius = { value: ringOuterRadius };
        shader.uniforms.ringTextureMaxU = { value: SATURN_RING_SHADOW_TEXTURE_MAX_U };
        shader.uniforms.ringTextureMinU = { value: SATURN_RING_SHADOW_TEXTURE_MIN_U };
        shader.uniforms.ringShadowStrength = { value: 0.72 };
        shader.uniforms.saturnLightDirection = { value: lightDirection };
        shaderRef.current = shader as typeof shaderRef.current;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `#include <common>
varying vec3 vWorldPosition;`
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <worldpos_vertex>',
          `#include <worldpos_vertex>
vec4 saturnWorldPosition = modelMatrix * vec4(transformed, 1.0);
vWorldPosition = saturnWorldPosition.xyz;`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `#include <common>
uniform vec3 bodyCenter;
uniform sampler2D ringTexture;
uniform vec3 ringNormal;
uniform float ringInnerRadius;
uniform float ringOuterRadius;
uniform float ringTextureMinU;
uniform float ringTextureMaxU;
uniform float ringShadowStrength;
uniform vec3 saturnLightDirection;
varying vec3 vWorldPosition;

float getRingShadowMask(vec3 worldPosition, vec3 lightDirection) {
  vec3 fromCenter = worldPosition - bodyCenter;
  vec3 worldNormal = normalize(fromCenter);
  float lightFacing = dot(worldNormal, lightDirection);

  if (lightFacing <= -0.08) {
    return 0.0;
  }

  float litFade = smoothstep(-0.08, 0.18, lightFacing);

  float planeDot = dot(lightDirection, ringNormal);

  if (abs(planeDot) < 0.0001) {
    return 0.0;
  }

  float travel = -dot(worldPosition - bodyCenter, ringNormal) / planeDot;

  if (travel <= 0.0) {
    return 0.0;
  }

  vec3 intersection = worldPosition + lightDirection * travel;
  vec3 ringPlaneOffset = intersection - bodyCenter;
  vec3 radialVector = ringPlaneOffset - ringNormal * dot(ringPlaneOffset, ringNormal);
  float radialDistance = length(radialVector);

  if (radialDistance < ringInnerRadius || radialDistance > ringOuterRadius) {
    return 0.0;
  }

  float radialT = (radialDistance - ringInnerRadius) / (ringOuterRadius - ringInnerRadius);
  float textureU = mix(ringTextureMinU, ringTextureMaxU, radialT);
  float bandAlpha = texture2D(ringTexture, vec2(textureU, 0.5)).a;

  return bandAlpha * ringShadowStrength * litFade;
}`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `float ringShadowMask = getRingShadowMask(vWorldPosition, normalize(saturnLightDirection));
gl_FragColor.rgb *= (1.0 - ringShadowMask);

#include <dithering_fragment>`
        );
      }}
      roughness={0.82}
    />
  );
}
