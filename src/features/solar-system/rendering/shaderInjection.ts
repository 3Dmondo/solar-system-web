/**
 * Helper functions for injecting custom shader code via onBeforeCompile.
 *
 * These utilities provide a standardized way to modify Three.js materials
 * with world-space lighting calculations. All injections follow the same
 * patterns to ensure consistency across materials.
 */

import type { IUniform, Vector3 } from 'three';
import {
  WORLD_NORMAL_VARYING_DECLARATION,
  WORLD_NORMAL_COMPUTATION,
  WORLD_POSITION_VARYING_DECLARATION,
  WORLD_POSITION_COMPUTATION,
  WORLD_NORMAL_VARYING_RECEIVE,
  WORLD_POSITION_VARYING_RECEIVE,
  LIGHT_DIRECTION_UNIFORM,
  DIFFUSE_WITH_AMBIENT_FUNCTION,
  SPECULAR_BLINN_PHONG_FUNCTION,
  FRESNEL_FUNCTION,
  BUMP_PERTURBATION_FUNCTION
} from './shaderChunks';

/**
 * Shader object passed to onBeforeCompile callback.
 * We define a minimal interface for the parts we modify.
 */
export interface ShaderType {
  uniforms: Record<string, IUniform>;
  vertexShader: string;
  fragmentShader: string;
}

/**
 * Standard shader ref type for storing a reference to the compiled shader.
 * Use this with useRef to update uniforms in useFrame.
 */
export interface ShaderRef {
  uniforms: {
    lightDirection?: { value: Vector3 };
    [key: string]: { value: unknown } | undefined;
  };
}

// =============================================================================
// VERTEX SHADER INJECTIONS
// =============================================================================

/**
 * Injects world-space normal varying into vertex shader.
 * This enables world-space lighting calculations in the fragment shader.
 */
export function injectWorldNormal(shader: ShaderType): void {
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `#include <common>
${WORLD_NORMAL_VARYING_DECLARATION}`
  );

  shader.vertexShader = shader.vertexShader.replace(
    '#include <defaultnormal_vertex>',
    `#include <defaultnormal_vertex>
${WORLD_NORMAL_COMPUTATION}`
  );
}

/**
 * Injects world-space position varying into vertex shader.
 * This enables position-dependent effects like specular highlights.
 */
export function injectWorldPosition(shader: ShaderType): void {
  // Only add declaration if not already present (from injectWorldNormal combo call)
  if (!shader.vertexShader.includes(WORLD_POSITION_VARYING_DECLARATION)) {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
${WORLD_POSITION_VARYING_DECLARATION}`
    );
  }

  shader.vertexShader = shader.vertexShader.replace(
    '#include <worldpos_vertex>',
    `#include <worldpos_vertex>
${WORLD_POSITION_COMPUTATION}`
  );
}

/**
 * Injects both world normal and world position varyings.
 * This is the most common case for materials with specular effects.
 */
export function injectWorldSpaceVaryings(shader: ShaderType): void {
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `#include <common>
${WORLD_NORMAL_VARYING_DECLARATION}
${WORLD_POSITION_VARYING_DECLARATION}`
  );

  shader.vertexShader = shader.vertexShader.replace(
    '#include <defaultnormal_vertex>',
    `#include <defaultnormal_vertex>
${WORLD_NORMAL_COMPUTATION}`
  );

  shader.vertexShader = shader.vertexShader.replace(
    '#include <worldpos_vertex>',
    `#include <worldpos_vertex>
${WORLD_POSITION_COMPUTATION}`
  );
}

/**
 * Injects UV varying into vertex shader.
 * Many materials need access to UVs in fragment shader.
 */
export function injectUvVarying(shader: ShaderType): void {
  // Check if already injected
  if (shader.vertexShader.includes('varying vec2 vUv;')) {
    return;
  }

  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `#include <common>
varying vec2 vUv;`
  );

  shader.vertexShader = shader.vertexShader.replace(
    '#include <uv_vertex>',
    `#include <uv_vertex>
vUv = uv;`
  );
}

// =============================================================================
// FRAGMENT SHADER INJECTIONS
// =============================================================================

/**
 * Injects light direction uniform into fragment shader.
 * Call this to add the standardized lightDirection uniform.
 */
export function injectLightDirectionUniform(
  shader: ShaderType,
  initialValue: Vector3
): void {
  shader.uniforms.lightDirection = { value: initialValue };

  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <common>',
    `#include <common>
${LIGHT_DIRECTION_UNIFORM}`
  );
}

/**
 * Injects basic diffuse lighting function into fragment shader.
 * Includes world normal varying receive and diffuse function.
 */
export function injectDiffuseLighting(
  shader: ShaderType,
  lightDirection: Vector3
): void {
  shader.uniforms.lightDirection = { value: lightDirection };

  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <common>',
    `#include <common>
${LIGHT_DIRECTION_UNIFORM}
${WORLD_NORMAL_VARYING_RECEIVE}
${DIFFUSE_WITH_AMBIENT_FUNCTION}`
  );
}

/**
 * Injects full lighting setup with specular and fresnel capabilities.
 * Use this for materials that need specular highlights.
 */
export function injectFullLighting(
  shader: ShaderType,
  lightDirection: Vector3
): void {
  shader.uniforms.lightDirection = { value: lightDirection };

  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <common>',
    `#include <common>
${LIGHT_DIRECTION_UNIFORM}
${WORLD_NORMAL_VARYING_RECEIVE}
${WORLD_POSITION_VARYING_RECEIVE}
${DIFFUSE_WITH_AMBIENT_FUNCTION}
${SPECULAR_BLINN_PHONG_FUNCTION}
${FRESNEL_FUNCTION}`
  );
}

/**
 * Injects bump mapping function into fragment shader.
 * Requires bumpMap uniform to be set separately.
 */
export function injectBumpMapping(shader: ShaderType): void {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <common>',
    `#include <common>
${BUMP_PERTURBATION_FUNCTION}`
  );
}

// =============================================================================
// COMPLETE MATERIAL SETUPS
// =============================================================================

/**
 * Complete setup for a basic diffuse-lit material.
 * Works with meshBasicMaterial by computing normals from position.
 *
 * @param shader - The shader object from onBeforeCompile
 * @param lightDirection - Initial light direction vector
 * @param ambient - Ambient light level (0-1), default 0.1
 */
export function setupBasicDiffuseMaterial(
  shader: ShaderType,
  lightDirection: Vector3,
  ambient = 0.1
): void {
  // Inject uniforms
  shader.uniforms.lightDirection = { value: lightDirection };
  shader.uniforms.ambientLevel = { value: ambient };

  // For meshBasicMaterial, we compute world normal from world position
  // since it doesn't have the normal-related includes
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `#include <common>
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;`
  );

  // Inject world position and normal computation after project_vertex
  // meshBasicMaterial has project_vertex, so we add our code after it
  shader.vertexShader = shader.vertexShader.replace(
    '#include <project_vertex>',
    `#include <project_vertex>
vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);`
  );

  // Fragment shader: add uniforms and functions
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <common>',
    `#include <common>
uniform vec3 lightDirection;
uniform float ambientLevel;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

float computeDiffuseWithAmbient(vec3 normal, vec3 lightDir, float ambient) {
  float diffuse = max(dot(normal, lightDir), 0.0);
  return ambient + (1.0 - ambient) * diffuse;
}`
  );

  // Apply lighting after the map is sampled (after map_fragment)
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <map_fragment>',
    `#include <map_fragment>
vec3 worldNormal = normalize(vWorldNormal);
vec3 lightDir = normalize(lightDirection);
float lighting = computeDiffuseWithAmbient(worldNormal, lightDir, ambientLevel);
diffuseColor.rgb *= lighting;`
  );
}

/**
 * Complete setup for a material with diffuse lighting and bump mapping.
 * Works with meshBasicMaterial. Suitable for the Moon surface.
 *
 * @param shader - The shader object from onBeforeCompile
 * @param lightDirection - Initial light direction vector
 * @param bumpMap - Bump map texture
 * @param bumpScale - Bump scale factor
 * @param ambient - Ambient light level (0-1), default 0.08
 */
export function setupBumpMappedMaterial(
  shader: ShaderType,
  lightDirection: Vector3,
  bumpMap: unknown,
  bumpScale: number,
  ambient = 0.08
): void {
  // Inject uniforms
  shader.uniforms.lightDirection = { value: lightDirection };
  shader.uniforms.bumpMap = { value: bumpMap };
  shader.uniforms.bumpScale = { value: bumpScale };
  shader.uniforms.ambientLevel = { value: ambient };

  // Vertex shader: add varyings for world space data and UVs
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `#include <common>
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vBumpUv;`
  );

  // Inject world position and normal computation after project_vertex
  shader.vertexShader = shader.vertexShader.replace(
    '#include <project_vertex>',
    `#include <project_vertex>
vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
vBumpUv = uv;`
  );

  // Fragment shader: add uniforms and bump perturbation function
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <common>',
    `#include <common>
uniform vec3 lightDirection;
uniform sampler2D bumpMap;
uniform float bumpScale;
uniform float ambientLevel;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vBumpUv;

float computeDiffuseWithAmbient(vec3 normal, vec3 lightDir, float ambient) {
  float diffuse = max(dot(normal, lightDir), 0.0);
  return ambient + (1.0 - ambient) * diffuse;
}

// Perturb normal using height map with fixed UV offsets
// This is more robust than screen-space derivatives for planet-scale objects
vec3 perturbNormalWithBump(vec3 normal, vec2 uv) {
  // Use fixed texel offset based on typical texture resolution
  const float texelSize = 1.0 / 2048.0;
  
  float h = texture2D(bumpMap, uv).r;
  float hRight = texture2D(bumpMap, uv + vec2(texelSize, 0.0)).r;
  float hUp = texture2D(bumpMap, uv + vec2(0.0, texelSize)).r;
  
  // Height differences scaled by bumpScale
  float dhx = (hRight - h) * bumpScale;
  float dhy = (hUp - h) * bumpScale;
  
  // Compute tangent frame from spherical UVs
  // For a sphere, tangent points along increasing U (longitude), bitangent along increasing V (latitude)
  // These are approximate but work well for spherical planets
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(up, normal));
  if (length(tangent) < 0.001) {
    tangent = vec3(1.0, 0.0, 0.0);
  }
  vec3 bitangent = normalize(cross(normal, tangent));
  
  // Perturb normal based on height gradients
  return normalize(normal - tangent * dhx - bitangent * dhy);
}`
  );

  // Apply bump-mapped lighting after the map is sampled
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <map_fragment>',
    `#include <map_fragment>
vec3 baseNormal = normalize(vWorldNormal);
vec3 perturbedNormal = perturbNormalWithBump(baseNormal, vBumpUv);
vec3 lightDir = normalize(lightDirection);
float lighting = computeDiffuseWithAmbient(perturbedNormal, lightDir, ambientLevel);
diffuseColor.rgb *= lighting;`
  );
}
