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
- The reduced preview is smaller and no longer has the known fast-moon hundred-thousand-kilometer errors, but browser UX, chunk-duration, chunk-boundary, memory, and data-format gates remain open before adoption.
- Added `scripts/Measure-ReducedMajorMoonPreview.ps1` as a repeatable retained-moon spot-check diagnostic that combines the SpiceNet truth report with staged preview orbit scale.

## Goal

Broaden the solar-system catalog into a fuller explorer, starting with a curated major natural satellite expansion. Educational context and richer exploration modes are included as lower-priority proposals for review, not blockers for the first catalog-expansion pass.

## Scope

- Start with recognizable major natural satellites, not every file in the JPL SSD catalog.
- Use `C:\Dev\repos\3Dmondo\SpiceNet\docs\SsdCatalog\ssd_catalog.json` to choose candidate kernels and compare download-size tradeoffs.
- Benchmark generated web output before making the expanded body set the default deployed dataset.
- Keep the existing Sun, planets, and Moon behavior stable while expanding the catalog.
- Keep upstream kernels out of git.
- Do not version the first expanded generated manifest and chunk assets yet; revisit only after the reduced generated dataset clears accuracy and browser budget gates.

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

- [x] Regenerate the expanded preview dataset without the Milestone 13 fast-moon set: Phobos, Deimos, Io, Europa, Mimas, Enceladus, Tethys, Dione, Ariel, and Miranda.
- [x] Record the reduced generated output size, largest chunk gzip size, chunk count, body count, and interpolation error before any web runtime adoption.
- [x] Normalize reduced-profile interpolation error by local orbit scale and likely focused-view screen displacement instead of judging kilometer error alone.
- [x] Build a lightweight truth-comparison or spot-check diagnostic for selected retained moons if reduced-profile interpolation error remains suspicious.
- [ ] Inspect retained moons in actual focused local-system views at normal playback speeds, fast playback, and paused trail inspection.
- [ ] Benchmark chunk durations separately from cadence: start with `25`, `10`, `5`, and `1` year chunks and record total gzip size, largest chunk gzip size, request count, parse time, and cache churn.
- [ ] Test chunk-boundary playback by driving simulation time across previous and next chunk boundaries at slow, normal, and high playback rates.
- [ ] Add or tune next and previous chunk preloading when simulation time approaches a chunk boundary, including direction-aware prefetch for reverse or future reverse playback.
- [ ] Define a browser chunk-cache budget that covers the active chunk plus adjacent chunks and trail history without unbounded RAM growth.
- [ ] Compare the current compact JSON plus gzip format against at least one binary numeric-array format before considering protobuf; include transfer size, decode time, parse allocations, implementation complexity, and numeric precision.
- [ ] Test Float64, Float32, and any proposed quantized or delta-encoded representation against visual error and interpolation error before changing the runtime format.
- [ ] Measure browser memory on desktop and mobile with the reduced expanded dataset: initial load, after first focus, after opening retained moon systems, after crossing chunk boundaries, and after several minutes of playback.
- [ ] Track runtime metrics for manifest load, metadata load, first chunk load, adjacent chunk prefetch, catalog refresh, trail resampling, frame time, and JS heap use where browser APIs permit.
- [ ] Validate reduced expanded-catalog UX on desktop and coarse-pointer layouts: jump menu size, labels, indicators, picking, focus transitions, local-system readability, trail readability, and recovery to overview.
- [ ] Decide adoption gates before enabling the reduced expanded profile by default, including acceptable visual error, largest chunk gzip size, startup latency, chunk-transition smoothness, and memory budget.

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
- Staged preview: `public/ephemeris/generated-expanded-major-moons/` from `scripts/Stage-ExpandedMajorMoonsPreview.ps1 -SpiceNetOutputRoot ..\SpiceNet\artifacts\web-data\expanded-major-moons-reduced`
- Generated output: `61,505,612` bytes raw, `29,410,904` bytes gzip, across `8` chunks and `19` bodies.
- Largest generated chunk from the report: `chunk-1951-1976.json`, `7,753,817` bytes raw, `3,701,650` bytes gzip.
- Local gzip recompression of the staged preview measured the same raw total and `29,608,359` bytes gzip total, with `chunk-1951-1976.json` largest at `3,728,872` gzip bytes.
- Retained moon worst max position errors: Rhea `5,017 km`, Titania `4,867 km`, Umbriel `3,654 km`, Ganymede `1,676 km`, Callisto `1,657 km`, Titan `1,519 km`, Triton `1,184 km`, Oberon `1,164 km`, Iapetus `118 km`.
- Local-orbit normalization from the staged `chunk-2001-2026.json`, using parent-relative mean distance and a `300 px` focused-orbit-radius proxy: Umbriel `1.363%` / `4.1 px`, Titania `1.111%` / `3.3 px`, Rhea `0.946%` / `2.8 px`, Triton `0.333%` / `1.0 px`, Oberon `0.199%` / `0.6 px`, Ganymede `0.155%` / `0.5 px`, Titan `0.124%` / `0.4 px`, Callisto `0.088%` / `0.3 px`, Iapetus `0.003%` / `<0.1 px`.
- Repeatable diagnostic: `scripts/Measure-ReducedMajorMoonPreview.ps1` reads the reduced benchmark report plus the staged preview chunk and uses Hermite interpolation for parent positions when normalizing moon error by local orbit scale. With default thresholds of `0.5%` orbit error or `2 px` at a `300 px` focused-orbit proxy, it flags Umbriel, Titania, and Rhea for manual visual spot-checking.
- This reduced benchmark clears the first known-bad fast-moon blocker for inspection only. It is not adoption-ready until the remaining browser, chunking, memory, and format gates pass.

Expanded benchmark problem list:

- Kilometer error is not directly a user-experience metric. The next reduced-profile benchmark must translate error into local orbit fraction and screen-space displacement for typical overview and focused camera distances.
- A large gzip total can still be acceptable if startup only needs the manifest plus one chunk, but largest chunk size, parse time, and adjacent prefetch cost are the user-facing constraints.
- Smaller chunks may improve transition loading and RAM pressure but increase request count, manifest size, and edge-case frequency at chunk boundaries.
- Browser memory must include decoded numeric arrays, parsed JSON objects before compaction or garbage collection, trail caches, generated trail geometry, metadata, textures, and Three.js scene objects.
- Protobuf is not automatically better for large numeric arrays. A custom binary layout with typed arrays may be smaller and faster, but only after precision and implementation-cost checks.
- Chunk transitions need explicit validation because interpolation, trail stitching, and focused-body tracking can expose discontinuities even when raw samples are accurate.
- Expanded major-moon UX may need local-system scale/readability controls even if the data format and cadence pass.

### Phase 3: Web Runtime Integration

- [x] Add an opt-in local preview path that consumes the expanded generated profile through the existing static asset flow without making it the deployed default.
- [ ] Consume the reduced Milestone 11 preview dataset that excludes fast undersampled moons until Milestone 13 sub-day cadence support exists.
- [ ] Remove temporarily deferred fast moons from Milestone 11 discovery groups, indicators, labels, focus targets, and generated preview adoption checks without deleting the long-term registry plan.
- [ ] Consume the reduced expanded generated profile as the default only after the Phase 2B benchmark and UX gates pass.
- [x] Add presentation metadata for the curated major moons with conservative default trail windows and shared material behavior.
- [ ] Keep parent-relative trails for all satellites through the existing hierarchy behavior.
- [ ] Update body labels and indicators so crowded planet systems remain readable on desktop and mobile.
- [ ] Add optional moon visibility or filtering in the existing layer or control surface if the default overview becomes visually noisy.
- [ ] Keep the deployed app compatible with static GitHub Pages hosting.

### Phase 4: Discovery UI

- [x] Replace the fixed `Jump to` groups with registry-driven quick-pick and system groups for the current loaded catalog.
- [ ] Keep quick access to the Sun, Earth, Moon, Saturn, and other high-value bodies.
- [ ] Make the jump menu usable with the expanded catalog on coarse-pointer layouts.
- [ ] Verify direct body picking, labels, indicators, and jump-menu focus all work for major moons.

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
