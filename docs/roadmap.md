# Roadmap

## Current Snapshot

- Milestone 1 foundation and featured-body rendering work is complete.
- Milestone 2 overview scene work is implemented in code and validated by lint, unit tests, build, and refreshed browser smoke coverage, but manual closeout verification is still open.
- Milestone 3 is the next active implementation milestone.

## Milestone 1: Foundation And Planet Showcase

Status: Complete

Delivered:

- app scaffold, test tooling, and fullscreen shell
- desktop and mobile orbit controls
- focus state and camera helpers
- custom rendering passes for Saturn, Earth, and Moon
- GitHub Pages deployment workflow

## Milestone 2: Mocked Solar System Overview

Status: Implemented, closeout pending

Delivered:

- Sun plus all 8 planets added to the mocked catalog
- overview-first camera framing and zoom-driven recovery path
- body self-rotation across the scene
- star background and mocked orbital trails
- texture-backed materials for the remaining overview bodies

Remaining closeout:

- perform manual desktop and mobile verification
- mark the milestone closed after the verification pass

## Milestone 3: Interaction And Readability Pass

Status: Active

Goals:

- improve body discovery and re-selection in the multi-body scene
- refine focus choreography between overview and close view
- add minimal labels or guidance only if the current HUD is not enough
- improve trail and background readability
- verify the updated flow on desktop and mobile

## Milestone 4: Data Abstraction

Status: Planned

Goals:

- introduce a stable `BodyStateProvider`-style boundary
- support clean fixed-time snapshots
- prepare the path for offline-generated ephemeris assets

## Milestone 5: Real Positions And Time

Status: Planned

Goals:

- integrate JPL or SPICE-derived static data assets
- add time controls
- replace circular mock trails with sampled historical positions
- support body-specific trail windows
- evaluate smoothing only where it materially improves readability

## Milestone 6: Reference Frames And Trail UX

Status: Planned

Goals:

- add reference-frame selection
- support sun-centered, barycentric, and planet-centered views
- render satellite trails correctly across frame changes
- design controls for frame, trail window, and trail style

## Milestone 7: Sky Catalog And Rendering Controls

Status: Planned

Goals:

- replace the decorative star sphere with a static sky built from a real star catalog such as Hipparcos
- render stars as point primitives such as `Three.Points`, with apparent size and brightness driven by real catalog data
- support optional constellation-line overlays from a static reference dataset
- add a rendering-configuration UI that stays minimized by default and uses as little screen space as possible
- design the controls so they remain clear and low-friction on both mobile and desktop

## Milestone 8: Rendering And Performance Refinement

Status: Planned

Goals:

- reduce pole artifacts
- evaluate cube-sphere or shader-based alternatives where useful
- add quality or performance presets only if needed
- revisit bundle size and mobile fallbacks as the scene grows

## Milestone 9: Full Solar System Explorer

Status: Backlog

Goals:

- broaden the body catalog
- add more educational context
- support a richer exploration model
