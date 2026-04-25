import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { EARTH_CLOUD_UV_SPEED, EARTH_CLOUD_SHADOW_SHELL_RADIUS } from '../rendering/earthMotion';
import {
  loadEarthCloudTexture,
  loadEarthDayTexture,
  loadEarthNightTexture,
  loadEarthNormalTexture,
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
    <meshBasicMaterial
      color="#ffffff"
      map={dayTexture}
      onBeforeCompile={(shader) => {
        shader.uniforms.earthNightTexture = { value: nightTexture };
        shader.uniforms.earthCloudTexture = { value: cloudTexture };
        shader.uniforms.earthNormalTexture = { value: normalTexture };
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

        // meshBasicMaterial: inject world normal and position after project_vertex
        shader.vertexShader = shader.vertexShader.replace(
          '#include <project_vertex>',
          `#include <project_vertex>
vEarthUv = uv;
vEarthWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
vEarthWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `#include <common>
uniform sampler2D earthNightTexture;
uniform sampler2D earthCloudTexture;
uniform sampler2D earthNormalTexture;
uniform sampler2D earthSpecularTexture;
uniform float earthCloudOffset;
uniform vec3 earthLightDirection;
uniform vec3 earthPoleDirection;
varying vec2 vEarthUv;
varying vec3 vEarthWorldNormal;
varying vec3 vEarthWorldPosition;
const float EARTH_CLOUD_SHADOW_SHELL_RADIUS = ${EARTH_CLOUD_SHADOW_SHELL_RADIUS.toFixed(3)};
const float EARTH_CLOUD_SEAM_BLEND_WIDTH = 0.01;
const float EARTH_NORMAL_SCALE = 2.0;

// Perturb normal using tangent-space normal map
// Uses spherical tangent frame which is robust regardless of screen size
vec3 perturbNormalWithNormalMap(vec3 normal, vec2 uv) {
  // Compute tangent frame from spherical geometry
  // Tangent points along longitude (U direction), bitangent along latitude (V direction)
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(up, normal));
  if (length(tangent) < 0.001) {
    tangent = vec3(1.0, 0.0, 0.0);
  }
  vec3 bitangent = normalize(cross(normal, tangent));
  
  // Sample normal map and convert from [0,1] to [-1,1]
  vec3 mapN = texture2D(earthNormalTexture, uv).xyz * 2.0 - 1.0;
  mapN.xy *= EARTH_NORMAL_SCALE;
  mapN = normalize(mapN);
  
  // Transform from tangent space to world space
  mat3 TBN = mat3(tangent, bitangent, normal);
  return normalize(TBN * mapN);
}

// Project a world-space direction onto the cloud texture UV space, taking into
// account Earth's actual (tilted) pole direction so that shadow latitude rings
// follow the body pole rather than world Y.
vec2 directionToCloudUv(vec3 direction) {
  vec3 dir = normalize(direction);
  vec3 pole = normalize(earthPoleDirection);
  vec3 worldRef = abs(pole.x) < 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 0.0, 1.0);
  vec3 equatX = normalize(worldRef - dot(worldRef, pole) * pole);
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
  vec3 geometryNormal = normalize(vEarthWorldNormal);
  vec3 lightDirection = normalize(earthLightDirection);
  
  // Perturb normal with normal map for terrain detail
  vec3 worldNormal = perturbNormalWithNormalMap(geometryNormal, vEarthUv);
  
  // Use geometry normal for large-scale lighting, perturbed normal for detail
  float geometryLightFacing = max(dot(geometryNormal, lightDirection), 0.0);
  float detailLightFacing = max(dot(worldNormal, lightDirection), 0.0);
  
  // Blend between geometry and detail lighting for better mountain shadows
  float lightFacing = mix(geometryLightFacing, detailLightFacing, 0.7);
  
  // Custom diffuse lighting
  const float EARTH_AMBIENT = 0.04;
  float diffuse = EARTH_AMBIENT + (1.0 - EARTH_AMBIENT) * lightFacing;
  vec3 litBaseColor = baseColor * diffuse;
  
  // Night lights - push further into dark side
  // Start appearing when geometryLightFacing < 0.05, full at < -0.1
  float nightMask = 1.0 - smoothstep(-0.1, 0.05, geometryLightFacing);
  vec3 nightColor = texture2D(earthNightTexture, vEarthUv).rgb;
  
  // Cloud shadow projection
  float normalLightDot = dot(geometryNormal, lightDirection);
  float shellIntersection = -normalLightDot + sqrt(
    max(
      normalLightDot * normalLightDot + (EARTH_CLOUD_SHADOW_SHELL_RADIUS * EARTH_CLOUD_SHADOW_SHELL_RADIUS - 1.0),
      0.0
    )
  );
  vec3 cloudSampleDirection = normalize(geometryNormal + lightDirection * shellIntersection);
  vec2 cloudUv = directionToCloudUv(cloudSampleDirection);
  float cloudMask = 3.0 * sampleWrappedCloudMask(cloudUv);
  float cloudShadow = smoothstep(0.1, 0.9, cloudMask) * geometryLightFacing * 0.8;
  
  // Ocean specular with perturbed normal for wave detail
  vec3 viewDirection = normalize(cameraPosition - vEarthWorldPosition);
  vec3 halfVector = normalize(lightDirection + viewDirection);
  float rawSpecular = texture2D(earthSpecularTexture, vEarthUv).r;
  float waterMask = smoothstep(0.72, 0.98, rawSpecular);
  float specularTerm = pow(max(dot(worldNormal, halfVector), 0.0), 10.0);
  float fresnel = pow(1.0 - max(dot(worldNormal, viewDirection), 0.0), 2.5);
  float oceanSpecular = waterMask * specularTerm * geometryLightFacing * (0.18 + fresnel * 0.32);

  vec3 darkenedDay = litBaseColor * (1.0 - cloudShadow);
  vec3 specularColor = vec3(0.7, 0.84, 0.96) * oceanSpecular * 2.0;

  return darkenedDay + nightColor * nightMask * 0.7 + specularColor;
}`
        );

        // meshBasicMaterial: apply custom lighting after map is sampled
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <map_fragment>',
          `#include <map_fragment>
diffuseColor.rgb = applyEarthNightLights(diffuseColor.rgb);`
        );
      }}
    />
  );
}
