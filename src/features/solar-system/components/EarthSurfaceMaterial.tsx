import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TangentSpaceNormalMap, Vector2, Vector3 } from 'three';
import { EARTH_CLOUD_UV_SPEED, EARTH_CLOUD_SHADOW_SHELL_RADIUS } from '../rendering/earthMotion';
import {
  loadEarthCloudTexture,
  loadEarthDayTexture,
  loadEarthNormalTexture,
  loadEarthNightTexture,
  loadEarthSpecularTexture
} from '../rendering/earthSurface';
import { getSunLightDirection } from '../rendering/sunLighting';
import { useSimulationClockContext } from '../../experience/state/SimulationClockContext';

type EarthSurfaceMaterialProps = {
  bodyPosition: [number, number, number];
  poleDirectionRender?: [number, number, number];
  sunPosition: [number, number, number];
};

export function EarthSurfaceMaterial({
  bodyPosition,
  poleDirectionRender,
  sunPosition
}: EarthSurfaceMaterialProps) {
  const dayTexture = useMemo(() => loadEarthDayTexture(), []);
  const nightTexture = useMemo(() => loadEarthNightTexture(), []);
  const cloudTexture = useMemo(() => loadEarthCloudTexture(), []);
  const normalTexture = useMemo(() => loadEarthNormalTexture(), []);
  const specularTexture = useMemo(() => loadEarthSpecularTexture(), []);
  const lightDirection = useMemo(
    () => getSunLightDirection(bodyPosition, sunPosition),
    [bodyPosition, sunPosition]
  );
  const shaderRef = useRef<{
    uniforms: {
      earthCloudTexture?: { value: unknown };
      earthCloudOffset?: { value: number };
      earthLightDirection?: { value: Vector3 };
      earthSpecularTexture?: { value: unknown };
    };
  } | null>(null);
  const { playbackRateMultiplier, isPaused } = useSimulationClockContext();
  // Build a normalised Vector3 for the pole direction uniform (defaults to Y-up
  // if metadata is not yet available, to stay backwards-compatible).
  const poleVec = useMemo(() => {
    if (!poleDirectionRender) return new Vector3(0, 1, 0)
    return new Vector3(...poleDirectionRender).normalize()
  }, [poleDirectionRender])

  useFrame((_, delta) => {
    const earthCloudOffset = shaderRef.current?.uniforms.earthCloudOffset;
    const earthLightDirection = shaderRef.current?.uniforms.earthLightDirection;

    if (!earthCloudOffset) {
      return;
    }

    const simDelta = isPaused ? 0 : delta * playbackRateMultiplier;
    earthCloudOffset.value = (earthCloudOffset.value + simDelta * EARTH_CLOUD_UV_SPEED) % 1;

    if (earthLightDirection) {
      earthLightDirection.value.copy(lightDirection);
    }
  });

  return (
    <meshStandardMaterial
      color="#ffffff"
      map={dayTexture}
      metalness={0.02}
      normalMap={normalTexture}
      normalMapType={TangentSpaceNormalMap}
      normalScale={new Vector2(3.0, 3.0)}
      onBeforeCompile={(shader) => {
        shader.uniforms.earthNightTexture = { value: nightTexture };
        shader.uniforms.earthCloudTexture = { value: cloudTexture };
        shader.uniforms.earthSpecularTexture = { value: specularTexture };
        shader.uniforms.earthCloudOffset = { value: 0 };
        shader.uniforms.earthLightDirection = { value: lightDirection };
        shader.uniforms.earthPoleDirection = { value: poleVec };
        shaderRef.current = shader as typeof shaderRef.current;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `#include <common>
varying vec2 vEarthUv;
varying vec3 vEarthWorldNormal;
varying vec3 vEarthWorldPosition;`
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <uv_vertex>',
          `#include <uv_vertex>
vEarthUv = uv;`
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <defaultnormal_vertex>',
          `#include <defaultnormal_vertex>
vEarthWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <worldpos_vertex>',
          `#include <worldpos_vertex>
vec4 earthWorldPosition = modelMatrix * vec4(transformed, 1.0);
vEarthWorldPosition = earthWorldPosition.xyz;`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `#include <common>
uniform sampler2D earthNightTexture;
uniform sampler2D earthCloudTexture;
uniform sampler2D earthSpecularTexture;
uniform float earthCloudOffset;
uniform vec3 earthLightDirection;
uniform vec3 earthPoleDirection;
varying vec2 vEarthUv;
varying vec3 vEarthWorldNormal;
varying vec3 vEarthWorldPosition;
const float EARTH_CLOUD_SHADOW_SHELL_RADIUS = ${EARTH_CLOUD_SHADOW_SHELL_RADIUS.toFixed(3)};
const float EARTH_CLOUD_SEAM_BLEND_WIDTH = 0.01;

// Project a world-space direction onto the cloud texture UV space, taking into
// account Earth's actual (tilted) pole direction so that shadow latitude rings
// follow the body pole rather than world Y.
vec2 directionToCloudUv(vec3 direction) {
  vec3 dir = normalize(direction);
  vec3 pole = normalize(earthPoleDirection);
  // Build an equatorial reference frame in the plane perpendicular to the pole.
  // Use world X as the reference unless it is nearly parallel to the pole.
  vec3 worldRef = abs(pole.x) < 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 0.0, 1.0);
  // equatX: component of worldRef perpendicular to the pole (Gram-Schmidt).
  vec3 equatX = normalize(worldRef - dot(worldRef, pole) * pole);
  // equatY completes the right-hand equatorial frame; cross(equatX, pole)
  // gives the +longitude direction consistent with the original atan(z,x) convention.
  vec3 equatY = cross(equatX, pole);
  float sinLat = clamp(dot(dir, pole), -1.0, 1.0);
  float v = asin(sinLat) / PI + 0.5;
  float u = atan(dot(dir, equatY), dot(dir, equatX)) / (2.0 * PI) + 0.5;
  return vec2(fract(1.0 - u - earthCloudOffset), clamp(v, 0.001, 0.999));
}

float sampleWrappedCloudMask(vec2 uv) {
  float wrappedU = fract(uv.x);
  vec2 primaryUv = vec2(wrappedU, uv.y);
  float primarySample = texture2D(earthCloudTexture, primaryUv).r;

  float seamBlend = 0.0;
  float seamSample = primarySample;

  if (wrappedU < EARTH_CLOUD_SEAM_BLEND_WIDTH) {
    seamBlend = 1.0 - smoothstep(0.0, EARTH_CLOUD_SEAM_BLEND_WIDTH, wrappedU);
    seamSample = texture2D(earthCloudTexture, vec2(wrappedU + 1.0, uv.y)).r;
  } else if (wrappedU > 1.0 - EARTH_CLOUD_SEAM_BLEND_WIDTH) {
    seamBlend = smoothstep(1.0 - EARTH_CLOUD_SEAM_BLEND_WIDTH, 1.0, wrappedU);
    seamSample = texture2D(earthCloudTexture, vec2(wrappedU - 1.0, uv.y)).r;
  }

  return mix(primarySample, seamSample, seamBlend);
}

vec3 applyEarthNightLights(vec3 baseColor) {
  vec3 worldNormal = normalize(vEarthWorldNormal);
  vec3 lightDirection = normalize(earthLightDirection);
  float lightFacing = max(dot(worldNormal, lightDirection), 0.0);
  float nightMask = 1.0 - smoothstep(0.08, 0.24, lightFacing);
  vec3 nightColor = texture2D(earthNightTexture, vEarthUv).rgb;
  float normalLightDot = dot(worldNormal, lightDirection);
  float shellIntersection = -normalLightDot + sqrt(
    max(
      normalLightDot * normalLightDot + (EARTH_CLOUD_SHADOW_SHELL_RADIUS * EARTH_CLOUD_SHADOW_SHELL_RADIUS - 1.0),
      0.0
    )
  );
  vec3 cloudSampleDirection = normalize(worldNormal + lightDirection * shellIntersection);
  vec2 cloudUv = directionToCloudUv(cloudSampleDirection);
  float cloudMask = 3.0 * sampleWrappedCloudMask(cloudUv);
  float cloudShadow = smoothstep(0.1, 0.9, cloudMask) * lightFacing * 0.3;
  vec3 viewDirection = normalize(cameraPosition - vEarthWorldPosition);
  vec3 halfVector = normalize(lightDirection + viewDirection);
  float rawSpecular = texture2D(earthSpecularTexture, vEarthUv).r;
  float waterMask = smoothstep(0.72, 0.98, rawSpecular);
  float specularTerm = pow(max(dot(worldNormal, halfVector), 0.0), 10.0);
  float fresnel = pow(1.0 - max(dot(worldNormal, viewDirection), 0.0), 2.5);
  float oceanSpecular = waterMask * specularTerm * lightFacing * (0.18 + fresnel * 0.32);

  vec3 darkenedDay = baseColor * mix(0.18, 1.0 - cloudShadow, 1.0 - nightMask);
  vec3 specularColor = vec3(0.7, 0.84, 0.96) * oceanSpecular * 2.0;

  return darkenedDay + nightColor * nightMask * 0.7 + specularColor;
}`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `gl_FragColor.rgb = applyEarthNightLights(gl_FragColor.rgb);

#include <dithering_fragment>`
        );
      }}
      roughness={0.88}
    />
  );
}
