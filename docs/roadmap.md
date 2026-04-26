# Roadmap

## Current Snapshot

- Milestone 1 foundation and featured-body rendering work is complete.
- Milestone 2 mocked overview work is complete, including browser smoke coverage and manual closeout verification.
- Milestone 3 interaction and readability work is complete, including the grouped `Jump to` chooser, eased focus transitions, a focused-mode overview return control, and manual closeout verification.
- Milestone 4 data-abstraction work is complete, including separated presentation metadata, the selector-backed `bodyStateStore`, and provider-backed scene consumers.
- Milestone 5 browser data-integration work is complete, with real ephemeris-driven positions from startup, simulation clock with playback controls, physical alignment across all bodies, lighting coherence with live Sun position, and a mobile lighting fix that replaces Three.js built-in lighting with custom world-space shaders across all materials. Reverse playback, explicit date picking, and additional browser coverage are deferred to later milestones.
- Milestone 6 body discovery and UI controls work is complete, with body indicator billboards for sub-pixel bodies, Sun impostor with bloom, layer visibility panel, and fullscreen button.

## Milestone 1: Foundation And Planet Showcase

Status: Complete

Delivered:

- app scaffold, test tooling, and fullscreen shell
- desktop and mobile orbit controls
- focus state and camera helpers
- custom rendering passes for Saturn, Earth, and Moon
- GitHub Pages deployment workflow

## Milestone 2: Mocked Solar System Overview

Status: Complete

Delivered:

- Sun plus all 8 planets added to the mocked catalog
- overview-first camera framing and zoom-driven recovery path
- body self-rotation across the scene
- star background and mocked orbital trails
- texture-backed materials for the remaining overview bodies

## Milestone 3: Interaction And Readability Pass

Status: Complete

Goals:

- improve body discovery and re-selection in the multi-body scene
- refine focus choreography between overview and close view
- add minimal labels or guidance only if the current HUD is not enough
- improve trail and background readability
- verify the updated flow on desktop and mobile

## Milestone 4: Data Abstraction

Status: Complete

Goals:

- introduce a stable `BodyStateProvider`-style boundary
- split static body metadata from time-varying snapshot state
- support clean fixed-time snapshots
- route scene consumers through provider-backed data
- prepare the path for offline-generated ephemeris assets

Delivered:

- static body metadata split from time-varying mocked state
- synchronous `BodyStateProvider` types and mocked provider implementation
- `bodyStateStore` selectors for merged body definitions and metadata lookups
- provider-backed scene, HUD, focus, and trail consumers
- unit coverage for provider helpers and selector resolution

## Milestone 5: Real Positions And Time

Status: Complete

Goals:

- add a deployment-time preprocessing step that turns JPL or SPICE ephemerides into small static chunked assets plus kernel-derived body metadata
- integrate the accepted external `SpiceNet` `de440s` benchmark baseline and choose the final chunk duration empirically from measured browser results
- prefer compressed JSON as the first browser format and move to a custom binary payload only if benchmarks justify it
- keep the browser runtime focused on loading, caching, and interpolating prepared chunks rather than parsing raw kernel data by default
- consume `SpiceNet` as a pinned external preprocessing dependency
- download ephemeris files during CI or CD instead of versioning them in this repo
- evolve the provider path to support async snapshot loading and visible loading states without rewriting the whole scene again
- start from the current datetime with real-time advancement plus pause, reverse, and rate controls
- replace circular mock trails with sampled position history and support body-specific default trail windows
- benchmark chunk size, prefetch behavior, and startup latency so the overview stays smooth on mobile and desktop

Delivered:

- real ephemeris-driven positions from startup with explicit loading and error states
- simulation clock with pause, resume, and playback-rate controls
- sampled position history trails with body-specific windows
- physical alignment: axial orientation, sidereal rotation, Earth prime meridian, Saturn ring plane, Venus retrograde clouds, tidally locked Moon
- lighting coherence: Earth, Saturn, and Venus lighting tracks live Sun position
- mobile lighting fix: all materials use custom world-space shaders via meshBasicMaterial + onBeforeCompile to avoid mobile Chrome lighting inconsistencies
- shared shader utilities for world-space lighting, bump mapping, and shadow calculations

Deferred to later milestones:

- reverse playback
- explicit date picking
- browser coverage for real-data edge cases
- chunk-size and startup-latency benchmarking

## Milestone 6: Body Discovery And UI Controls

Status: Complete

Goals:

- add body indicator billboards that appear when bodies are too small to see, with auto-threshold based on screen-space radius
- make indicator billboards selectable with the same interaction model as body meshes
- handle indicator overlap when distant bodies cluster by applying a radial spread algorithm
- add a Sun impostor with bloom post-processing for visibility from far distances, blending smoothly with the rendered sphere
- add body labels as HTML overlays that help identify bodies at a glance
- add a collapsible layer visibility panel with toggles for trails, body indicators, and labels, designed for future cinematic-scale toggle
- add a floating fullscreen button in the top-right corner
- verify body discovery and selection work correctly on both desktop and mobile

Delivered:

- camera-facing ring indicator billboards with GLSL shader, auto-appearing below 4 px screen radius threshold
- indicator selection via click/tap using drei Billboard raycasting
- radial spread algorithm for overlapping indicators in screen space
- Sun impostor billboard with radial gradient shader and smooth opacity blend based on screen-space radius
- post-processing bloom effect via @react-three/postprocessing
- body labels using drei Html component with click-to-focus and auto-hide when body is large on screen
- collapsible layer visibility panel with toggles for trails, body indicators, and labels
- floating fullscreen button with Fullscreen API and graceful degradation
- useScreenSpaceRadius hook with batch computation support
- useLayerVisibility state management hook
- unit test coverage for screen-space radius and layer visibility logic

## Milestone 7: Reference Frames And Trail UX

Status: Planned

Goals:

- add reference-frame selection
- support sun-centered, barycentric, and planet-centered views
- render satellite trails correctly across frame changes
- extend trail history further into the past for bodies such as the outer planets without forcing the Milestone 5 startup path to fetch too much data up front
- refine trail presentation with a brighter, thicker, non-transparent look and evaluate a tail-fade treatment
- design controls for frame, trail window, and trail style

## Milestone 8: Cinematic View Mode

Status: Planned

Goals:

- add an optional cinematic scale mode alongside the physically scaled view
- enlarge planet and moon radii non-linearly while keeping the real-scale mode available
- introduce extra separation offsets only for moons and other satellites so local systems stay readable without moving unrelated bodies
- label the cinematic mode clearly so it is understood as a non-physical presentation

## Milestone 9: Sky Catalog And Rendering Controls

Status: Planned

Goals:

- replace the decorative star sphere with a static sky built from a real star catalog such as Hipparcos
- render stars as point primitives such as `Three.Points`, with apparent size and brightness driven by real catalog data
- support optional constellation-line overlays from a static reference dataset
- add a rendering-configuration UI that stays minimized by default and uses as little screen space as possible
- design the controls so they remain clear and low-friction on both mobile and desktop

## Milestone 10: Rendering And Performance Refinement

Status: Planned

Goals:

- reduce pole artifacts
- evaluate cube-sphere or shader-based alternatives where useful
- add quality or performance presets only if needed
- revisit bundle size and mobile fallbacks as the scene grows

## Milestone 11: Full Solar System Explorer

Status: Backlog

Goals:

- broaden the body catalog
- add more educational context
- support a richer exploration model
