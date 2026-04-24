import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { DoubleSide, Vector3 } from 'three';
import { type BodyId } from '../domain/body';
import {
  createSaturnRingGeometry,
  createSaturnRingTexture,
  SATURN_RING_TILT
} from '../rendering/saturnRings';
import { getSunLightDirection } from '../rendering/sunLighting';

type SaturnRingsProps = {
  bodyId: BodyId;
  bodyPosition: [number, number, number];
  onSelect: (bodyId: BodyId) => void;
  radius: number;
  sunPosition: [number, number, number];
};

export function SaturnRings({
  bodyId,
  bodyPosition,
  onSelect,
  radius,
  sunPosition
}: SaturnRingsProps) {
  const ringTexture = useMemo(() => createSaturnRingTexture(), []);
  const geometry = useMemo(() => createSaturnRingGeometry(radius), [radius]);
  const bodyCenter = useMemo(() => new Vector3(...bodyPosition), [bodyPosition]);
  const lightDirection = useMemo(
    () => getSunLightDirection(bodyPosition, sunPosition),
    [bodyPosition, sunPosition]
  );
  const lastTouchTapRef = useRef(0);
  const shaderRef = useRef<{
    uniforms: {
      saturnBodyCenter?: { value: Vector3 };
      saturnLightDirection?: { value: Vector3 };
    };
  } | null>(null);

  useFrame(() => {
    const shader = shaderRef.current;

    if (!shader) {
      return;
    }

    shader.uniforms.saturnBodyCenter?.value.copy(bodyCenter);
    shader.uniforms.saturnLightDirection?.value.copy(lightDirection);
  });

  const handleDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(bodyId);
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    if (event.pointerType !== 'touch') {
      return;
    }

    const now = performance.now();

    if (now - lastTouchTapRef.current < 320) {
      onSelect(bodyId);
      lastTouchTapRef.current = 0;
      return;
    }

    lastTouchTapRef.current = now;
  };

  return (
    <mesh
      geometry={geometry}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      rotation={[SATURN_RING_TILT, 0, 0]}
    >
      <meshBasicMaterial
        color="#fff6dd"
        depthWrite={false}
        map={ringTexture}
        opacity={1}
        side={DoubleSide}
        transparent
        onBeforeCompile={(shader) => {
          shader.uniforms.saturnBodyCenter = { value: bodyCenter };
          shader.uniforms.saturnBodyRadius = { value: radius };
          shader.uniforms.saturnLightDirection = { value: lightDirection };
          shader.uniforms.ringAmbient = { value: 0.84 };
          shader.uniforms.ringDirectional = { value: 0.16 };
          shader.uniforms.planetShadowDarkness = { value: 0.4 };
          shaderRef.current = shader as typeof shaderRef.current;

          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>
varying vec3 vRingWorldPosition;
varying vec3 vRingWorldNormal;`
          );

          shader.vertexShader = shader.vertexShader.replace(
            '#include <defaultnormal_vertex>',
            `#include <defaultnormal_vertex>
vRingWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`
          );

          shader.vertexShader = shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            `#include <worldpos_vertex>
vec4 ringWorldPosition = modelMatrix * vec4(transformed, 1.0);
vRingWorldPosition = ringWorldPosition.xyz;`
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `#include <common>
uniform vec3 saturnBodyCenter;
uniform float saturnBodyRadius;
uniform vec3 saturnLightDirection;
uniform float ringAmbient;
uniform float ringDirectional;
uniform float planetShadowDarkness;
varying vec3 vRingWorldPosition;
varying vec3 vRingWorldNormal;

float getSphereShadowMask(vec3 worldPosition, vec3 lightDirection) {
  vec3 rayOrigin = worldPosition - saturnBodyCenter;
  float b = dot(rayOrigin, lightDirection);
  float c = dot(rayOrigin, rayOrigin) - saturnBodyRadius * saturnBodyRadius;
  float h = b * b - c;

  if (h <= 0.0) {
    return 0.0;
  }

  float sqrtH = sqrt(h);
  float nearHit = -b - sqrtH;
  float farHit = -b + sqrtH;

  if (farHit <= 0.0001) {
    return 0.0;
  }

  return nearHit > 0.0001 || farHit > 0.0001 ? 1.0 : 0.0;
}`
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `vec3 ringNormal = normalize(vRingWorldNormal);
if (!gl_FrontFacing) {
  ringNormal *= -1.0;
}
vec3 lightDirection = normalize(saturnLightDirection);
float ringLightFacing = abs(dot(ringNormal, lightDirection));
float planetShadow = getSphereShadowMask(vRingWorldPosition, lightDirection);
float ringBrightness = ringAmbient + ringDirectional * smoothstep(0.0, 0.3, ringLightFacing);

gl_FragColor.rgb *= ringBrightness;
gl_FragColor.rgb *= mix(1.0, planetShadowDarkness, planetShadow);

#include <dithering_fragment>`
          );
        }}
      />
    </mesh>
  );
}
