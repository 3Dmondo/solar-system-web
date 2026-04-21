# Roadmap

## Current Snapshot

- Milestone 1 foundation and featured-body rendering work is complete.
- Milestone 2 mocked overview work is complete, including browser smoke coverage and manual closeout verification.
- Milestone 3 interaction and readability work is complete, including the grouped `Jump to` chooser, preserved-angle focus transitions, a focused-mode overview return control, thicker opaque orbital trails, and manual closeout verification.
- Milestone 4 data-abstraction work is complete, including the synchronous mocked `BodyStateProvider`, the selector-backed `bodyStateStore`, and provider-backed scene consumers.
- Milestone 5 browser data-integration work is in progress, with typed parsing, cached dataset loading, runtime chunk-selection plus Hermite interpolation helpers, an async ephemeris provider layer, a uniform physical-scale mapping seam, an app-facing resolved-catalog source, a real-time simulation clock, a committed `public/ephemeris/body-metadata.json` snapshot, and scene or HUD or focus wiring that now runs through a catalog runtime with loading and fallback support for the accepted external `SpiceNet` solar-system-barycenter web-data output while the app still defaults to the mocked source.

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

- validate and normalize the accepted `SpiceNet` web-data schema in the browser data layer before swapping the live provider
- keep the committed body metadata snapshot separate from generated manifest and chunk assets while the runtime consumes it alongside cached manifest data and the app's cinematic metadata
- match the accepted SpiceNet approximate UTC anchor, shared chunk-boundary rules, and Hermite interpolation math in browser-side runtime helpers before the async provider swap
- keep raw kilometer ephemeris snapshots in a dedicated async provider layer so the later scene-scale mapping can stay explicit
- map raw barycentric ephemeris snapshots and kernel-derived mean radii into a physically scaled scene model through one global km-to-scene factor, with focus framing scaled proportionally instead of left at mocked distances
- compose the async provider and the physical-scale adapter into the same resolved catalog shape the scene already consumes before rewriting scene and HUD wiring
- route scene, HUD, and focus helpers through a runtime catalog hook that can surface loading and fallback states before the web-data source is turned on by default
- keep the real web-data source behind explicit runtime configuration until hosted assets and the first physical scale factor are ready for inspection
- start the simulation clock from the current UTC time and surface that requested time in the HUD before adding pause, reverse, or rate controls
- add the first playback control slice with pause and resume before rate changes or reverse playback
- defer any optional cinematic non-linear size scaling and moon or satellite spacing offsets to a later dedicated milestone
- keep the current mocked overview experience stable until async loading, physical scaling, and camera or focus UX are ready together

## Milestone 6: Reference Frames And Trail UX

Status: Planned

Goals:

- add reference-frame selection
- support sun-centered, barycentric, and planet-centered views
- render satellite trails correctly across frame changes
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
