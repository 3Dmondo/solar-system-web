# Architecture

## Recommended Stack

- React
- TypeScript
- Vite
- Three.js through react-three-fiber
- Vitest for unit and integration-style tests
- React Testing Library for UI behavior
- Playwright for end-to-end smoke tests

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

## Workflow Strategy

- implement in small vertical slices
- update docs together with code changes
- pause after each meaningful UI or rendering step for visual review
