# Roadmap

## Current Snapshot

- Milestone 1 foundation and featured-body rendering work is complete.
- Milestone 2 mocked overview work is complete, including browser smoke coverage and manual closeout verification.
- Milestone 3 interaction and readability work is complete, including the grouped `Jump to` chooser, eased focus transitions, a focused-mode overview return control, and manual closeout verification.
- Milestone 4 data-abstraction work is complete, including separated presentation metadata, the selector-backed `bodyStateStore`, and provider-backed scene consumers.
- Milestone 5 browser data-integration work is in progress, with typed parsing, cached dataset loading, runtime chunk-selection plus Hermite interpolation helpers, an async ephemeris provider layer, a uniform physical-scale mapping seam, an app-facing resolved-catalog source, a real-time simulation clock with rate changes and now per-frame default advancement, a committed `public/ephemeris/body-metadata.json` snapshot, an ignored local `public/ephemeris/generated/` asset root plus helper script, a GitHub Pages workflow that checks out `SpiceNet` tag `v0.0.1` and generates deployment assets from the JPL SSD `de440s.bsp` source before the app build, a runtime that now starts from real ephemeris data by default with explicit loading or error messaging instead of placeholder startup positions, a `/debug` FPS overlay for local profiling, a repeatable `/debug` benchmark start timestamp plus runtime timing samples for the main Milestone 5.1 phases, a first trail pass that renders active-chunk sampled history with body-specific default windows, a first catalog-refresh optimization pass that reuses scaled metadata plus indexed body merging to reduce avoidable per-frame work, a follow-up trail-sampling pass that caches per-chunk sampler state and stable interior trail segments instead of rewalking chunk samples on every snapshot, a focused-follow pass that now translates the transition path with live body motion so high-rate jumps settle cleanly without losing the travel feel, a lighting-coherence pass that now keeps Earth, Venus-cloud, and Saturn lighting or shadowing aligned with the live Sun position, and a physical-alignment pass (5.3) that wires every body's sidereal rotation around its metadata-derived north pole axis, synchronizes rotation with the simulation clock and playback speed, anchors Earth's prime meridian to solar noon, keeps cloud shadows and cloud shell in sync on the correct axis, derives Saturn's ring plane from its pole, applies retrograde rotation to Venus clouds, and tidally locks the Moon to Earth.

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

Status: In Progress

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

Current focus:

- add reverse playback after the current performance, lighting, and physical-alignment follow-up
- add browser coverage for the real-data-only startup path, chunk-boundary loading, and focused-body recovery
- finish chunk-size, startup-latency, and chunk-duration benchmarking for the deployed and local generated-data paths
- manually verify the real-data startup flow on desktop and mobile before milestone closeout

## Milestone 6: Reference Frames And Trail UX

Status: Planned

Goals:

- add reference-frame selection
- support sun-centered, barycentric, and planet-centered views
- render satellite trails correctly across frame changes
- extend trail history further into the past for bodies such as the outer planets without forcing the Milestone 5 startup path to fetch too much data up front
- refine trail presentation with a brighter, thicker, non-transparent look and evaluate a tail-fade treatment
- design controls for frame, trail window, and trail style

## Milestone 7: Cinematic View Mode

Status: Planned

Goals:

- add an optional cinematic scale mode alongside the physically scaled view
- enlarge planet and moon radii non-linearly while keeping the real-scale mode available
- introduce extra separation offsets only for moons and other satellites so local systems stay readable without moving unrelated bodies
- label the cinematic mode clearly so it is understood as a non-physical presentation

## Milestone 8: Sky Catalog And Rendering Controls

Status: Planned

Goals:

- replace the decorative star sphere with a static sky built from a real star catalog such as Hipparcos
- render stars as point primitives such as `Three.Points`, with apparent size and brightness driven by real catalog data
- support optional constellation-line overlays from a static reference dataset
- add a rendering-configuration UI that stays minimized by default and uses as little screen space as possible
- design the controls so they remain clear and low-friction on both mobile and desktop

## Milestone 9: Rendering And Performance Refinement

Status: Planned

Goals:

- reduce pole artifacts
- evaluate cube-sphere or shader-based alternatives where useful
- add quality or performance presets only if needed
- revisit bundle size and mobile fallbacks as the scene grows

## Milestone 10: Full Solar System Explorer

Status: Backlog

Goals:

- broaden the body catalog
- add more educational context
- support a richer exploration model
