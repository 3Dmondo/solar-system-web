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
- quality tiers
- lighting environment

Current implementation notes:

- focus transitions are interruptible by user input
- desktop and coarse-pointer devices use different orbit control tuning
- body focus now requires double click on desktop or double tap on touch to reduce accidental selection changes

### Body System

Responsibilities:

- body definitions
- body transforms
- focus targets
- planet and ring composition

### Render Features

Responsibilities:

- shadows
- layered materials
- cloud shells
- specular water highlights
- ring shading and translucency

Current implementation notes:

- Saturn now uses downloaded local texture assets for the surface and ring alpha map
- Saturn ring UVs are cropped to the useful span of the downloaded ring texture to avoid edge-margin distortion
- the visible ring mapping and the Saturn-shadow sampling range are now tunable independently for visual alignment
- the scene renderer now has real-time shadow support enabled for directional lighting
- Saturn ring shadow materials now reuse the same radial alpha pattern as the visible ring surface
- Saturn's ring shadow on the planet is now driven by the custom Saturn surface shader rather than the default ring shadow caster
- Saturn's ring shadow now fades near the terminator to blend more coherently with the planet lighting model
- Saturn's rings now rely on the generic shadow-map system for body-to-ring shadows to stay compatible with future moon/body shadow interactions
- Saturn's sphere tilt is aligned with the ring plane so the rotation axis stays perpendicular to the rings
- Earth now has an asset-based material path with day texture, night lights, and first-pass specular enhancement
- Earth now also has a separate cloud shell layer driven by the local cloud texture and faded by the light-facing term on the night side
- Moon now has an asset-based first surface pass using the local albedo texture

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
