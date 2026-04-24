# Milestone 5.1 Runtime Performance Plan

## Status

Ready

## Goal

Recover runtime performance in the real-data Milestone 5 path without degrading trail fidelity and without allowing body motion and trail motion to drift out of sync.

Defaults locked by this brief:

- Treat the first pass as hotspot identification plus low-risk architectural narrowing, not as a speculative rewrite.
- Keep bodies and trails synchronized to one authoritative simulation timestamp owned by the render-loop path.
- Do not shorten trail windows, decimate trail points, or update trails less often than body motion in the first pass.
- Defer low-level WebGL optimization until simpler CPU and data-flow changes are measured and shown insufficient.
- Tie every performance claim to one reproducible benchmark setup with explicit route, timestamp, playback rate, and measurement method.

## Verified Repo Facts

- `src/features/experience/state/useSimulationClock.ts` advances `simulationTimeMs` on every `requestAnimationFrame` by default and emits a new ISO `requestedUtc` string every frame.
- `src/features/experience/SolarSystemExperience.tsx` feeds that per-frame `requestedUtc` directly into `useResolvedBodyCatalog(...)`.
- `src/features/experience/state/useResolvedBodyCatalog.ts` normalizes each timestamp, triggers `prefetchAroundUtc(...)`, and awaits `loadBodyCatalogAtUtc(...)` whenever `requestedUtc` changes.
- `src/features/solar-system/data/webBodyCatalogSource.ts` loads scaled metadata plus a fresh ephemeris snapshot, maps the snapshot into scene space, and rebuilds the resolved catalog on each request.
- `src/features/solar-system/data/webEphemerisProvider.ts` loads the active chunk, interpolates all 10 bodies for the requested time, and regenerates all visible trails for the requested time.
- `src/features/solar-system/data/webEphemerisTrails.ts` samples each trail by walking the current chunk body samples inside the requested trail window and appending an interpolated endpoint at the requested time.
- `src/features/solar-system/data/ephemerisSceneMapping.ts` remaps every body position and every trail point from J2000 kilometer space into scene space on each snapshot.
- `src/features/solar-system/data/bodyStateStore.ts` rebuilds merged `BodyDefinition` objects on each resolved snapshot.
- `src/features/experience/components/ExperienceScene.tsx` passes fresh `catalog.snapshot.trails` arrays into `OrbitTrails` and fresh `catalog.bodies` arrays into the planet list.
- `src/features/solar-system/components/OrbitTrails.tsx` forwards each trail's current `positions` array into `drei` `Line`.
- The current generated manifest at `public/ephemeris/generated/manifest.json` defines a `2025-2050` chunk with these approximate per-body sample counts:
  - Sun `306`
  - Mercury `3,045`
  - Venus `1,306`
  - Moon `3,045`
  - Earth `1,306`
  - Mars `654`
  - Jupiter `306`
  - Saturn `306`
  - Uranus `306`
  - Neptune `306`
- That same chunk contains `10,886` total body samples across the full body set.
- With the current default trail windows from `src/features/solar-system/data/bodyPresentation.ts`, the visible trail-point count is benchmark-dependent:
  - at `2026-04-24T00:00:00Z`, the current windows imply about `251` visible trail points
  - just before the chunk end at `2050-01-01T12:00:00Z`, the current windows imply about `1,228` visible trail points

## Benchmark Protocol

Use one fixed baseline scenario before changing the runtime path:

- Route: `/debug`
- Initial view: overview
- Benchmark timestamp: `2026-04-24T00:00:00Z`
- Playback rates to measure at minimum:
  - default `1x`
  - `1h/s`
  - `1d/s`

Measurement method:

- Wait until the initial catalog load settles and the overview is interactive.
- Leave the camera in the overview unless the specific test says otherwise.
- Record the `/debug` FPS overlay result after the scene reaches a steady state.
- If instrumentation is added, capture per-frame time attributed to:
  - clock advancement
  - catalog refresh orchestration
  - ephemeris snapshot generation
  - trail generation
  - scene-space mapping
  - scene or render update cost
- Record a qualitative motion-coherence result for each run:
  - bodies advance continuously
  - trails remain readable
  - trail endpoints stay locked to body motion
  - no repeated lag or snap cycle appears

Use the same route, timestamp, and rate set again after each optimization slice so before or after claims are comparable.

## Hotspot Ranking

Rank actual cost centers from measurement before choosing the first optimization slice. Do not assume the largest bottleneck until the current build is measured.

Expected hotspot candidates to confirm or reject:

1. per-frame React state churn from the clock-driven catalog path
2. per-frame async catalog refresh orchestration in `useResolvedBodyCatalog(...)`
3. per-frame trail regeneration in `webEphemerisProvider.ts` and `webEphemerisTrails.ts`
4. per-frame scene-space remapping in `ephemerisSceneMapping.ts`
5. per-frame resolved-catalog rebuilding in `bodyStateStore.ts`
6. per-frame R3F prop churn in `ExperienceScene`, `PlanetBody`, and `OrbitTrails`
7. GPU upload or line rebuild cost caused by fresh trail arrays reaching `drei` `Line`

The first implementation slice should target the highest-ranked hotspot that can be reduced without changing visible behavior.

## Optimization Ladder

### 1. Add Repeatable Measurement First

- Keep `/debug` as the primary manual benchmark route.
- Add a debug-only instrumentation seam if the current FPS overlay is not enough to rank hotspots confidently.
- If needed for repeatability, add a debug-only way to start the runtime from the fixed benchmark timestamp instead of the current wall clock.

### 2. Remove Avoidable CPU Churn Without Changing Visual Output

- Preserve the current trail windows, sampled data source, and overview-first presentation.
- Prefer caching and reuse before structural rewrites:
  - cache active chunk lookup structures
  - cache per-chunk scene-space trail samples where possible
  - avoid rebuilding unchanged trail history each frame
  - avoid rebuilding full resolved-catalog object graphs for scene motion
- Treat this pass as the first choice before any rendering-level optimization.

### 3. Move Hot Motion Ownership To One Runtime Owner

- Keep `useResolvedBodyCatalog(...)` as the slow lane for:
  - startup loading
  - loading and error UX
  - chunk-boundary loading or failure handling
  - slow-lane metadata delivery
- Stop treating `useResolvedBodyCatalog(...)` as the owner of per-frame motion.
- Introduce one dedicated active-chunk runtime owner for hot motion data. The symbol name may vary, but the responsibility is fixed:
  - current simulation time for the frame
  - warmed active chunk data
  - per-frame body interpolation
  - per-frame trail frontier state

Render-loop synchronization is explicit:

- body interpolation and trail updates read the same frame timestamp
- both advance from the same owner during the same render-tick path
- React effects, timers, or delayed async commits must not independently drive trail motion

### 4. Re-Measure Before Escalating

- Re-run the fixed benchmark protocol after the first CPU or ownership change.
- Re-rank hotspots from the new measurements before choosing the next optimization slice.

### 5. Only Then Consider GPU-Level Trail Optimization

- If measurements still show trail rendering or upload cost as the dominant blocker after the earlier steps, prefer this order:
  1. stable per-trail buffer with moving draw range or endpoint update
  2. only then more complex circular-buffer techniques
- Do not jump to low-level WebGL work before the simpler CPU and ownership changes are measured.

Contract expectations for Milestone 5.1:

- No user-facing API change is required.
- Adding a debug-only benchmarking seam is acceptable if it stays outside the normal runtime path.
- Add a runtime-motion seam between startup data loading and per-frame scene motion.
- Keep the resolved-catalog contract available for slow-lane UI concerns, but do not require it to be regenerated every frame.

## Acceptance Criteria

- Before or after improvement claims use the benchmark protocol defined above.
- The tested build improves on the measured baseline without regressing motion coherence.
- Bodies and trails remain visually locked together at `1x`, `1h/s`, and `1d/s`.
- The first pass does not:
  - shrink trail windows
  - decimate trail points
  - introduce a trail cadence separate from body motion
- Startup loading, loading and error HUD messaging, and chunk-boundary behavior remain intact.
- Focused-body tracking remains intact.
- `pnpm test` stays green for any touched runtime, provider, store, or debug-only instrumentation code.

Verification scenarios required after each optimization slice:

- `/debug` at `2026-04-24T00:00:00Z` in overview at `1x`, `1h/s`, and `1d/s`
- body motion remains smooth
- trails remain readable and move in lockstep with bodies
- no lag or snap cycle appears between a body and its trail endpoint
- chunk-boundary loading still works
- focused-body tracking still works
- loading and error HUD behavior still works

## Deferred Work

- Reverse playback
- Lighting coherence follow-up for Earth, Saturn, and Venus
- Physical-alignment follow-up for axial orientation, rotation speed, and Earth-Sun seasonal orientation
- Analytical trail approximation
  - keep this out of scope unless later evidence shows both CPU-side and GPU-side trail costs still block Milestone 5 after the earlier steps

