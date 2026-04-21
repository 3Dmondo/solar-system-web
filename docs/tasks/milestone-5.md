# Milestone 5 Task List

## Status

In Progress

## Goal

Replace mocked positions with real ephemeris-driven motion while keeping the static GitHub Pages experience responsive, predictable, and mobile-friendly.

## Agreed Direction

- Milestone 5 is now committed to offline preprocessing rather than raw-kernel parsing in the browser.
- Use `SpiceNet` as the offline SPK reader, evaluator, and asset generator.
- Consume `SpiceNet` as a pinned external repository rather than vendoring it into this repo.
- Emit browser-friendly chunked assets plus a manifest rather than shipping raw `.bsp` parsing logic to the browser.
- The accepted external benchmark baseline is the current `SpiceNet` `de440s` solar-system-barycenter dataset covering 1950 through 2050 with mixed per-body cadence and `25` year chunks.
- Prefer compact JSON arrays that benefit from normal HTTP compression before introducing a custom binary format.
- Keep browser work limited to chunk selection, fetching, caching, interpolation, and scene updates.
- Use the accepted solar-system barycenter output as the default physical frame for the first live integration and defer selectable frame switching to Milestone 6.
- Keep Milestone 5 physically scaled with one global km-to-scene factor shared by real positions and real radii.
- Keep physical metadata from kernels separate from the app's cinematic presentation metadata.
- Do not hook ephemeris generation into `pnpm build`; provide separate local testing and CI generation workflows instead.
- The external preprocessing spike is tracked separately in `docs/tasks/milestone-5-spicenet.md`; this repo now starts with browser-side schema parsing, loading, interpolation, and UX work.
- Kernel-derived physical metadata should be loaded and stored separately from the current cinematic body metadata so later UI work can reuse it without disturbing the render-scale presentation model.
- Browser-side time conversion and interpolation helpers should match the accepted `SpiceNet` approximate J2000 UTC anchor, shared chunk-boundary rules, and cubic Hermite math so snapshot loading can trust the same contract end to end.
- Raw ephemeris snapshots should stay in kilometer space inside the async provider layer until a later physical-scale mapping step turns them into scene units with one explicit global factor.
- The kilometer-to-scene translation should live in its own uniform-scale adapter so Milestone 5 keeps physical proportions explicit instead of hiding scale decisions inside the provider or renderer.
- Defer any cinematic or logarithmic size scaling and any moon or satellite spacing offsets to a later dedicated cinematic-view milestone.

## Preferred Asset Shape

- One manifest should describe the kernel set, supported bodies, reference frame, coverage range, chunk duration, trail defaults, physical metadata, presentation metadata, and asset hashes.
- One chunk should contain all currently rendered bodies for a fixed interval so the overview can update from a single request instead of many per-body fetches.
- Use the accepted `de440s` benchmark output covering 1950 through 2050 to decide whether the final chunk duration should stay that large or be reduced.
- Within a chunk, each body should be allowed to use its own sample cadence because the Moon and inner planets need denser sampling than the outer planets.
- Store sampled positions plus sampled velocities so the browser can use cubic Hermite interpolation instead of linear interpolation.
- Start with compact JSON array payloads that are easy to inspect and iterate on, and only introduce a custom binary format if benchmarked chunk size or parse time forces that move.
- Each chunk should include enough overlap or padding to support smooth interpolation and adjacent-chunk prefetching.
- Include a generated physical-metadata section derived from the SPICE kernel set where available, prioritizing radii, axial tilt, and rotation period, while also carrying forward additional fields that may become useful in later educational milestones.
- Do not require the browser to evaluate raw SPK Chebyshev records in the first pass.
- The current accepted benchmark payload uses flattened per-body `xyz_vxvyvz` arrays plus approximate TDB seconds from J2000, so the web data layer should validate that layout explicitly instead of depending on implicit decoder assumptions.
- The current accepted benchmark payload is solar-system-barycenter output with `CenterBodyId = 0`, so the first live mapping should preserve that physical frame rather than immediately re-centering bodies into a cinematic layout.

## Initial Benchmark Baseline

- use the accepted `de440s` external benchmark output as the initial browser integration baseline
- benchmark a first generated output spanning 1950 through 2050
- include the kernel companions needed for leap seconds and body metadata extraction
- measure compressed transfer size, browser parse cost, interpolation quality, and chunk-boundary behavior
- shrink chunk duration before inventing a more complex runtime format if the first benchmark is too heavy

## Working Budgets

- lock explicit size and decode-time budgets before the format is finalized
- treat visibly smooth motion as the priority, not scientific-grade positional fidelity
- accept errors on the order of thousands of kilometers if they remain visually negligible in the current cinematic scale model
- prefer changing sample cadence before introducing a more complex runtime format

## Planned Steps

### 1. Accepted external benchmark baseline

- lock the first browser integration pass around the accepted `de440s` benchmark baseline plus the supporting kernel files needed for metadata extraction
- generate and inspect the accepted 1950 through 2050 benchmark output before wiring it into the runtime
- benchmark compact JSON chunks against at least one denser or lower-level alternative before inventing a custom binary format
- benchmark at least two interpolation shapes: sampled positions only versus sampled positions plus velocity-backed Hermite interpolation
- ship all kernel-derived metadata that can be extracted cleanly, with radii, axial tilt, and rotation period treated as the highest-priority fields for the app
- keep `SpiceNet` pinned as an external dependency for CI and local generation rather than embedding it into this repo

### 2. Kernel acquisition and local tooling

- keep ephemeris and kernel files out of git
- download the required kernel set during the CI or CD workflow instead of versioning it in this repo
- add a local testing script that fetches or refreshes kernels into a git-ignored cache folder for iterative generation work
- keep the normal `pnpm build` path free of ephemeris generation so frontend iteration stays lightweight

### 3. Offline generator

- extend `SpiceNet` with a generator entry point that loads the needed kernels, resolves the Sun plus planets plus Moon, and emits manifest plus chunk files ready for the web app
- add metadata extraction for body facts that should come from kernels or related kernel text files instead of remaining hand-authored forever
- keep output deterministic so it can be cached, diffed, and validated
- add spot checks that compare generated chunks against the source ephemerides
- make chunk duration, per-body cadence, and metadata fields configurable so the benchmarks can tune them without redesigning the pipeline

### 4. Browser data layer

- evolve the current synchronous provider boundary into a cached async snapshot source without rewriting scene consumers more than necessary
- keep static body metadata synchronous
- load the accepted manifest and kernel-derived body metadata through a cached browser-side dataset loader before live snapshot wiring begins
- add pure runtime helpers for chunk-range selection, approximate UTC-to-TDB conversion, and velocity-backed Hermite interpolation before attaching them to the async provider
- keep the first async provider focused on loading and caching raw ephemeris snapshots plus adjacent chunk prefetch, with physical scaling deferred to the later integration step
- add a uniform-scale mapping layer that turns raw barycentric ephemeris snapshots plus kernel-derived mean radii into physically scaled scene state, including proportionate focus framing, before swapping scene consumers to the async path
- compose the async provider and the physical-scale adapter into the same resolved catalog shape the mocked scene already consumes before replacing scene and HUD wiring
- route scene, HUD, and focus consumers through a runtime catalog hook that can expose loading and fallback states while the app still defaults to the mocked source
- keep real web-data activation behind explicit runtime configuration until hosted assets and the first physical scale factor are ready for inspection
- add chunk selection, prefetch, cache eviction, loading, and error states

### 5. Time and trail UX

- start the simulation clock at the current real-world datetime and advance it in real time before adding pause or rate controls
- start the simulation at the current real-world datetime
- advance the simulation in real time by default
- support pause, resume, rate changes, and backward playback in the first release
- defer explicit date picking to a later milestone unless the first UX pass shows it is essential
- add visible loading feedback when chunk fetches block a requested time change
- replace circular trails with sampled trail geometry derived from the loaded chunk data
- support body-specific default trail windows while keeping the visible UI minimal in Milestone 5
- reuse kernel-derived physical metadata where it improves labels, derived defaults, or later educational UI without coupling it to the cinematic render scale

### 6. Verification and closeout

- add unit coverage for manifest parsing, chunk selection, interpolation, and provider caching
- add browser coverage for startup, scrubbing, and focused-body recovery while chunks are loading
- perform manual desktop and mobile validation with network throttling and slower CPU settings
- update roadmap, vision, architecture, and deployment docs once the implementation lands

## Acceptance Notes

- Opening the site should not require downloading the full supported ephemeris range.
- The initial overview should stay responsive while the first real-data chunk loads.
- Scrubbing within the current chunk should not trigger heavy recomputation.
- Crossing a chunk boundary should rely on prefetch or a short explicit loading state rather than a long stall.
- The first release should start from the user's current datetime and advance in real time unless paused or rate-adjusted.
- Real-data integration should not force Milestone 6 frame-selection work into this milestone.
- Physical metadata from kernels should be available to the app without replacing the current cinematic presentation tuning.

## Open Questions

- What final production chunk duration falls out of the accepted `de440s` 1950 through 2050 benchmark once Moon and inner-planet cadence are factored in?
- What global km-to-scene scale factor keeps the physically scaled first pass inspectable without quietly reintroducing a cinematic distortion?
- Which additional kernel-derived fields are realistically available from the chosen kernel set without introducing brittle parsing work?
- What local cache path and cleanup policy should the repo standardize for downloaded kernels during development?
