# Milestone 5: Mobile Lighting Fix

## Status

Complete

## Problem Statement

On Chrome/Android, the lighting direction on planetary bodies appears to change based on camera position. This does NOT happen on desktop Chrome. The issue affects bodies that rely on Three.js built-in `meshStandardMaterial` lighting, which performs calculations in view-space. On some mobile GPUs, there appears to be an inconsistency in how the view matrix affects the light position vs the normal matrix.

Bodies with explicit **world-space** custom shader lighting are NOT affected.

## Goal

1. **Remove the PointLight entirely** — eliminate all dependency on Three.js built-in lighting
2. **Replace all `meshStandardMaterial` PBR effects** (bump maps, specular, etc.) with explicit custom vertex/fragment shaders using world-space calculations
3. **Refactor rendering structure** — review parent/child relationships; some effects are currently siblings when they should be hierarchical for proper change propagation
4. Ensure consistent lighting behavior across desktop and mobile

## Constraints

- **Do not break existing custom lighting effects** — Earth, Saturn, Moon, and Venus clouds already have carefully tuned custom shaders; preserve their visual quality
- **Verify assumptions in code before making changes** — if unsure, ask questions rather than guessing
- **Test on both desktop and mobile** after each change
- **Maintain or improve visual quality** — custom shaders should match or exceed the quality of meshStandardMaterial effects
- **DO NOT REPEAT CODE** — identify shared patterns and extract them into reusable utilities before implementing

## Code Reuse Requirements

### Currently Duplicated Patterns (Must Be Consolidated)

Review the existing materials and identify these repeated patterns:

1. **World-space normal computation** — Multiple materials use `mat3(modelMatrix) * objectNormal` in vertex shader
2. **Sun light direction uniform** — Each material defines its own: `earthLightDirection`, `saturnLightDirection`, `cloudLightDirection`, etc.
3. **Diffuse calculation** — `max(dot(normal, lightDir), 0.0)` appears in multiple fragment shaders
4. **Vertex shader injection** — Same `#include <common>` and `#include <defaultnormal_vertex>` replacement pattern
5. **Fragment shader injection** — Same `#include <dithering_fragment>` replacement pattern
6. **Light direction update in useFrame** — Same pattern of updating uniform via `shaderRef.current?.uniforms`

### Required Shared Utilities

Before implementing any material changes, create these shared modules:

#### 1. Shared GLSL Snippets (`src/features/solar-system/rendering/shaderChunks.ts`)

```typescript
// Vertex shader chunks
export const WORLD_NORMAL_VARYING_DECLARATION = `varying vec3 vWorldNormal;`;
export const WORLD_NORMAL_COMPUTATION = `vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`;
export const WORLD_POSITION_VARYING_DECLARATION = `varying vec3 vWorldPosition;`;
export const WORLD_POSITION_COMPUTATION = `vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`;

// Fragment shader chunks  
export const LIGHT_DIRECTION_UNIFORM = `uniform vec3 lightDirection;`;  // Standardized name!
export const DIFFUSE_FUNCTION = `
float computeDiffuse(vec3 normal, vec3 lightDir) {
  return max(dot(normal, lightDir), 0.0);
}`;
export const SPECULAR_FUNCTION = `...`;
export const FRESNEL_FUNCTION = `...`;
export const BUMP_PERTURBATION_FUNCTION = `...`;
```

#### 2. Shader Injection Helpers (`src/features/solar-system/rendering/shaderInjection.ts`)

```typescript
export function injectWorldNormal(shader: ShaderType): void {
  // Standard injection for world-space normals
}

export function injectLightDirection(shader: ShaderType, initialValue: Vector3): void {
  // Standard injection for light direction uniform
}

export function injectDiffuseLighting(shader: ShaderType): void {
  // Standard injection for diffuse lighting
}
```

#### 3. Material Hook (`src/features/solar-system/hooks/useWorldSpaceLighting.ts`)

```typescript
export function useWorldSpaceLighting(bodyPosition: Vector3, sunPosition: Vector3) {
  // Returns: lightDirection Vector3, shaderRef, useFrame callback
  // Consolidates the pattern used in every material
}
```

### Uniform Naming Convention

**IMPORTANT:** Standardize uniform names across ALL materials:

| Current (Inconsistent) | New (Standardized) |
|------------------------|-------------------|
| `earthLightDirection` | `lightDirection` |
| `saturnLightDirection` | `lightDirection` |
| `cloudLightDirection` | `lightDirection` |
| `sunLightDirection` | `lightDirection` |
| `vEarthWorldNormal` | `vWorldNormal` |
| `vMoonWorldNormal` | `vWorldNormal` |
| `vCloudWorldNormal` | `vWorldNormal` |
| `vEarthWorldPosition` | `vWorldPosition` |

Body-specific uniforms (that ARE unique) keep their names:
- `earthNightTexture`, `earthCloudTexture`, etc. — texture uniforms are body-specific
- `ringNormal`, `ringInnerRadius`, etc. — Saturn ring uniforms are unique
- `bodyCenter` — body-specific position

### Implementation Order

1. **First:** Create shared utilities (shaderChunks.ts, shaderInjection.ts, useWorldSpaceLighting.ts)
2. **Second:** Refactor ONE existing material (e.g., SaturnRings which is simplest) to use shared utilities
3. **Third:** Verify refactored material works identically
4. **Fourth:** Refactor remaining materials one by one
5. **Last:** Add new functionality (bump maps for Moon, etc.)

## Rendering Structure Review

### Current Structure (siblings that should be hierarchical)

Review the current component structure in `PlanetBody.tsx` and related files. Some observations to verify:

1. **Cloud layers are siblings of planet meshes** — Should clouds be children of the planet mesh for proper transform inheritance?
2. **Saturn rings are siblings of Saturn surface** — Should rings be children for unified rotation/positioning?
3. **Material uniforms are updated independently** — Is there a shared state that should propagate to all related materials?

### Questions to Answer

1. What is the current parent/child structure in `PlanetBody.tsx`?
2. Are there cases where a transform change on a body doesn't propagate to related effects?
3. Should there be a shared "body lighting context" that all materials consume?
4. How are `sunPosition` and `bodyPosition` currently passed — props drilling or context?

## Existing Custom Lighting Effects (Preserve and Enhance)

These materials already have custom world-space lighting and work correctly on mobile:

### EarthSurfaceMaterial
- **File:** `src/features/solar-system/components/EarthSurfaceMaterial.tsx`
- **Features:**
  - World-space normals via `mat3(modelMatrix) * objectNormal`
  - Night lights blending based on sun direction
  - Cloud shadow projection onto surface
  - Ocean specular with Fresnel effect
  - Day/night terminator smoothing
- **Key uniform:** `earthLightDirection` (world-space)

### SaturnSurfaceMaterial
- **File:** `src/features/solar-system/components/SaturnSurfaceMaterial.tsx`
- **Features:**
  - World-space normals via position relative to body center
  - Ring shadow casting onto planet surface (ray-plane intersection)
- **Key uniform:** `saturnLightDirection` (world-space)

### SaturnRings
- **File:** `src/features/solar-system/components/SaturnRings.tsx`
- **Material:** `meshBasicMaterial` with custom shader
- **Features:**
  - Planet sphere shadow casting onto rings (ray-sphere intersection)
  - Directional lighting based on ring normal
  - Double-sided rendering with normal flip
- **Key uniform:** `saturnLightDirection` (world-space)

### PlanetCloudLayer (used by Earth and Venus)
- **File:** `src/features/solar-system/components/PlanetCloudLayer.tsx`
- **Features:**
  - World-space normals via `mat3(modelMatrix) * objectNormal`
  - Hemisphere-aware visibility transitions
  - Cloud luminance-based alpha heuristic
- **Key uniform:** `cloudLightDirection` (world-space)

### MoonSurfaceMaterial
- **File:** `src/features/solar-system/components/MoonSurfaceMaterial.tsx`
- **Material:** `meshStandardMaterial` with bump and displacement maps
- **Current state:** Uses built-in Three.js lighting (relies on PointLight)
- **NEEDS CONVERSION:** Replace bump map lighting with custom normal perturbation in fragment shader

## Materials That Need Full Custom Shader Conversion

| Material | Current Base | Effects to Implement in Custom Shader |
|----------|--------------|---------------------------------------|
| TexturedPlanetMaterial | meshStandardMaterial | Diffuse lighting |
| MoonSurfaceMaterial | meshStandardMaterial | Diffuse lighting, bump-mapped normals, displacement |
| EarthSurfaceMaterial | meshStandardMaterial | Already has custom lighting — verify it doesn't depend on PointLight base |
| SaturnSurfaceMaterial | meshStandardMaterial | Already has custom lighting — verify it doesn't depend on PointLight base |
| PlanetCloudLayer | meshStandardMaterial | Already has custom lighting — verify it doesn't depend on PointLight base |
| SaturnRings | meshBasicMaterial | Already fully custom — no changes needed |

## Approach

> **⚠️ CRITICAL: DO NOT DUPLICATE CODE**
> 
> Before writing ANY shader code in a material file, check if the same pattern exists elsewhere.
> If it does, extract it to a shared utility first. The shared utilities in Phase 2 MUST be created
> before any material modifications. If you find yourself copy-pasting GLSL code between materials,
> STOP and refactor into shared utilities.

### Phase 1: Audit Current Dependencies

1. **Read each material file** and document:
   - What base material is used (meshStandardMaterial, meshBasicMaterial, etc.)
   - What built-in effects are used (bump maps, normal maps, specular, etc.)
   - What custom shader modifications exist via `onBeforeCompile`
   - Whether the final output depends on the PointLight or is fully overridden

2. **Map the component hierarchy** in PlanetBody.tsx:
   - Document parent/child relationships
   - Identify cases where siblings should be children
   - Document how uniforms are passed (props drilling vs context)

### Phase 2: Create Shared Utilities (DO THIS FIRST)

1. **Create `shaderChunks.ts`** — Extract all repeated GLSL code into named constants
2. **Create `shaderInjection.ts`** — Extract the `onBeforeCompile` injection patterns into reusable functions
3. **Create `useWorldSpaceLighting.ts`** — Extract the useFrame update pattern into a shared hook
4. **Test with ONE material** — Refactor SaturnRings (simplest, already meshBasicMaterial) to use new utilities
5. **Verify no visual change** — SaturnRings must look identical before proceeding

### Phase 3: Refactor Existing Materials to Use Shared Utilities

**Do NOT add new functionality yet. Only refactor to use shared code.**

1. **Refactor PlanetCloudLayer** — Already has custom lighting, just use shared utilities
2. **Refactor EarthSurfaceMaterial** — Preserve all effects, use shared injection patterns
3. **Refactor SaturnSurfaceMaterial** — Preserve ring shadow, use shared injection patterns
4. **Verify all refactored materials** — Must look identical to before

### Phase 4: Add Missing Custom Lighting

**Now add new functionality using the shared utilities:**

1. **TexturedPlanetMaterial** — Add world-space diffuse lighting
2. **MoonSurfaceMaterial** — Add world-space diffuse + custom bump map perturbation
3. **Remove PointLight** — Only after all materials have custom lighting
4. **Tune lighting parameters** — Adjust ambient/diffuse balance if needed

### Phase 5: Verify and Polish

1. **Code review for duplication** — Grep for repeated GLSL patterns; extract any remaining duplication
2. **Test all bodies on desktop Chrome**
3. **Test all bodies on mobile Chrome/Android**
4. **Compare visual quality** with before/after screenshots
5. **Tune lighting parameters** if needed
6. **Document the shared utilities** — Add JSDoc comments explaining usage

## Technical Reference: Custom Shader Patterns

### Bump Map in Custom Shader

To replicate bump map lighting without meshStandardMaterial:

```glsl
// In fragment shader
uniform sampler2D bumpMap;
uniform float bumpScale;

vec3 perturbNormalArb(vec3 position, vec3 normal, vec2 uv) {
  vec3 dPdx = dFdx(position);
  vec3 dPdy = dFdy(position);
  vec2 dUVdx = dFdx(uv);
  vec2 dUVdy = dFdy(uv);
  
  float h = texture2D(bumpMap, uv).r;
  float hx = texture2D(bumpMap, uv + vec2(dUVdx.x, 0.0)).r;
  float hy = texture2D(bumpMap, uv + vec2(0.0, dUVdy.y)).r;
  
  vec3 tangent = normalize(dPdx * dUVdy.y - dPdy * dUVdx.y);
  vec3 bitangent = normalize(dPdy * dUVdx.x - dPdx * dUVdy.x);
  
  float dhx = (hx - h) * bumpScale;
  float dhy = (hy - h) * bumpScale;
  
  return normalize(normal - tangent * dhx - bitangent * dhy);
}
```

### Specular Lighting (Blinn-Phong)

```glsl
vec3 computeSpecular(vec3 normal, vec3 lightDir, vec3 viewDir, float shininess, float strength) {
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), shininess);
  return vec3(spec * strength);
}
```

### Fresnel Effect

```glsl
float computeFresnel(vec3 normal, vec3 viewDir, float power) {
  return pow(1.0 - max(dot(normal, viewDir), 0.0), power);
}
```

## Questions to Answer Before Implementation

1. **Audit question:** Does EarthSurfaceMaterial's final output depend on the PointLight base color, or does `applyEarthNightLights()` completely replace it?

2. **Audit question:** Does SaturnSurfaceMaterial's final output depend on the PointLight, or does the ring shadow function completely replace it?

3. **Audit question:** Does PlanetCloudLayer's final output depend on the PointLight, or does `cloudVisibility` completely replace it?

4. **Hierarchy question:** What is the current transform relationship between planet mesh, cloud layer, and rings?

5. **Design question:** Should we use a React context for lighting state, or continue with props drilling?

6. **Quality question:** What is the acceptable visual difference when replacing meshStandardMaterial PBR with simplified custom shaders?

## Files to Review

- `src/features/solar-system/components/PlanetBody.tsx` — Component hierarchy
- `src/features/solar-system/components/TexturedPlanetMaterial.tsx` — Simplest material to convert
- `src/features/solar-system/components/MoonSurfaceMaterial.tsx` — Needs bump map conversion
- `src/features/solar-system/components/EarthSurfaceMaterial.tsx` — Audit PointLight dependency
- `src/features/solar-system/components/SaturnSurfaceMaterial.tsx` — Audit PointLight dependency
- `src/features/solar-system/components/PlanetCloudLayer.tsx` — Audit PointLight dependency
- `src/features/solar-system/components/SaturnRings.tsx` — Reference for fully custom shader
- `src/features/experience/components/ExperienceScene.tsx` — Where PointLight is defined

## Files to Create (Required Before Implementation)

- `src/features/solar-system/rendering/shaderChunks.ts` — Shared GLSL snippet strings (world normal, diffuse, specular, fresnel, bump)
- `src/features/solar-system/rendering/shaderInjection.ts` — Helper functions for injecting shader code via onBeforeCompile
- `src/features/solar-system/hooks/useWorldSpaceLighting.ts` — Shared hook for light direction computation and useFrame updates
- `src/features/solar-system/context/BodyLightingContext.tsx` — Optional: shared lighting state if props drilling becomes unwieldy
