# Milestone 5 Task List

## Status

In Progress

## Goal

Ship real ephemeris-driven positions as the default startup experience so the scene shows bodies in real positions from the beginning, while keeping the static GitHub Pages app responsive, predictable, and mobile-friendly.

## Current Repo Snapshot

- Browser-side Milestone 5 runtime foundations are already implemented in this repo: schema parsing, dataset loading, chunk selection, Hermite interpolation, async provider loading, physical scaling, simulation clock wiring, and HUD loading or error messaging.
- Current code still keeps the mocked catalog as a startup and failure fallback. That no longer matches the agreed Milestone 5 direction and needs to be removed.
- External preprocessing work is completed separately in `docs/tasks/milestone-5-spicenet.md`.
- The repo now versions the accepted kernel-derived metadata snapshot at `public/ephemeris/body-metadata.json`, but it does not yet generate non-versioned ephemeris assets during CI or CD or local development.

## Agreed Milestone Direction

- Use the pinned external `SpiceNet` workflow as the generator for Milestone 5 web data.
- Show real ephemeris-driven body positions from the beginning of the scene. Do not fall back to mocked positions.
- If real data is not ready yet, show an explicit loading or error state rather than silently substituting a mocked catalog.
- Keep ephemeris manifest and chunk files non-versioned and generate them during CI or CD.
- Keep kernel binaries and generated ephemeris artifacts out of git.
- Keep `body-metadata.json` versioned in this repo as the accepted small kernel-derived metadata snapshot.
- Provide a git-ignored local directory for generated ephemeris assets during development.
- Add a local helper script that generates ephemeris assets when that local directory is missing, reusing the accepted `SpiceNet` flow.
- Keep the default `pnpm build` path focused on the web app build; ephemeris generation should remain an explicit local or CI or CD step.
- Preserve the accepted solar-system-barycenter frame, approximate J2000 UTC anchor, and cubic Hermite interpolation contract for Milestone 5.
- Keep physical metadata separate from cinematic presentation metadata, with one explicit km-to-scene scale factor for the real-data path.

## Progress Checklist

### Runtime Foundations Already Landed In This Repo

- [x] Parse and validate the accepted web manifest, chunk, and body-metadata schema.
- [x] Support the accepted solar-system-barycenter runtime layout, including body-specific cadence and flattened `xyz_vxvyvz` samples.
- [x] Load and cache manifest and body metadata through a shared browser-side dataset loader.
- [x] Convert requested UTC time to the accepted approximate J2000 anchor and interpolate chunk samples with cubic Hermite math.
- [x] Select chunk ranges at runtime, prefetch adjacent chunks, cache loaded chunks, and surface out-of-range or fetch failures.
- [x] Keep raw ephemeris snapshots in kilometer space inside the async provider.
- [x] Map kilometer snapshots and kernel-derived mean radii through one explicit km-to-scene scaling adapter.
- [x] Preserve presentation metadata separately from physical metadata while scaling focus offsets proportionally.
- [x] Compose the async provider and physical-scale mapping into the shared resolved catalog shape already used by the scene.
- [x] Start the simulation clock from the current time and advance it in real time.
- [x] Add pause and resume control plus HUD messaging for loading, fallback, and current simulation time.
- [x] Keep the default `pnpm build` and current GitHub Pages workflow free of hidden ephemeris generation.
- [x] Add unit coverage for parsing, dataset loading, interpolation, provider caching, runtime wiring, simulation clock behavior, and HUD state messaging.

### Data Delivery And Activation Still To Do

- [ ] Remove the mocked startup and failure fallback from the runtime path.
- [ ] Make the app load real ephemeris data at startup so the first visible scene uses real positions instead of mocked ones.
- [ ] Keep loading and failure UI explicit while the real dataset is being resolved.
- [x] Version `body-metadata.json` in this repo as the accepted kernel-derived metadata snapshot.
- [ ] Keep ephemeris manifest and chunk files non-versioned and generated outside git.
- [ ] Generate ephemeris manifest and chunk files during CI or CD with the pinned `SpiceNet` workflow before deployment.
- [ ] Publish generated ephemeris assets with the deployed site without committing them to git.
- [ ] Define a git-ignored local output directory for generated ephemeris assets during development.
- [ ] Add a local helper script that generates ephemeris assets when the local output directory is missing.
- [x] Wire the runtime to consume versioned body metadata together with generated ephemeris manifest and chunk assets.

### UX And Verification Still To Do

- [ ] Replace circular mocked trails with sampled trail geometry derived from loaded chunk data.
- [ ] Support body-specific default trail windows while keeping the visible UI minimal in Milestone 5.
- [ ] Add the next playback controls in this order: rate changes, reverse playback.
- [ ] Defer explicit date picking unless Milestone 5 usability shows it is necessary.
- [ ] Add browser coverage for real-data startup, chunk-boundary loading, scrubbing, and focused-body recovery while data is loading.
- [ ] Finish chunk-size, startup-latency, and production chunk-duration benchmarking for the browser runtime.
- [ ] Run milestone closeout manual verification for the real-data path on desktop and mobile.

## Remaining Plan

### 1. Versioned Versus Generated Assets

- Keep the committed `public/ephemeris/body-metadata.json` snapshot aligned with the accepted `SpiceNet` metadata flow.
- Treat ephemeris manifest and chunk files as generated deployment and development artifacts rather than versioned source files.
- Keep the Milestone 5 web-data contract aligned with `docs/tasks/milestone-5-spicenet.md`.

### 2. CI Or CD And Local Generation

- Add CI or CD steps that fetch kernels through the accepted external `SpiceNet` workflow and generate ephemeris data before deployment.
- Define a git-ignored local output directory for generated ephemeris assets.
- Add a local helper script that checks for missing ephemeris assets and generates them when needed.

### 3. Runtime Activation

- Remove the mocked fallback path.
- Load real positions from the first scene render, with explicit loading or error UX instead of mocked substitutes.
- Keep the first physical scale factor inspectable in the live scene before any later cinematic scaling work.

### 4. Time And Trail UX

- Replace mocked circular trails with chunk-derived trail geometry.
- Add the next playback controls in this order: rate changes, reverse playback.
- Defer explicit date picking unless Milestone 5 usability proves it is necessary.

### 5. Verification And Closeout

- Add browser coverage for the real-data-only startup path, chunk-boundary loading, and focused-body recovery.
- Manually verify desktop and mobile behavior with throttled network and CPU.
- Update roadmap, architecture, vision, and deployment docs again once the real-data-first path lands.

## Acceptance Notes

- The first visible scene should come from real ephemeris data or an explicit loading state, never from mocked positions.
- Opening the site should not require downloading the full supported ephemeris range.
- The overview should stay responsive while the first real-data chunk loads.
- Scrubbing within the current chunk should not trigger heavy recomputation.
- Crossing a chunk boundary should rely on prefetch or a short explicit loading state rather than a long stall.
- The deployed site should use ephemeris manifest and chunk assets generated during CI or CD rather than versioned copies in git.
- `body-metadata.json` should remain versioned and small enough to diff, review, and consume directly from the web app.
- Local development should work against a git-ignored generated ephemeris directory plus a helper script when data is missing.
- The first real-data release should start from the user's current datetime and advance in real time unless paused or rate-adjusted.
- Real-data integration should not force Milestone 6 frame-selection work into this milestone.

## Open Questions

- What local ignored directory and env or base-URL convention should the app use for generated ephemeris assets during development?
- Should the local helper script only generate data when missing, or also support an explicit refresh mode?
- What final production chunk duration falls out of the accepted `de440s` benchmark once Moon and inner-planet cadence are factored in?
- What global km-to-scene scale factor keeps the first physical pass readable without reintroducing hidden cinematic distortion?
