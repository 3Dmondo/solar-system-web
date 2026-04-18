# Roadmap

## Current Snapshot

- Milestone 1 foundation and featured-body rendering work is complete.
- Milestone 2 overview scene work is implemented in code and validated by lint, unit tests, and build, but closeout manual verification and e2e refresh are still open.
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

- refresh Playwright smoke coverage for overview-first startup
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

## Milestone 7: Rendering And Performance Refinement

Status: Planned

Goals:

- reduce pole artifacts
- evaluate cube-sphere or shader-based alternatives where useful
- add quality or performance presets only if needed
- revisit bundle size and mobile fallbacks as the scene grows

## Milestone 8: Full Solar System Explorer

Status: Backlog

Goals:

- broaden the body catalog
- add more educational context
- support a richer exploration model
