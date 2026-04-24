# Milestone 5 Task List

## Status

In Progress

## Goal

Ship real ephemeris-driven positions as the default startup experience so the scene shows bodies in real positions from the beginning, while keeping the static GitHub Pages app responsive, predictable, and mobile-friendly.

## Current Repo Snapshot

- Browser-side Milestone 5 runtime foundations are already implemented in this repo: schema parsing, dataset loading, chunk selection, Hermite interpolation, async provider loading, physical scaling, simulation clock wiring, and HUD loading or error messaging.
- The app now starts from the generated real-data runtime path by default, with explicit loading or error messaging instead of placeholder startup or failure fallback.
- External preprocessing work is completed separately in `docs/tasks/milestone-5-spicenet.md`.
- The repo now versions the accepted kernel-derived metadata snapshot at `public/ephemeris/body-metadata.json`, and it now defines the ignored local generated-asset root at `public/ephemeris/generated/` plus a helper script that can populate it from the pinned external `SpiceNet` workflow.
- The GitHub Pages workflow now checks out `SpiceNet` at tag `v0.0.1` and generates non-versioned deployment ephemeris assets from the JPL SSD `de440s.bsp` URL before the site build, and the deployed app now consumes those generated assets through the default real-data runtime path.
- The first real-data activation pass now defaults to `0.001` scene units per kilometer unless a runtime override is supplied.
- The first real-data camera pass now keeps one shared km-to-scene scale for positions and radii while deriving overview framing, zoom bounds, and clip planes from the loaded scene extents.
- The runtime now maps raw J2000 ephemeris vectors into one shared ecliptic-aligned render frame before focus, controls, and planet rendering consume body positions.
- The current focus pass now snaps targeting directly onto the selected body center and uses an initial focused camera distance of about `10 x` the body radius from the authored focus direction.
- Focused tracking now re-evaluates the authored pose only while a focus transition is settling; once focused, live body updates translate the current camera and target together so manual orbit and zoom adjustments remain intact.
- The first trail pass now derives sampled position history from the active loaded chunk, clips it with body-specific default trail windows, and renders it without adding visible trail controls yet.
- Richer trail styling and longer historical lookback for bodies such as the outer planets are explicitly deferred to the later trail UX milestone.
- The HUD now exposes one minimal playback-rate control that cycles through the current Milestone 5 speed presets while reverse playback remains pending.
- The default runtime now advances the simulation clock on every animation frame for visibly smoother motion through the interpolated ephemeris curve.
- Visiting `/debug` on the current host now enables a lightweight FPS overlay without changing the default clock cadence.
- Visiting `/debug` now also starts from the Milestone 5.1 benchmark timestamp by default and shows lightweight runtime timing samples for clock, catalog, snapshot, trail, mapping, and scene-update work.
- The first runtime optimization pass now reuses scaled body metadata across catalog refreshes and indexes snapshot bodies by id during catalog resolution so the per-frame path does less avoidable work before deeper profiling continues.
- The current rendering path still treats axial orientation, spin-rate fidelity, and Earth-Sun seasonal orientation as planned follow-up work rather than finished physical alignment.

## Agreed Milestone Direction

- Use the pinned external `SpiceNet` workflow as the generator for Milestone 5 web data.
- Show real ephemeris-driven body positions from the beginning of the scene. Do not fall back to placeholder positions.
- If real data is not ready yet, show an explicit loading or error state rather than silently substituting a placeholder catalog.
- Keep ephemeris manifest and chunk files non-versioned and generate them during CI or CD.
- Keep kernel binaries and generated ephemeris artifacts out of git.
- Keep `body-metadata.json` versioned in this repo as the accepted small kernel-derived metadata snapshot.
- Provide a git-ignored local directory for generated ephemeris assets during development.
- Add a local helper script that generates ephemeris assets when that local directory is missing, reusing the accepted `SpiceNet` flow.
- Use `public/ephemeris/generated/` as the local generated asset root, served from `./ephemeris/generated` when the runtime is configured to consume local generated data.
- Keep the default `pnpm build` path focused on the web app build; ephemeris generation should remain an explicit local or CI or CD step.
- Pin CI or CD generation to `3Dmondo/SpiceNet` tag `v0.0.1`.
- Fetch `de440s.bsp` for CI or CD generation from the JPL SSD catalog URL `https://ssd.jpl.nasa.gov/ftp/eph/planets/bsp/de440s.bsp`.
- Use `0.001` scene units per kilometer as the first default physical scale, with `VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER` reserved as an override while Milestone 5 tuning continues.
- Preserve the accepted solar-system-barycenter frame, approximate J2000 UTC anchor, and cubic Hermite interpolation contract for Milestone 5.
- Keep physical metadata separate from cinematic presentation metadata, with one explicit km-to-scene scale factor for the real-data path.
- Extend the physical-alignment review beyond mean radii where useful, starting with axial orientation, body rotation rates, and Earth's orientation relative to the Sun.

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
- [x] Make per-frame clock advancement the default runtime cadence while keeping `/debug` as lightweight FPS instrumentation.
- [x] Add pause and resume control plus HUD messaging for loading, error, and current simulation time.
- [x] Keep the default `pnpm build` and current GitHub Pages workflow free of hidden ephemeris generation.
- [x] Add unit coverage for parsing, dataset loading, interpolation, provider caching, runtime wiring, simulation clock behavior, and HUD state messaging.

### Data Delivery And Activation Still To Do

- [x] Remove the placeholder startup and failure fallback from the runtime path.
- [x] Make the app load real ephemeris data at startup so the first visible scene uses real positions instead of placeholder ones.
- [x] Keep loading and failure UI explicit while the real dataset is being resolved.
- [x] Version `body-metadata.json` in this repo as the accepted kernel-derived metadata snapshot.
- [x] Keep ephemeris manifest and chunk files non-versioned and generated outside git.
- [x] Generate ephemeris manifest and chunk files during CI or CD with the pinned `SpiceNet` workflow before deployment.
- [x] Publish generated ephemeris assets with the deployed site without committing them to git.
- [x] Define a git-ignored local output directory for generated ephemeris assets during development.
- [x] Add a local helper script that generates ephemeris assets when the local output directory is missing.
- [x] Wire the runtime to consume versioned body metadata together with generated ephemeris manifest and chunk assets.
- [x] Retune overview framing, zoom limits, and clip planes so the current physically scaled real-data scene remains navigable.
- [x] Keep focus offsets and real body positions in the same render-space frame instead of mixing raw J2000 coordinates with authored scene-space camera offsets.
- [x] Keep focused-body targeting centered on the selected planet during the transition and tighten the default focused framing distance for local inspection.

### UX And Verification Still To Do

- [x] Add sampled trail geometry derived from loaded chunk data.
- [x] Support body-specific default trail windows while keeping the visible UI minimal in Milestone 5.
- [x] Add rate changes to the current playback controls.
- [ ] 5.1 Optimize the new per-frame runtime path, with attention to catalog recomputation, interpolation cost, avoidable React churn, and scene update overhead.
- [ ] 5.2 Review dynamic lighting coherence for Earth layers, Saturn ring shadows on the globe, and Venus cloud lighting so the apparent sun direction tracks live body positions.
- [ ] 5.3 Align scene rendering with solar-system metadata, including axial orientation, rotation speed, Earth-Sun orientation, and other physical characteristics worth bringing into the runtime contract.
- [ ] Add reverse playback after the current performance, lighting, and physical-alignment follow-up.
- [ ] Defer explicit date picking unless Milestone 5 usability shows it is necessary.
- [ ] Add browser coverage for real-data startup, chunk-boundary loading, scrubbing, and focused-body recovery while data is loading.
- [ ] Finish chunk-size, startup-latency, and production chunk-duration benchmarking for the browser runtime.
- [ ] Run milestone closeout manual verification for the real-data path on desktop and mobile.

## Follow-up Tasks Within Milestone 5

### 5.1 Optimization

- The first optimization pass now keeps the physically scaled metadata stable across clock-driven catalog refreshes and avoids repeated linear body lookups while merging snapshot state into the resolved catalog.
- The current measurement pass now gives `/debug` one repeatable benchmark timestamp by default plus debug-only timing samples across the main runtime phases called out in the Milestone 5.1 plan.
- The next CPU pass now precomputes per-chunk trail sampler state and reuses stable interior trail segments across nearby frames so trail history no longer walks the chunk samples from scratch on every snapshot.
- Profile the now-default per-frame runtime with `/debug` and isolate the heaviest cost centers across catalog refreshes, interpolation, React updates, and scene work.
- Reduce avoidable per-frame recomputation before Milestone 5 closeout, especially where derived data can be cached or scene updates can be narrowed.
- Re-measure desktop and mobile FPS after each optimization pass so the smoother cadence does not regress usability.

### 5.2 Lighting Coherence Review

- Re-check Earth layered lighting so the day or night split, cloud response, and specular highlights follow the live sun direction.
- Re-check Saturn ring shadow projection on the globe under moving-body lighting.
- Re-check Venus cloud lighting so the apparent terminator follows the changing body-to-sun vector.

### 5.3 Physical Alignment Review

- Align each body's rendered spin axis with the best accepted physical metadata we have available, rather than relying on presentation-friendly defaults where they diverge.
- Review body rotation speeds so self-rotation timing is coherent with real periods and remains stable under the current simulation clock.
- Make Earth's orientation toward the Sun seasonally coherent instead of leaving the apparent solar exposure to texture or shader assumptions alone.
- Identify which additional physical characteristics are worth bringing into the Milestone 5 runtime contract next, such as pole orientation, obliquity, prime meridian or epoch anchoring, and sidereal rotation metadata.

## Remaining Plan

### 1. Versioned Versus Generated Assets

- Keep the committed `public/ephemeris/body-metadata.json` snapshot aligned with the accepted `SpiceNet` metadata flow.
- Treat ephemeris manifest and chunk files as generated deployment and development artifacts rather than versioned source files.
- Keep the Milestone 5 web-data contract aligned with `docs/tasks/milestone-5-spicenet.md`.

### 2. CI Or CD And Local Generation

- Keep CI or CD generation pinned to `3Dmondo/SpiceNet` tag `v0.0.1`.
- Fetch `de440s.bsp` for CI or CD generation from the JPL SSD catalog entry at `https://ssd.jpl.nasa.gov/ftp/eph/planets/bsp/de440s.bsp`.
- Keep the local generated output rooted at `public/ephemeris/generated/`, served from `./ephemeris/generated` when configured.
- Use `scripts/Ensure-LocalWebEphemerisData.ps1` to populate missing local ephemeris assets through the pinned external `SpiceNet` workflow.

### 3. Runtime Activation

- Real positions now load from the first scene render, with explicit loading or error UX instead of placeholder substitutes.
- Keep tuning the first physical scale factor from the current default `0.001` scene units per kilometer before any later cinematic scaling work.
- Keep evaluating whether the single physical scale should remain the long-term Milestone 5 default, but keep camera framing and clipping derived from scene extents while that tuning continues.
- Keep the runtime contract explicit that raw SPICE positions stay in the accepted J2000 source frame until the scene-mapping layer rotates them into the app's ecliptic-aligned render frame.
- Expand the physical-alignment contract beyond radius-only metadata where it materially improves correctness, starting with axial orientation, spin-rate metadata, and Earth's seasonal orientation toward the Sun.

### 4. Time Controls And Verification

- Keep the landed playback-rate control minimal while tuning the accepted preset speeds.
- The default runtime now advances on every animation frame for smoother motion; keep `/debug` as the manual FPS overlay while optimizing that path.
- Add reverse playback after the current performance, lighting, and physical-alignment follow-up.
- Defer explicit date picking unless Milestone 5 usability proves it is necessary.
- Verify the first chunk-derived trail pass stays readable enough before any richer trail controls are introduced.
- Keep the Milestone 5 trail pass intentionally simple; defer brighter or thicker styling, non-transparent treatment, tail fading, and deeper historical windows to the later trail UX milestone.

### 5. Verification And Closeout

- Add browser coverage for the real-data-only startup path, chunk-boundary loading, and focused-body recovery.
- Use `/debug` for manual FPS measurements while profiling the now-default per-frame clock path.
- Manually verify desktop and mobile behavior with throttled network and CPU.
- Update roadmap, architecture, vision, and deployment docs again once the real-data-first path lands.

## Acceptance Notes

- The first visible scene should come from real ephemeris data or an explicit loading state, never from placeholder positions.
- Opening the site should not require downloading the full supported ephemeris range.
- The overview should stay responsive while the first real-data chunk loads.
- Scrubbing within the current chunk should not trigger heavy recomputation.
- Crossing a chunk boundary should rely on prefetch or a short explicit loading state rather than a long stall.
- The deployed site should use ephemeris manifest and chunk assets generated during CI or CD rather than versioned copies in git.
- `body-metadata.json` should remain versioned and small enough to diff, review, and consume directly from the web app.
- Local development should work against a git-ignored generated ephemeris directory plus a helper script when data is missing.
- The first real-data release should start from the user's current datetime and advance in real time unless paused or rate-adjusted.
- Body self-rotation and axial presentation should converge toward accepted physical metadata rather than staying presentation-authored where they visibly diverge.
- Real-data integration should not force Milestone 6 frame-selection work into this milestone.

## Open Questions

- Should the local helper script only generate data when missing, or also support an explicit refresh mode?
- What final production chunk duration falls out of the accepted `de440s` benchmark once Moon and inner-planet cadence are factored in?
- Which physical metadata fields beyond mean radius give the best visual payoff for Milestone 5.3 without overcomplicating the web-data contract?
