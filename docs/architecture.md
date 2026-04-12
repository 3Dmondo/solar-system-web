# Architecture

## Recommended Stack

- React
- TypeScript
- Vite
- Three.js through react-three-fiber
- Vitest for unit and integration-style tests
- React Testing Library for UI behavior
- Playwright for end-to-end smoke tests
- GitHub Actions for GitHub Pages deployment

## Why This Stack

- good maintainability for a non-JS-expert team
- clear separation between app logic and rendering
- static build output suitable for GitHub Pages
- strong ecosystem for testing and progressive rendering complexity

## Rendering Strategy

The core renderer should use real sphere and ring geometry first.

Reasons:

- easier path to shadows, rings, atmosphere, and layered materials
- simpler foundation for camera interaction and selection
- lower implementation risk for milestone 1

Shader-heavy impostor techniques can be introduced later where they clearly improve performance.

Known deferred rendering issue:

- equirectangular texture rendering still shows visible pole artifacts on some bodies
- future solutions to evaluate include cube-sphere geometry with compatible UV/material handling and shader/impostor-based rendering paths

## Module Boundaries

### App Shell

Responsibilities:

- fullscreen layout
- minimal chrome
- responsive behavior
- loading and error states

### Scene Core

Responsibilities:

- renderer setup
- camera setup
- orbit controls
- lighting environment
- overview and focus camera modes

Current implementation notes:

- focus transitions are interruptible by user input
- desktop and coarse-pointer devices use different orbit control tuning
- body focus now requires double click on desktop or double tap on touch to reduce accidental selection changes
- the scene now supports both solar-system overview framing and single-body focus framing in the same interaction model
- the overview HUD no longer includes a dedicated return button; the current navigation direction is to allow much farther zooming after focusing

### Body System

Responsibilities:

- body definitions
- body transforms
- focus targets
- planet and ring composition
- overview layout and mocked orbital placement

Future expansion notes:

- the mocked body catalog now includes Sun, all planets, and the Moon for continuity with the original showcase
- support both overview-scale transforms and close-focus transforms without duplicating body definitions
- mocked orbital trails are still pending as the next companion feature to the body catalog
- the current mocked layout spreads planets across different orbital angles to fill more of the ecliptic disk

### Render Features

Responsibilities:

- shadows
- layered materials
- cloud shells
- specular water highlights
- ring shading and translucency
- star background
- orbital trails

Current implementation notes:

- Saturn now uses downloaded local texture assets for the surface and ring alpha map
- Saturn ring UVs are cropped to the useful span of the downloaded ring texture to avoid edge-margin distortion
- the visible ring mapping and the Saturn-shadow sampling range are now tunable independently for visual alignment
- the scene renderer now has real-time shadow support enabled for directional lighting
- Saturn ring shadow materials now reuse the same radial alpha pattern as the visible ring surface
- Saturn's ring shadow on the planet is now driven by the custom Saturn surface shader rather than the default ring shadow caster
- Saturn's ring shadow now fades near the terminator to blend more coherently with the planet lighting model
- Saturn's rings now rely on the generic shadow-map system for body-to-ring shadows to stay compatible with future moon/body shadow interactions
- Saturn's rings now use a simplified custom lighting model with equal two-sided brightness and a direct Saturn-body occlusion term, with built-in ring shadow receiving disabled for now to avoid doubled top-side shadows
- Saturn's sphere tilt is aligned with the ring plane so the rotation axis stays perpendicular to the rings
- the global built-in lighting now comes from a Sun-centered light source, and the custom Saturn shaders derive their light direction from the body's direction relative to the Sun with no distance falloff
- Earth and Saturn now use the corrected shared Sun-direction convention, so the richer custom materials are back on the same lighting model as the broader overview scene
- Earth and Saturn now have slow surface self-rotation to keep the showcase scene from feeling static
- Earth now has an asset-based material path with day texture, night lights, and first-pass specular enhancement
- Earth surface lighting now also uses local PNG normal and specular maps to avoid the TIFF decoding artifacts seen in earlier passes
- Earth now also has a separate cloud shell layer driven by the local cloud texture and faded by the light-facing term on the night side
- Earth ocean highlights now use the local specular map through the custom Earth surface shader
- Earth surface shading now also applies a light cloud-shadow term derived from the moving cloud texture
- Earth cloud cover now rotates slowly as a separate shell layer
- Earth cloud rotation and projected cloud-shadow drift are now derived from the Earth's surface rotation speed, with the cloud shell following Earth spin plus a small linked drift while the shadow uses that same relative drift over the surface
- Moon now has an asset-based surface pass using NASA SVS color and height-map assets, with a first displacement-style relief pass on denser Moon geometry
- the next rendering phase shifts emphasis from per-body material polish to rendering the mocked full solar-system scene around the existing high-value bodies
- the Sun and the remaining overview planets now use local Solar System Scope texture maps instead of the earlier procedural placeholders

### Data Layer

Responsibilities:

- provide body states through interfaces
- start with mocked body data
- later support static ephemeris-derived assets

## Data Abstraction

The renderer must depend on an interface rather than a concrete data source.

Planned core concept:

- `BodyStateProvider`

This allows the app to start with mocked data and later switch to SPICE/JPL-derived assets without rewriting scene logic.

## Scaling Strategy

Planned display modes:

- `cinematic`
- `realistic`

Milestone 1 uses `cinematic` by default.

Next-step scaling notes:

- the immediate solar-system overview should use a mocked but readable scale model rather than real distances
- the overview scale model should still leave room for a future realistic-proportions mode

## Testing Strategy

We want strong coverage in the parts we control:

- math and transform utilities
- selection and focus state
- scaling rules
- data provider behavior
- component behavior
- smoke tests for desktop and mobile interactions

We do not target synthetic coverage inside browser-owned WebGL internals.

## Mobile Testing

The preferred workflow is:

- use browser device emulation during each small implementation step
- use same-network real-device testing at the end of meaningful interaction or rendering steps
- occasionally verify the production preview build on a mobile device

Detailed instructions live in `docs/testing-mobile.md`.

## Workflow Strategy

- implement in small vertical slices
- update docs together with code changes
- pause after each meaningful UI or rendering step for visual review

## Deployment

- GitHub Pages deployment is performed through `.github/workflows/deploy-pages.yml`
- Vite uses the repository-specific base path during GitHub Actions builds
- Planet textures are resolved through Vite asset URLs so they load correctly on GitHub Pages project-site paths
