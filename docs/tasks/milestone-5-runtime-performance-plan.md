# Milestone 5 Runtime Performance Plan

## Status

Replanned

## Goal

Recover most of the performance lost after switching the runtime clock to per-frame advancement, while keeping real ephemeris motion visually smooth and preserving the current Milestone 5 startup behavior.

## Restart Decision

- Restart this task from the last committed state before the current uncommitted runtime-performance experiments.
- Treat the current uncommitted branch work as rejected exploration, not as the base for the next pass.
- Do not continue layering fixes on the current effect-driven hot path.

Why this restart is justified:

- The current branch still shows visible oscillation at `1h/s` and `1d/s`.
- The visible oscillation now affects both body motion and trail motion, which means the current dataflow is still not stable enough even after multiple local fixes.
- The current implementation path kept per-frame motion coupled to `useResolvedBodyCatalog(...)`, which remains a React hook built around request orchestration and catalog replacement rather than a dedicated motion runtime.
- The repeated “body advances, trail lags, trail rejoins, body snaps” pattern is strong evidence that the architecture is still fighting the hot loop instead of owning it cleanly.

## Scope Of This Plan

- This plan covers Milestone `5.1` runtime-performance follow-up only.
- It assumes the current real-data startup path, loading or error UX, body interpolation contract, and active-chunk trail presentation stay in place unless a later measurement proves one of them must change.
- It does not treat trail styling, reverse playback, or broader physical-alignment work as part of the first optimization slice.

## Current Symptom In The Rejected Branch

- The overview dropped from about `60 FPS` to about `17 FPS` after the runtime started resolving the real-data catalog on every animation frame.
- The first catalog-refresh optimization pass helped a little, but it did not address the main cost center.
- The later uncommitted optimization attempts recovered some FPS, but they did not preserve stable motion.
- At faster playback rates such as `1h/s` and `1d/s`, bodies and trails still oscillate visibly instead of advancing smoothly.

## Verified Findings

- The current clock path in `src/features/experience/state/useSimulationClock.ts` emits a fresh `requestedUtc` string on every `requestAnimationFrame`.
- `src/features/experience/state/useResolvedBodyCatalog.ts` treats every new timestamp as a new async catalog request, so the app starts `prefetchAroundUtc(...)` plus `loadBodyCatalogAtUtc(...)` on every frame.
- `src/features/solar-system/data/webBodyCatalogSource.ts` now keeps scaled body metadata cached across requests, but it still rebuilds a fresh resolved catalog object graph for every requested time.
- `src/features/solar-system/data/webEphemerisProvider.ts` currently does both of these on every request:
  - interpolates all 10 body positions for the requested time
  - resamples all 10 body trails for the requested time
- The raw body-position interpolation work is comparatively small. The larger cost comes from regenerating trails, rebuilding object graphs, and pushing a brand-new catalog through React and Three every frame.
- `prefetchAroundUtc(...)` still runs on every timestamp change, but the current provider cache means repeated calls inside the same chunk are more likely to be avoidable bookkeeping overhead than repeated network fetches.
- With the current local generated dataset in `public/ephemeris/generated/manifest.json`, the active `2025-2050` chunk implies roughly:
  - `10,886` chunk samples scanned per frame across all bodies
  - `1,224` visible trail points rebuilt and remapped to scene space per frame

## Additional Findings From The Rejected Branch

- Caching and partial synchronous fallbacks improved FPS, but they did not remove the fundamental mismatch between the per-frame motion path and the effect-driven catalog hook.
- Trying to keep hot motion inside the `ResolvedBodyCatalog` replacement path makes it too easy for body motion, trail cadence, request timing, and React commit timing to drift out of lockstep.
- The branch demonstrated that better caching alone is not enough if the scene still consumes per-frame motion through a catalog object that is regenerated and committed through React.

## Current Hot Path

1. `useSimulationClock(...)` advances `simulationTimeMs` on every animation frame and returns a new ISO timestamp.
2. `useResolvedBodyCatalog(...)` normalizes that timestamp, triggers `prefetchAroundUtc(...)`, and awaits `loadBodyCatalogAtUtc(...)`.
3. `createWebBodyCatalogSource(...)` loads cached scaled metadata plus a fresh runtime snapshot, then merges both into a new resolved catalog.
4. `createWebEphemerisProvider(...)` resolves the active chunk, interpolates all bodies, and resamples all visible trails for the same timestamp.
5. The scene receives fresh body-position arrays and fresh trail arrays, so React and `@react-three/fiber` propagate new props through the overview every frame.

## Non-Goals For The First Pass

- Do not replace Hermite interpolation with a lower-fidelity body-position approximation.
- Do not redesign trail visuals or widen trail history just to hide runtime cost.
- Do not add new user-facing controls as part of the performance pass.
- Do not move immediately to analytical orbit approximations unless the measured CPU and GPU costs still block Milestone 5 after caching and data-path narrowing.

## Updated Hypothesis

The performance collapse is mainly caused by architectural churn around the per-frame time update, not by the 10 Hermite body interpolations alone.

The likely unstable path is:

1. per-frame React state update for simulation time
2. per-frame async catalog refresh effect
3. per-frame full-catalog or partial-catalog replacement
4. trail updates that do not share one explicit ownership model with body motion
5. per-frame React rerender of scene consumers that were not designed as a motion store

The browser runtime needs one authoritative hot-motion owner instead of trying to make the catalog-loading hook behave like one.

## Replanned Implementation Strategy

### 1. Return To The Last Good Commit Before This Experiment

- Discard the current uncommitted Milestone 5.1 performance experiment.
- Re-enter from the last committed state where startup, focus, and trail behavior were at least functionally coherent, even if slow.
- Keep the newly learned measurements and failure notes, but do not keep the current code path.

### 2. Split Startup Loading From Runtime Motion Ownership

- Keep `useResolvedBodyCatalog(...)` for what it is good at:
  - initial loading
  - chunk-boundary loading
  - loading and error messaging
  - static metadata delivery
- Stop using `useResolvedBodyCatalog(...)` as the owner of per-frame motion after startup.
- Introduce a dedicated Milestone 5 runtime motion layer that owns:
  - current simulation time
  - active chunk selection
  - body interpolation inside the active chunk
  - trail refresh policy inside the active chunk

Expected result:

- startup and async loading remain explicit
- per-frame motion no longer depends on React effect timing

### 3. Build A Scene Runtime Store For Hot Motion Data

- Add a dedicated runtime store or ref-backed runtime object for the active chunk.
- Warm or swap that runtime object only when:
  - the first chunk finishes loading
  - playback crosses a chunk boundary
  - a recoverable data error forces a reset
- Keep the hot motion data shape narrow:
  - current body positions
  - current body velocities if still useful
  - current trail geometry state
- Do not rebuild the full resolved catalog object graph per frame.

Expected result:

- one stable owner for motion state
- no per-frame catalog regeneration

### 4. Move Body Motion Fully Off The Effect-Driven React Loop

- Interpolate bodies directly from the warmed active chunk inside the motion runtime.
- Let the scene consume those positions from the runtime store or scene-local subscription.
- Keep React rendering for slower UI concerns only:
  - HUD text
  - playback controls
  - loading and error state
  - focus selection state

Expected result:

- body motion becomes smooth because it no longer waits for async hook churn or React commit timing

### 5. Rebuild The Trail Strategy Around The Same Motion Owner

- Do not let trails be governed by a separate timing model from body positions.
- Keep a stable cached trail body per chunk.
- Update only the moving frontier from the same runtime motion owner that updates the bodies.
- Prefer one of these implementations:
  - append or trim the visible endpoint from a cached sampled trail body
  - maintain a stable per-body buffer and adjust only the active frontier
- Avoid policies that refresh trails on an arbitrary cadence unrelated to the same motion owner.

Expected result:

- trails and planets advance coherently
- no repeated lag and snap cycle

### 6. Re-Measure Only After The Ownership Split Lands

- Do not spend another pass tuning cache windows or cadence thresholds until the motion owner is separated from the catalog hook.
- Measure again only after:
  - body motion comes from the runtime store
  - trail frontier updates come from the same runtime store
  - React is out of the per-frame catalog loop

## Rejected Tactics From This Branch

- Do not continue with per-frame requests routed through `useResolvedBodyCatalog(...)`, even if some of them can be answered synchronously.
- Do not keep adding local cache layers on top of full catalog replacement in React as the main strategy.
- Do not govern trails with a cadence policy that is separate from the same owner that advances body motion.
- Do not treat “FPS improved” as success if visible motion still oscillates.

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

1. Reset to the last committed state before the current uncommitted experiment.
2. Keep `/debug` instrumentation available, but treat it as support tooling only.
3. Introduce a dedicated runtime motion store for the active chunk.
4. Route per-frame body interpolation through that runtime store instead of the catalog hook.
5. Move trail frontier updates under the same runtime store.
6. Re-measure motion stability first, then FPS.
7. Only after motion is stable, revisit GPU upload reduction if trails still cost too much.

## Immediate Deliverable For The Next Code Step

- Reset to the last committed state before this uncommitted experiment.
- Preserve or re-add lightweight `/debug` instrumentation only if it can live outside the hot motion ownership path.
- Build the first dedicated active-chunk motion store without changing the startup loading contract.
- Keep startup, chunk-boundary loading, and focus tracking behavior unchanged while the motion owner is replaced.

## Exit Criteria Per Sub-Step

### Instrumentation Baseline

- A local run can show where time is spent without opening browser devtools on every check.
- We have at least one before snapshot for default playback and one faster playback preset.

### Trail Decoupling Pass

- Body motion remains smooth at default playback and at least one faster preset.
- Trails advance coherently with body motion instead of lagging and snapping in a visible cycle.
- Desktop `/debug` FPS shows a meaningful recovery from the current `~17 FPS` baseline.

### Data-Shape Narrowing Pass

- The per-frame path no longer replaces the entire resolved catalog object graph.
- Scene consumers no longer depend on the catalog hook for hot motion updates.

## Verification

- Use `/debug` for desktop FPS checks before and after each sub-step.
- Re-test the overview with the default playback rate and at least one faster rate such as `1m/s`.
- Confirm that:
  - bodies still move smoothly
  - trails remain readable and stable
  - bodies and trails advance together without a repeated lag and snap cycle
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
