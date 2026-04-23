# Milestone 5 Runtime Performance Plan

## Status

Planned

## Goal

Recover most of the performance lost after switching the runtime clock to per-frame advancement, while keeping real ephemeris motion visually smooth and preserving the current Milestone 5 startup behavior.

## Current Symptom

- The overview dropped from about `60 FPS` to about `17 FPS` after the runtime started resolving the real-data catalog on every animation frame.
- The first catalog-refresh optimization pass helped a little, but it did not address the main cost center.

## Verified Findings

- The current clock path in `src/features/experience/state/useSimulationClock.ts` emits a fresh `requestedUtc` string on every `requestAnimationFrame`.
- `src/features/experience/state/useResolvedBodyCatalog.ts` treats every new timestamp as a new async catalog request, so the app starts `prefetchAroundUtc(...)` plus `loadBodyCatalogAtUtc(...)` on every frame.
- `src/features/solar-system/data/webBodyCatalogSource.ts` rebuilds a full resolved catalog on every request, including scene-space body positions and trail arrays.
- `src/features/solar-system/data/webEphemerisProvider.ts` currently does both of these on every request:
  - interpolates all 10 body positions for the requested time
  - resamples all 10 body trails for the requested time
- The raw body-position interpolation work is comparatively small. The larger cost comes from regenerating trails, rebuilding object graphs, and pushing a brand-new catalog through React and Three every frame.
- With the current local generated dataset in `public/ephemeris/generated/manifest.json`, the active `2025-2050` chunk implies roughly:
  - `10,886` chunk samples scanned per frame across all bodies
  - `1,224` visible trail points rebuilt and remapped to scene space per frame

## Working Hypothesis

The performance collapse is mainly caused by architectural churn around the per-frame time update, not by the 10 Hermite body interpolations alone.

The likely high-cost path is:

1. per-frame React state update for simulation time
2. per-frame async catalog refresh effect
3. per-frame trail sampling and trail scene-space remapping
4. per-frame replacement of the entire resolved catalog object graph
5. per-frame React rerender of the scene and HUD
6. per-frame `Line` point-array updates and material prop churn in the Three scene

## Plan

### 1. Measure Before Refactoring

- Add lightweight instrumentation around:
  - `loadBodyCatalogAtUtc(...)`
  - body interpolation
  - trail sampling
  - scene-space mapping
  - React catalog commit
- Record desktop `/debug` FPS plus timing samples for the current baseline before changing behavior.
- Confirm whether `prefetchAroundUtc(...)` is doing any meaningful work on every frame or only adding overhead.

### 2. Split Fast Body Updates From Slow Trail Updates

- Introduce a fast path for per-frame body-position updates that only:
  - selects the current chunk
  - interpolates body positions
  - maps those 10 positions into scene space
- Move trail generation off the per-frame path.
- Recompute trails only when one of these changes:
  - active chunk file
  - focused body, if trail styling or scope depends on it later
  - configured trail window policy
  - a coarse time threshold large enough to matter visually

Expected result:

- the app keeps smooth planet motion
- trails remain visually stable
- the largest per-frame allocation source disappears

### 3. Stop Rebuilding The Entire Catalog Every Frame

- Keep stable metadata and stable body-definition shells where possible.
- Replace full-catalog replacement with a narrower runtime state shape, for example:
  - static metadata
  - dynamic body positions
  - dynamic trails with slower refresh cadence
- Avoid driving the per-frame path through `useResolvedBodyCatalog` if that hook remains effect-driven and async-oriented.
- Prefer a dedicated runtime store or scene-local subscription for hot motion data.

Expected result:

- less React reconciliation
- fewer prop identity changes
- less Three object churn

### 4. Keep React Out Of The Hottest Loop

- Evaluate moving the hottest clock-driven position updates into a render-loop-owned store or ref-backed state that the Three scene can consume directly.
- Keep React state for slower UI concerns:
  - formatted UTC label
  - loading and error state
  - playback controls
  - chunk-boundary transitions
- If needed, decouple the HUD clock label from the raw render cadence so the HUD does not rerender at display-frame frequency.

Expected result:

- per-frame simulation updates stop forcing app-wide React rerenders

### 5. Revisit Trail Rendering Strategy

- Keep current trail windows, but cache chunk-derived trail samples by:
  - chunk file
  - body id
  - trail window days
- Only append or trim endpoints when the target time moves inside the same cached trail segment, rather than rebuilding the full trail array each frame.
- If needed, move trail generation to a lower update cadence than body positions.
- If trail rendering still appears to be the limiting factor after the earlier runtime refactors, treat GPU upload reduction as a final optimization phase rather than an initial rewrite.

Expected result:

- orbit lines stop dominating CPU and allocation cost

### 5.1 Final Trail-Rendering Fallbacks

- If measurements show that the remaining bottleneck is continuous trail-buffer upload to GPU memory, prototype a GPU-resident trail buffer that keeps most trail data stable and updates only the moving window.
- Prefer a circular-buffer style strategy first:
  - keep a fixed-capacity vertex buffer per trail
  - write new or shifted samples into wrapped buffer slots
  - render either two draw segments together or one logical trail assembled from wrapped ranges
- As a simpler fallback, evaluate storing more points than are currently needed in the vertex buffer and changing only the active draw range so the runtime draws the interesting subset without re-uploading the full trail every frame.
- Keep this work behind the earlier architectural steps, because trail upload cost should only be attacked directly after confirming that CPU-side trail regeneration and React churn are no longer the dominant cost.

### 5.2 Analytical Trail Approximation Fallback

- If real sampled trails remain too expensive even after caching and GPU-resident buffering, evaluate replacing some or all visible Milestone 5 trails with analytical approximations.
- Start with the simplest useful two-body cases:
  - Sun-planet ellipses for planets
  - planet-satellite ellipses for moons and other satellites
- Use the already available physical characteristics, masses, and current positions as the starting inputs for the approximation pass.
- Treat this as a presentation fallback rather than a replacement for the real ephemeris runtime contract:
  - body positions should still come from real ephemeris data
  - the approximation would affect only trail visualization
- Only adopt this fallback if measurement shows that real sampled trails are the remaining blocker and the visual error is acceptable for Milestone 5.

### 6. Validate Scene Consumers After The Data Split

- Re-check components that currently receive fresh `body.position` arrays every frame:
  - `ExperienceScene`
  - `PlanetBody`
  - `OrbitTrails`
  - `EarthSurfaceMaterial`
  - `EarthCloudLayer`
  - `SaturnSurfaceMaterial`
  - `SaturnRings`
  - `VenusCloudLayer`
- Confirm that sun-direction uniforms and cloud-shell logic still update correctly once the data path is split into fast and slow lanes.

## Proposed Implementation Order

1. Add timing instrumentation and capture a baseline.
2. Disable per-frame trail recomputation while keeping body interpolation per-frame.
3. Re-measure FPS and commit if the gain is material.
4. Narrow the per-frame data shape so body motion no longer rebuilds the full resolved catalog.
5. Re-measure again on desktop and mobile.
6. If trails are still the limiting factor, test a GPU-resident trail-buffer strategy before considering analytical trail approximation.
7. Only then decide whether deeper refactors, such as a scene-local motion store, are still necessary.

## Verification

- Use `/debug` for desktop FPS checks before and after each sub-step.
- Re-test the overview with the default playback rate and at least one faster rate such as `1m/s`.
- Confirm that:
  - bodies still move smoothly
  - trails remain readable and stable
  - focus tracking still behaves correctly
  - loading and chunk-boundary behavior still works
- Keep `pnpm test` green for any touched provider, store, and runtime-hook code.

## Success Criteria

- The per-frame path no longer runs full trail sampling and full catalog replacement on every frame.
- Desktop performance recovers substantially from the current `~17 FPS` baseline.
- The runtime still starts from real ephemeris data and preserves smooth motion.
- The architecture is left in a state that makes reverse playback and later Milestone 5 verification easier, not harder.

## Open Decisions

- Should trails update at chunk change only, or at a coarser in-chunk cadence?
- Should the hot motion path live in React state, a dedicated external store, or scene-local refs?
- Do we want the HUD clock label to update every frame, or only often enough to look continuous to users?
- If trail rendering remains the main bottleneck after the earlier steps, should we prefer a circular GPU trail buffer or a larger static buffer with a moving draw range as the first rendering-level optimization?
- If rendering-level optimization still is not enough, what amount of orbital-ellipse approximation error is acceptable for Milestone 5 trail presentation?
