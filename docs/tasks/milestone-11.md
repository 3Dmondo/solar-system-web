# Milestone 11: Full Solar System Explorer

Status: In Progress

## Start Point

Milestone 11 starts after the Milestone 10 trail-rendering scope closed. Deferred rendering audit and validation work is tracked separately in `docs/tasks/optional-rendering-audit-and-validation.md` and does not block the major-moon catalog path.

## Progress So Far

- Added a central current-body registry in `src/features/solar-system/domain/body.ts`.
- The registry now drives the current `BodyId` union, NAIF id lookups, parent hierarchy, presentation metadata, and HUD jump-menu grouping.
- HUD jump-menu membership now lives on registry entries instead of in a separate hard-coded body list.
- Registry entries now carry body category and system-group metadata, with derived current system groups ready for dynamic discovery UI.
- The HUD now uses a registry-driven discovery-group helper that keeps quick picks first and fills remaining loaded bodies from system groups.
- Scene star handling, indicator exclusion, textured star material behavior, and satellite tidal-lock targeting now use registry category and hierarchy helpers instead of literal Sun or Moon checks.
- Extended the registry with the curated major-moon target set, grouped by parent system, with conservative presentation metadata and a shared lit solid material path for bodies without texture assets.
- The web catalog source now scales presentation metadata only for bodies present in the loaded generated-data manifest, so the current baseline profile remains compatible while the expanded registry is staged.
- Reference-frame options now derive from loaded satellite systems, preserving the current SSB and Earth-centered baseline while allowing expanded catalogs to expose loaded parent-centered frames.
- Schema-1 metadata parsing now tolerates partial or unavailable generated physical metadata for staged bodies, while preserving full physical radius and rotation mapping for bodies that still have complete metadata.
- The remaining runtime hard-coded behavior needed for the larger catalog is registry-driven in this phase; Earth prime-meridian spin initialization now comes from presentation metadata instead of a renderer body-id literal.
- Added a sibling `SpiceNet` generation script for the `expanded-major-moons` profile that keeps the existing baseline profile unchanged and records the selected SPKs, expanded body ids, parent ids, and starter cadence defaults in one profile entry point.
- Recorded initial SSD catalog-backed kernel shortlist and download-size tradeoffs from the local `SpiceNet` snapshot.
- Ran the first `Spice.SsdCatalog` kernel inspection and fallback pass and recorded `C:\Dev\repos\3Dmondo\SpiceNet\docs\SsdCatalog\kernel_inspection.json`.
- Confirmed the inspected compact and sub-500 MB fallback satellite candidates are not enough for the full `1950-2050` major-moon target window.
- Ran the first `expanded-major-moons` configured-cadence benchmark from the local SSD cache and recorded generated web-output size plus interpolation error at `C:\Dev\repos\3Dmondo\SpiceNet\artifacts\web-data\expanded-major-moons\configured-cadence-benchmark.json`.
- The first expanded benchmark is not adoption-ready: output size looks plausible for inspection, but integer-day starter cadences undersample several fast inner moons.
- Expanded-profile generated assets will not be versioned from the first benchmark output; the reduced preview must be regenerated without fast moons and then clear visual-error and browser budget gates before any versioning or default-adoption decision.
- The next Milestone 11 slice will temporarily remove the fast undersampled moons from the expanded preview and keep only slower major moons that are plausible with integer-day cadence. Sub-day support for the removed moons is deferred to Milestone 13.
- Added a follow-up benchmark and browser validation plan so the next pass measures visual impact, chunk transitions, data format tradeoffs, and browser memory instead of relying only on kilometer error totals.
- Existing schema-1 generated-data parsing remains the web runtime contract for this step; schema 2 is not needed until generated data must carry runtime-required fields that the registry cannot already supply.
- Added an opt-in Phase 3 preview path: `VITE_WEB_EPHEMERIS_PROFILE=expanded-major-moons` points at ignored local assets staged by `scripts/Stage-ExpandedMajorMoonsPreview.ps1`, while the default app remains on the baseline generated profile.
- Ran the reduced `expanded-major-moons` configured-cadence benchmark without the Milestone 13 fast-moon set and staged the ignored local preview assets for browser inspection.
- The reduced preview is smaller and no longer has the known fast-moon hundred-thousand-kilometer errors; Phase 2B local data and runtime validation is closed for Phase 3 handoff, while UX work moves to Phase 3 and data optimization moves to the optional post-deploy follow-up.
- Added `scripts/Measure-ReducedMajorMoonPreview.ps1` as a repeatable retained-moon spot-check diagnostic that combines the SpiceNet truth report with staged preview orbit scale.
- Manual visual inspection of the retained reduced-preview moons passed: positions and orbiting animations looked acceptable, including the diagnostic-flagged Umbriel, Titania, and Rhea.
- Ran the reduced-profile chunk-duration size benchmark for `25`, `10`, `5`, and `1` year chunks; browser parse time, request behavior, and cache churn are postponed to optional post-deploy optimization.
- Tuned runtime chunk prefetch and cache budgeting so reduced-profile previews can keep the active chunk, next chunk, and loaded-catalog trail-history chunks ready without relying on the old fixed two-previous-chunk assumption.
- Added debug-only browser timing hooks for manifest load, metadata load, chunk JSON load, chunk parse, and JS heap display so the user-run reduced preview can record startup, prefetch, boundary, and memory observations without adopting generated assets.
- The expanded preview staging helper now defaults to the reduced `SpiceNet` output and refuses to stage the Milestone 13 fast-moon ids unless explicitly overridden for future sub-day validation.
- Added provider-level coverage that verifies satellite trails are sampled relative to their parent body by default, which covers the retained reduced-preview moons through the registry hierarchy.
- Phase 2B is closed for local reduced-preview adoption into Phase 3: local debug performance looked acceptable, retained-moon visual checks passed, and chunk-size or file-format optimization is deferred to `docs/tasks/optional-expanded-data-optimization-after-deploy.md` after the Phase 3 GitHub Pages deployment.

## Goal

Broaden the solar-system catalog into a fuller explorer, starting with a curated major natural satellite expansion. Educational context and richer exploration modes are included as lower-priority proposals for review, not blockers for the first catalog-expansion pass.

## Scope

- Start with recognizable major natural satellites, not every file in the JPL SSD catalog.
- Use `C:\Dev\repos\3Dmondo\SpiceNet\docs\SsdCatalog\ssd_catalog.json` to choose candidate kernels and compare download-size tradeoffs.
- Benchmark generated web output before making the expanded body set the default deployed dataset.
- Keep the existing Sun, planets, and Moon behavior stable while expanding the catalog.
- Keep upstream kernels out of git.
- Do not version the first expanded generated manifest and chunk assets yet; revisit only after the reduced generated dataset clears accuracy and browser budget gates.
- Postpone chunk-size and file-format optimization until after the reduced Phase 3 deployment is measured on GitHub Pages.

## Body Catalog Target

Original curated expansion:

- Mars: Phobos `401`, Deimos `402`
- Jupiter: Io `501`, Europa `502`, Ganymede `503`, Callisto `504`
- Saturn: Mimas `601`, Enceladus `602`, Tethys `603`, Dione `604`, Rhea `605`, Titan `606`, Iapetus `608`
- Uranus: Ariel `701`, Umbriel `702`, Titania `703`, Oberon `704`, Miranda `705`
- Neptune: Triton `801`

Temporary Milestone 11 reduced preview target:

- Jupiter: Ganymede `503`, Callisto `504`
- Saturn: Rhea `605`, Titan `606`, Iapetus `608`
- Uranus: Umbriel `702`, Titania `703`, Oberon `704`
- Neptune: Triton `801`

Deferred to Milestone 13 for sub-day sampling:

- Mars: Phobos `401`, Deimos `402`
- Jupiter: Io `501`, Europa `502`
- Saturn: Mimas `601`, Enceladus `602`, Tethys `603`, Dione `604`
- Uranus: Ariel `701`, Miranda `705`

Deferred until the major-moon path is validated:

- Pluto and Charon
- asteroid packs
- spacecraft trajectories
- long-tail minor moons

## Checklist

### Phase 1: Catalog And Registry Design

- [x] Create a central body registry for the current body set that drives `BodyId`, NAIF mappings, body hierarchy, display names, colors, default trail windows, and jump-menu grouping.
- [x] Derive current jump-menu groups from registry metadata instead of a separate component-local body list.
- [x] Add registry-driven body category and system-group metadata for the current body set.
- [x] Add a registry-driven discovery-group helper for loaded body ids.
- [x] Extend the central registry with the curated major-moon body set after expanded kernel coverage is chosen.
- [x] Replace hard-coded body assumptions in the web app with registry lookups where the larger catalog needs dynamic behavior.
- [x] Preserve schema-1 ephemeris parsing for the current generated dataset.
- [x] Decide schema-2 parsing is not needed for this phase because parent body ids, body categories, display grouping, and staged presentation behavior are already registry-driven.

### Phase 2: SpiceNet Expanded Profile

- [x] Add a new `SpiceNet` generation profile named `expanded-major-moons` without changing the existing `baseline-de440s-ssb-25y-mixed-cadence` profile in place.
- [x] Extend `Spice.WebDataGenerator` to accept repeated SPK inputs so planets and satellite systems can come from separate SSD catalog entries.
- [x] Add known body names, parent ids, and cadence defaults for the expanded body set.
- [x] Make metadata export tolerate partial metadata for bodies whose radii, GM, pole, or rotation fields are unavailable from current generic kernels.
- [x] Preserve complete metadata output for the existing Sun, planets, and Moon.
- [x] Record initial SSD catalog-backed candidate kernel sizes before coverage and output benchmarking.
- [x] Benchmark expanded output size, largest chunk gzip size, and interpolation error before web runtime adoption.
- [x] Decide not to version the first expanded-profile manifest and chunks yet; real file sizes are plausible for inspection, but the current cadence benchmark fails fast-moon accuracy gates.

### Phase 2B: Reduced Expanded Benchmark And UX Validation

Status: Closed for Phase 3 handoff. The remaining optimization questions are postponed to `docs/tasks/optional-expanded-data-optimization-after-deploy.md`, and the remaining UX issues now belong to Phase 3.

- [x] Regenerate the expanded preview dataset without the Milestone 13 fast-moon set: Phobos, Deimos, Io, Europa, Mimas, Enceladus, Tethys, Dione, Ariel, and Miranda.
- [x] Record the reduced generated output size, largest chunk gzip size, chunk count, body count, and interpolation error before any web runtime adoption.
- [x] Normalize reduced-profile interpolation error by local orbit scale and likely focused-view screen displacement instead of judging kilometer error alone.
- [x] Build a lightweight truth-comparison or spot-check diagnostic for selected retained moons if reduced-profile interpolation error remains suspicious.
- [x] Inspect retained moons in actual focused local-system views at normal playback speeds, fast playback, and paused trail inspection.
- [x] Record generator-side chunk-duration size data for `25`, `10`, `5`, and `1` year chunks; browser parse-time and cache-churn optimization is deferred to the optional post-deploy task.
- [x] Test chunk-boundary playback locally with debug timings; final confidence moves to the deployed Phase 3 GitHub Pages pass.
- [x] Tune next and previous chunk preloading for current forward playback so the runtime warms the active chunk, next chunk, and loaded-catalog trail-history previous chunks.
- [x] Defer direction-aware reverse prefetch until reverse or future reverse playback is introduced.
- [x] Define a browser chunk-cache budget that covers the active chunk plus adjacent chunks and trail history without unbounded RAM growth.
- [x] Defer compact JSON plus gzip versus binary numeric-array format comparison to the optional post-deploy optimization task.
- [x] Defer Float64, Float32, quantized, or delta-encoded representation testing to the optional post-deploy optimization task.
- [x] Measure local browser memory and runtime metrics well enough to proceed to Phase 3; repeat final measurements after the GitHub Pages deployment.
- [x] Move reduced expanded-catalog UX fixes to Phase 3.
- [x] Decide Phase 2B gates: proceed to Phase 3 with the reduced profile, keep generated preview assets ignored until deployment adoption, and postpone data optimization until deployed measurements justify it.

Initial SSD catalog source:

- File: `C:\Dev\repos\3Dmondo\SpiceNet\docs\SsdCatalog\ssd_catalog.json`
- Generated UTC: `2025-10-12T16:45:10.1468538Z`
- File count: 193
- Root: `https://ssd.jpl.nasa.gov/ftp/eph/`

Initial SSD catalog kernel candidates to evaluate before profile adoption:

- planets: keep `planets/bsp/de440s.bsp` (`31.2M`) unless expanded coverage requires another planet kernel; `de440s_plus_MarsPC.bsp` is `66.2M` and should be checked only if Mars satellite coverage or provenance needs it.
- Jupiter system: first evaluate compact candidates `jup345.bsp` (`43.1M`), `jup380s.bsp` (`51.6M`), and `jup346.bsp` (`53.9M`); keep `jup344.bsp` (`289.4M`) as a newer but larger fallback if compact coverage fails.
- Saturn system: first evaluate `sat428.bsp` (`40.4M`), then `sat450.bsp` (`61.9M`) or `sat456.bsp` (`67.1M`) if newer coverage is needed; `sat143.bsp` (`137.0M`) is a larger fallback.
- Uranus system: first evaluate `ura117.bsp` (`19.4M`), then `ura116.bsp` (`53.6M`) or `ura112.bsp` (`104.2M`) if coverage or accuracy is insufficient.
- Neptune system: first evaluate `nep100.bsp` (`9.4M`), then `nep105.bsp` (`156.1M`) or `nep102.bsp` (`195.1M`) if Triton coverage or interpolation behavior requires a larger kernel.
- Mars satellites: no compact satellite kernel is obvious from the snapshot; `mar097.bsp` is `439.2M` and `mar099.bsp` is `1.10G`, so Mars moon support needs coverage checks before accepting the size cost.

Coverage and benchmark notes:

- Do not infer body coverage from filenames alone; verify with `SpiceNet` before adding any candidate to the expanded profile.
- Current inspection report: `C:\Dev\repos\3Dmondo\SpiceNet\docs\SsdCatalog\kernel_inspection.json`, generated `2026-04-30T17:58:26.4233125Z`.
- Current pass inspected `55` kernels and recorded `5` skipped kernels; skipped oversized small-body packs include `ast343de430`, `sb441-n16`, `sb441-n373`, and `sb441-n373s`.
- Selected proven source kernels for the full `1950-2050` target window: `de440s.bsp` for the existing planet source ids, `mar097.bsp` for Phobos `401` and Deimos `402`, `jup365.bsp` for Io `501`, Europa `502`, Ganymede `503`, and Callisto `504`, `sat427l.bsp` for Saturn major moons `601-606` and `608`, `ura111.bsp` for Ariel `701`, Umbriel `702`, Titania `703`, Oberon `704`, and Miranda `705`, and `Triton.nep097.30kyr.bsp` for Triton `801`.
- The selected upstream/cache source size is about `4.63 GB`: `de440s` `31.2M`, `mar097` `439.2M`, `jup365` `1.03G`, `sat427l` `609.0M`, `ura111` `153.4M`, and `Triton.nep097.30kyr` `2.40G`.
- The common selected-kernel coverage is approximately `1900-01-03T23:58:55Z` through `2100-01-02T23:58:55Z`. With the current year-boundary generator CLI, the widest conservative whole-year expanded range is `--start-year 1901 --end-year 2100`, effectively covering years `1901-2099`.
- Smaller inspected candidates were rejected because they either did not include the target ids or did not cover the full window: Jupiter compact candidates top out at `jup380s` with only roughly `2015-2030` Galilean coverage; `sat143.bsp` includes the requested Saturn moons but stops around `2019`; inspected Neptune kernels through `nep105.bsp` do not cover Triton `801`.
- Compare total source download size separately from generated web output size because the upstream SPKs stay out of git and are not shipped directly.
- Do not version the current expanded-profile `manifest.json` plus chunk files yet. The first measured size is plausible for inspection, but the current integer-day cadence profile fails fast-moon accuracy gates. Revisit versioning only after a reduced profile reports acceptable visual error, largest-chunk gzip size, startup latency, chunk-transition behavior, and memory budget.
- Benchmark generated output size and interpolation error for the reduced candidate set before making the expanded profile the default deployed dataset.

First expanded configured-cadence benchmark:

- Command source: `C:\Dev\repos\3Dmondo\SpiceNet\scripts\Generate-WebDataExpandedMajorMoonsDataset.ps1 -BenchmarkConfiguredCadence`
- Cache root: `C:\Dev\repos\3Dmondo\SpiceNet\artifacts\kernel-cache\ssd`
- Report: `C:\Dev\repos\3Dmondo\SpiceNet\artifacts\web-data\expanded-major-moons\configured-cadence-benchmark.json`
- Generated output: `144,076,540` bytes raw, `68,978,203` bytes gzip, across `8` chunks.
- Largest chunk: `chunk-2051-2076.json`, `18,148,950` bytes raw, `8,679,876` bytes gzip.
- The current output size is plausible for local inspection but should not be adopted yet because interpolation errors are too high for fast moons at the current integer-day cadence floor.
- Worst max position errors in the first pass: Mimas `428,874 km`, Enceladus `192,527 km`, Io `143,310 km`, Miranda `94,262 km`, Tethys `78,103 km`, Phobos `37,518 km`, Dione `25,358 km`, Deimos `24,371 km`, Ariel `17,529 km`, Europa `17,372 km`.
- Next Milestone 11 profile work should remove those fast undersampled moons from the generated preview dataset so the remaining catalog can be inspected without known-bad local moon motion. Milestone 13 owns sub-day profiling, fast-moon tuning, truth diagnostics for those bodies, and their reintroduction.

Reduced expanded configured-cadence benchmark:

- Command source: direct `dotnet run --project C:\Dev\repos\3Dmondo\SpiceNet\Spice.WebDataGenerator\Spice.WebDataGenerator.csproj` configured-cadence run with the reduced body list and cached retained-system kernels: `de440s.bsp`, `jup365.bsp`, `sat427l.bsp`, `ura111.bsp`, and `Triton.nep097.30kyr.bsp`.
- Report: `C:\Dev\repos\3Dmondo\SpiceNet\artifacts\web-data\expanded-major-moons-reduced\configured-cadence-benchmark.json`
- Staged preview: `public/ephemeris/generated-expanded-major-moons/` from `scripts/Stage-ExpandedMajorMoonsPreview.ps1`, which now defaults to `..\SpiceNet\artifacts\web-data\expanded-major-moons-reduced`
- Generated output: `61,505,612` bytes raw, `29,410,904` bytes gzip, across `8` chunks and `19` bodies.
- Largest generated chunk from the report: `chunk-1951-1976.json`, `7,753,817` bytes raw, `3,701,650` bytes gzip.
- Local gzip recompression of the staged preview measured the same raw total and `29,608,359` bytes gzip total, with `chunk-1951-1976.json` largest at `3,728,872` gzip bytes.
- Retained moon worst max position errors: Rhea `5,017 km`, Titania `4,867 km`, Umbriel `3,654 km`, Ganymede `1,676 km`, Callisto `1,657 km`, Titan `1,519 km`, Triton `1,184 km`, Oberon `1,164 km`, Iapetus `118 km`.
- Local-orbit normalization from the staged `chunk-2001-2026.json`, using parent-relative mean distance and a `300 px` focused-orbit-radius proxy: Umbriel `1.363%` / `4.1 px`, Titania `1.111%` / `3.3 px`, Rhea `0.946%` / `2.8 px`, Triton `0.333%` / `1.0 px`, Oberon `0.199%` / `0.6 px`, Ganymede `0.155%` / `0.5 px`, Titan `0.124%` / `0.4 px`, Callisto `0.088%` / `0.3 px`, Iapetus `0.003%` / `<0.1 px`.
- Repeatable diagnostic: `scripts/Measure-ReducedMajorMoonPreview.ps1` reads the reduced benchmark report plus the staged preview chunk and uses Hermite interpolation for parent positions when normalizing moon error by local orbit scale. With default thresholds of `0.5%` orbit error or `2 px` at a `300 px` focused-orbit proxy, it flags Umbriel, Titania, and Rhea for manual visual spot-checking.
- Manual focused-view inspection passed for all retained reduced-preview moons. The diagnostic-flagged moons did not show unacceptable position or orbit-animation artifacts, so the current thresholds should be treated as conservative review triggers rather than automatic rejection gates.
- This reduced benchmark clears the first known-bad fast-moon blocker and is ready for Phase 3 UI and deployment validation. Chunk-size and file-format optimization is postponed until after deployed measurements exist.

Reduced expanded chunk-duration size benchmark:

- Command source: direct `dotnet run --project C:\Dev\repos\3Dmondo\SpiceNet\Spice.WebDataGenerator\Spice.WebDataGenerator.csproj` configured-chunk-year run with the reduced body list and cached retained-system kernels.
- Report: `C:\Dev\repos\3Dmondo\SpiceNet\artifacts\web-data\expanded-major-moons-reduced-chunk-years\configured-chunk-year-benchmark.json`
- `25` year chunks: `8` chunks, `61,505,612` bytes raw, `29,410,904` bytes gzip, largest chunk `3,701,650` bytes gzip.
- `10` year chunks: `20` chunks, `61,544,167` bytes raw, `29,449,927` bytes gzip, largest chunk `1,484,610` bytes gzip.
- `5` year chunks: `40` chunks, `61,606,997` bytes raw, `29,506,707` bytes gzip, largest chunk `744,507` bytes gzip.
- `1` year chunks: `199` chunks, `62,280,991` bytes raw, `29,954,948` bytes gzip, largest chunk `151,523` bytes gzip.
- Size-only read: smaller chunks drastically reduce largest-chunk transfer and parse risk, while total gzip grows modestly; `1` year chunks add about `544 KB` gzip over `25` year chunks but multiply request count by about `25x`. Runtime chunk-size optimization is postponed until after the Phase 3 GitHub Pages deployment is measured.

Runtime chunk prefetch and cache budget:

- `prefetchAroundUtc` now warms every ready previous chunk required by the loaded catalog's maximum trail window, plus the active chunk and next chunk.
- The default chunk-cache budget is dynamic: it keeps at least `6` chunks, and expands to `ceil(maxLoadedTrailWindowDays / representativeChunkDurationDays) + 2` so smaller chunk-year profiles can hold trail history, active chunk, and next chunk.
- Explicit `maxCachedChunks` test or caller overrides still cap the cache, preserving the LRU behavior used for low-budget scenarios.
- The reduced `1` year chunk profile would budget roughly `27` chunks by default for `25` years of loaded trail history plus active and next chunks, avoiding unbounded growth while keeping long trails warm.
- Reverse-direction prefetch remains a planned follow-up because the current simulation clock does not yet expose reverse playback direction to the catalog source.

Reduced preview staging guard:

- `scripts/Stage-ExpandedMajorMoonsPreview.ps1` now defaults to `..\SpiceNet\artifacts\web-data\expanded-major-moons-reduced`.
- The script rejects staged manifests containing Milestone 13 fast-moon ids `401`, `402`, `501`, `502`, `601`, `602`, `603`, `604`, `701`, or `705` unless `-AllowMilestone13FastMoons` is passed.
- This preserves the long-term registry entries while keeping Milestone 11 discovery groups, indicators, labels, focus targets, and adoption checks limited to the loaded reduced manifest.

Reduced preview browser validation protocol:

- User-run preview command: run `.\scripts\Stage-ExpandedMajorMoonsPreview.ps1`, set `VITE_WEB_EPHEMERIS_PROFILE=expanded-major-moons`, then run the dev server; if using `pnpm preview`, set the env before `pnpm build` because Vite embeds `import.meta.env` at build time.
- Keep `public/ephemeris/generated-expanded-major-moons/*.json` ignored unless adoption gates pass; browser validation should record observations, not version generated preview assets.
- Use `/debug` for timing and heap sampling. The overlay reports FPS, JS heap when the browser exposes `performance.memory`, and average/max timing windows for manifest load, metadata load, chunk JSON load, chunk parse, catalog refresh, trail generation, scene-space mapping, and scene update.
- Use browser DevTools Network alongside the overlay to record per-resource transfer details for `manifest.json`, `body-metadata.json`, the first active chunk, and adjacent chunk prefetches. Do one cold reload with cache disabled and one warm reload with cache enabled.
- Startup timing pass: open `/debug` and record manifest, metadata, first chunk, adjacent prefetch, first ready scene, FPS, and JS heap. With the current debug default timestamp, the active expanded chunk should be `chunk-2026-2051.json`.
- Previous-boundary playback pass: open `/debug?startAt=2000-12-31T11:59:30Z`, cross the `2001-01-01T12:00:00Z` boundary at `1x`, then repeat at `1m/s` and `1h/s` from nearby start times if the transition is too slow or too fast to inspect.
- Next-boundary playback pass: open `/debug?startAt=2025-12-31T11:59:30Z`, cross the `2026-01-01T12:00:00Z` boundary at `1x`, then repeat at `1m/s` and `1h/s`.
- Memory observation points: after initial ready scene, after first retained-moon focus, after opening Jupiter, Saturn, Uranus, and Neptune systems through the jump menu, after each chunk-boundary crossing, and after several minutes of playback.
- UX observation points: jump menu fit on desktop and coarse-pointer layouts, labels and indicators in crowded moon systems, direct picking, focus transitions, parent-relative trails, trail continuity across boundaries, and recovery to overview.

Expanded benchmark problem list:

- Kilometer error is not directly a user-experience metric. The next reduced-profile benchmark must translate error into local orbit fraction and screen-space displacement for typical overview and focused camera distances.
- A large gzip total can still be acceptable if startup only needs the manifest plus one chunk, but largest chunk size, parse time, and adjacent prefetch cost are the user-facing constraints.
- Smaller chunks may improve transition loading and RAM pressure but increase request count, manifest size, and edge-case frequency at chunk boundaries; this is now optional post-deploy optimization work.
- Browser memory must include decoded numeric arrays, parsed JSON objects before compaction or garbage collection, trail caches, generated trail geometry, metadata, textures, and Three.js scene objects.
- Protobuf is not automatically better for large numeric arrays. A custom binary layout with typed arrays may be smaller and faster, but only after deployed measurements justify precision and implementation-cost checks.
- Chunk transitions need explicit validation because interpolation, trail stitching, and focused-body tracking can expose discontinuities even when raw samples are accurate.
- Expanded major-moon UX may need local-system scale/readability controls even if the data format and cadence pass.

### Phase 3: Web Runtime Integration

Status: Next. Phase 3 should prioritize the reduced major-moon deployment path plus UI/readability fixes surfaced by local screenshots such as `.tmp/expanded-mobile-startup.png` and `.tmp/expanded-desktop-next-boundary-1h.png`.

- [x] Add an opt-in local preview path that consumes the expanded generated profile through the existing static asset flow without making it the deployed default.
- [x] Consume the reduced Milestone 11 preview dataset that excludes fast undersampled moons until Milestone 13 sub-day cadence support exists.
- [x] Remove temporarily deferred fast moons from Milestone 11 discovery groups, indicators, labels, focus targets, and generated preview adoption checks without deleting the long-term registry plan.
- [ ] Deploy the reduced expanded generated profile through GitHub Pages after Phase 3 UI gates pass, then repeat debug timing and memory observations on the deployed site.
- [x] Add presentation metadata for the curated major moons with conservative default trail windows and shared material behavior.
- [x] Keep parent-relative trails for all satellites through the existing hierarchy behavior.
- [ ] Suppress satellite indicators and labels when the camera is far enough that they overlap their parent planet or clutter the global overview, while keeping them visible in near-parent and focused local-system views.
- [ ] Add a satellite visibility layer toggle so retained moons, their indicators, and their labels can be enabled or disabled independently from planets and existing labels.
- [ ] Prevent the reference-frame selector and layer selector from overlapping on mobile; stack or dock them predictably with touch-sized targets.
- [ ] Keep the deployed app compatible with static GitHub Pages hosting.
- [ ] Recheck local and deployed `/debug` overlays after UI changes so debug panels do not hide critical mobile controls during validation.

### Phase 4: Discovery UI

- [x] Replace the fixed `Jump to` groups with registry-driven quick-pick and system groups for the current loaded catalog.
- [ ] Redesign desktop `Jump to` for the expanded catalog without the current Quick picks section; prefer compact parent-system grouping and reduce button density.
- [ ] Redesign mobile `Jump to` as a usable coarse-pointer surface, likely a scrollable sheet with clear parent-system sections and less overlap with the HUD/debug overlay.
- [ ] Verify direct body picking, labels, indicators, and jump-menu focus all work for major moons.
- [ ] Consider a focused-system affordance that exposes a parent planet plus its retained moons without forcing users through the full global list.

### Phase 5: Lower-Priority Educational Context Proposal

- [ ] Add a focused-body facts drawer backed by generated physical metadata plus small authored copy.
- [ ] Show radius, parent body, orbital role, gravity or density when available, and source or provenance in concise language.
- [ ] Keep the first pass read-only and lightweight.
- [ ] Defer quizzes, tours, and long-form encyclopedia pages.

### Phase 6: Lower-Priority Richer Exploration Proposal

- [ ] Add dynamic system views for loaded parent bodies with satellites, starting with Jupiter and Saturn.
- [x] Let the reference-frame selector offer relevant loaded body-centered frames instead of only SSB and Earth.
- [ ] Add a local-system focus mode that makes moons, local trails, and parent-relative motion easier to inspect without changing the global overview default.

### Phase 7: Docs And Closeout

- [ ] Update `docs/architecture.md` after the registry, generated-data contract, runtime behavior, or UI model changes.
- [ ] Update `docs/roadmap.md` when Milestone 11 moves from planned to in progress or when delivered scope changes.
- [ ] Document any deferred body categories or exploration features explicitly.

## Verification

1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`
4. SpiceNet generator unit tests
5. SpiceNet metadata export tests
6. SpiceNet repeated-SPK generation smoke test
7. SpiceNet configured-cadence benchmark for the reduced expanded body set
8. Manual visual checks:
   - default overview remains readable on desktop and mobile
   - existing Sun, planets, and Moon behavior is unchanged
   - retained major moons appear, can be focused, and have parent-relative trails
   - jump menu remains usable with the larger catalog
   - expanded generated assets stay acceptable for static GitHub Pages delivery

## Locked Decisions

- Milestone 11 starts after Milestone 10 trail-rendering closeout.
- The first catalog expansion prioritizes recognizable major moons over completeness.
- The Milestone 11 preview may temporarily ship a reduced major-moon subset to avoid known-bad fast moon interpolation.
- Fast undersampled moons are deferred to Milestone 13 rather than forced into Milestone 11 with one-day cadence.
- The existing baseline generated-data profile remains available while the expanded profile is benchmarked.
- Educational context and richer exploration are lower-priority proposals for review, not blockers for the first catalog-expansion pass.
- Upstream kernels remain non-versioned.
- The first expanded-profile generated manifest and chunks will not be versioned yet because the measured output came from a cadence profile that failed fast-moon accuracy gates.
- Milestone 11 no longer owns sub-day profiling, fast-moon tuning, or fast-moon reintroduction; that work belongs to Milestone 13.
