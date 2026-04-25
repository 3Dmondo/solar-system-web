/**
 * Shared GLSL shader code chunks for world-space lighting.
 *
 * These constants provide standardized shader code that should be used across
 * all planet materials to ensure consistent lighting behavior on both desktop
 * and mobile GPUs.
 *
 * All lighting calculations use world-space coordinates to avoid view-matrix
 * inconsistencies that cause incorrect lighting on mobile Chrome/Android.
 */

// =============================================================================
// VERTEX SHADER CHUNKS
// =============================================================================

/** Varying declaration for world-space normal (vertex shader). */
export const WORLD_NORMAL_VARYING_DECLARATION = `varying vec3 vWorldNormal;`;

/** Computation to output world-space normal (place after #include <defaultnormal_vertex>). */
export const WORLD_NORMAL_COMPUTATION = `vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`;

/** Varying declaration for world-space position (vertex shader). */
export const WORLD_POSITION_VARYING_DECLARATION = `varying vec3 vWorldPosition;`;

/** Computation to output world-space position (place after #include <worldpos_vertex>). */
export const WORLD_POSITION_COMPUTATION = `vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`;

/** Combined varying declarations for both world normal and position. */
export const WORLD_SPACE_VARYINGS_DECLARATION = `${WORLD_NORMAL_VARYING_DECLARATION}
${WORLD_POSITION_VARYING_DECLARATION}`;

// =============================================================================
// FRAGMENT SHADER CHUNKS
// =============================================================================

/** Uniform declaration for standardized light direction (fragment shader). */
export const LIGHT_DIRECTION_UNIFORM = `uniform vec3 lightDirection;`;

/** Varying declaration for world-space normal (fragment shader). */
export const WORLD_NORMAL_VARYING_RECEIVE = `varying vec3 vWorldNormal;`;

/** Varying declaration for world-space position (fragment shader). */
export const WORLD_POSITION_VARYING_RECEIVE = `varying vec3 vWorldPosition;`;

/** Combined varying declarations for fragment shader. */
export const WORLD_SPACE_VARYINGS_RECEIVE = `${WORLD_NORMAL_VARYING_RECEIVE}
${WORLD_POSITION_VARYING_RECEIVE}`;

/**
 * Diffuse lighting function using Lambertian reflectance.
 * Returns a value in [0, 1] representing the diffuse intensity.
 */
export const DIFFUSE_FUNCTION = `
float computeDiffuse(vec3 normal, vec3 lightDir) {
  return max(dot(normal, lightDir), 0.0);
}`;

/**
 * Diffuse lighting with ambient term for non-zero illumination on dark side.
 * Returns: ambient + (1 - ambient) * diffuse
 */
export const DIFFUSE_WITH_AMBIENT_FUNCTION = `
float computeDiffuseWithAmbient(vec3 normal, vec3 lightDir, float ambient) {
  float diffuse = max(dot(normal, lightDir), 0.0);
  return ambient + (1.0 - ambient) * diffuse;
}`;

/**
 * Blinn-Phong specular lighting.
 * @param normal - Surface normal (normalized)
 * @param lightDir - Direction to light (normalized)
 * @param viewDir - Direction to camera (normalized)
 * @param shininess - Specular exponent (higher = tighter highlight)
 * @param strength - Intensity multiplier
 */
export const SPECULAR_BLINN_PHONG_FUNCTION = `
float computeSpecularBlinnPhong(vec3 normal, vec3 lightDir, vec3 viewDir, float shininess, float strength) {
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), shininess);
  return spec * strength;
}`;

/**
 * Fresnel effect using Schlick's approximation.
 * Returns a value in [0, 1] where 1 = grazing angle (rim lighting).
 */
export const FRESNEL_FUNCTION = `
float computeFresnel(vec3 normal, vec3 viewDir, float power) {
  return pow(1.0 - max(dot(normal, viewDir), 0.0), power);
}`;

/**
 * Bump map perturbation using screen-space derivatives.
 * This function perturbs the surface normal based on a height map texture
 * without requiring pre-computed tangent attributes.
 *
 * Based on Three.js perturbNormalArb from normal_fragment_maps.glsl.
 */
export const BUMP_PERTURBATION_FUNCTION = `
vec3 perturbNormalWithBump(vec3 worldPos, vec3 normal, vec2 uv, sampler2D bumpMap, float bumpScale) {
  vec3 dPdx = dFdx(worldPos);
  vec3 dPdy = dFdy(worldPos);
  vec2 dUVdx = dFdx(uv);
  vec2 dUVdy = dFdy(uv);

  vec3 sigmaX = dPdx - dot(dPdx, normal) * normal;
  vec3 sigmaY = dPdy - dot(dPdy, normal) * normal;
  float det = dot(sigmaX, sigmaX) * dot(sigmaY, sigmaY) - dot(sigmaX, sigmaY) * dot(sigmaX, sigmaY);

  if (abs(det) < 0.0001) {
    return normal;
  }

  float h = texture2D(bumpMap, uv).r;
  float hx = texture2D(bumpMap, uv + dUVdx).r;
  float hy = texture2D(bumpMap, uv + dUVdy).r;

  float dhx = (hx - h) * bumpScale;
  float dhy = (hy - h) * bumpScale;

  vec3 tangent = normalize(sigmaX - sigmaY * (dot(sigmaX, sigmaY) / dot(sigmaY, sigmaY)));
  vec3 bitangent = cross(normal, tangent);

  return normalize(normal - tangent * dhx - bitangent * dhy);
}`;

// =============================================================================
// COMBINED CHUNKS FOR COMMON USE CASES
// =============================================================================

/**
 * Standard uniforms and functions for basic diffuse lighting.
 * Include this in fragment shader after #include <common>.
 */
export const BASIC_LIGHTING_FRAGMENT_PREAMBLE = `
${LIGHT_DIRECTION_UNIFORM}
${WORLD_NORMAL_VARYING_RECEIVE}
${DIFFUSE_WITH_AMBIENT_FUNCTION}`;

/**
 * Full lighting setup with specular and fresnel.
 * Include this in fragment shader after #include <common>.
 */
export const FULL_LIGHTING_FRAGMENT_PREAMBLE = `
${LIGHT_DIRECTION_UNIFORM}
${WORLD_SPACE_VARYINGS_RECEIVE}
${DIFFUSE_WITH_AMBIENT_FUNCTION}
${SPECULAR_BLINN_PHONG_FUNCTION}
${FRESNEL_FUNCTION}`;
