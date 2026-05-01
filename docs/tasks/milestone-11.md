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
- Recorded initial SSD catalog-backed kernel shortlist and download-size tradeoffs from the local `SpiceNet` snapshot.
- Ran the first `Spice.SsdCatalog` kernel inspection and fallback pass and recorded `C:\Dev\repos\3Dmondo\SpiceNet\docs\SsdCatalog\kernel_inspection.json`.
- Confirmed the inspected compact and sub-500 MB fallback satellite candidates are not enough for the full `1950-2050` major-moon target window.
- Existing schema-1 generated-data parsing remains unchanged.

## Goal

Broaden the solar-system catalog into a fuller explorer, starting with a curated major natural satellite expansion. Educational context and richer exploration modes are included as lower-priority proposals for review, not blockers for the first catalog-expansion pass.

## Scope

- Start with recognizable major natural satellites, not every file in the JPL SSD catalog.
- Use `C:\Dev\repos\3Dmondo\SpiceNet\docs\SsdCatalog\ssd_catalog.json` to choose candidate kernels and compare download-size tradeoffs.
- Benchmark generated web output before making the expanded body set the default deployed dataset.
- Keep the existing Sun, planets, and Moon behavior stable while expanding the catalog.
- Keep upstream kernels out of git.
- Defer the decision on versioning generated manifest and chunk assets until expanded output sizes are measured.

## Body Catalog Target

First curated expansion:

- Mars: Phobos `401`, Deimos `402`
- Jupiter: Io `501`, Europa `502`, Ganymede `503`, Callisto `504`
- Saturn: Mimas `601`, Enceladus `602`, Tethys `603`, Dione `604`, Rhea `605`, Titan `606`, Iapetus `608`
- Uranus: Ariel `701`, Umbriel `702`, Titania `703`, Oberon `704`, Miranda `705`
- Neptune: Triton `801`

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
- [ ] Replace hard-coded body assumptions in the web app with registry lookups where the larger catalog needs dynamic behavior.
- [ ] Preserve schema-1 ephemeris parsing for the current generated dataset.
- [ ] Add schema-2 parsing only if the expanded generated data needs repeated SPK provenance, parent body ids, body categories, or other manifest fields that do not fit the current schema.

### Phase 2: SpiceNet Expanded Profile

- [ ] Add a new `SpiceNet` generation profile named `expanded-major-moons` without changing the existing `baseline-de440s-ssb-25y-mixed-cadence` profile in place.
- [x] Extend `Spice.WebDataGenerator` to accept repeated SPK inputs so planets and satellite systems can come from separate SSD catalog entries.
- [ ] Add known body names, parent ids, and cadence defaults for the expanded body set.
- [ ] Make metadata export tolerate partial metadata for bodies whose radii, GM, pole, or rotation fields are unavailable from current generic kernels.
- [ ] Preserve complete metadata output for the existing Sun, planets, and Moon.
- [x] Record initial SSD catalog-backed candidate kernel sizes before coverage and output benchmarking.
- [ ] Benchmark expanded output size, largest chunk gzip size, and interpolation error before web runtime adoption.
- [ ] Decide whether to version the generated expanded-profile manifest and chunks after real file sizes are known.

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
- Consider versioning the generated expanded-profile `manifest.json` plus chunk files if their measured size is acceptable. This would avoid repeated multi-GB SPK downloads during normal GitHub Actions builds; the regeneration workflow would remain explicit/manual and provenance-backed. Defer the final choice until the benchmark reports real raw and gzip output sizes.
- Benchmark generated output size and interpolation error for each accepted candidate set before making the expanded profile the default deployed dataset.

### Phase 3: Web Runtime Integration

- [ ] Consume the expanded generated profile through the existing static asset flow after the benchmark passes.
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
7. SpiceNet configured-cadence benchmark for the expanded body set
8. Manual visual checks:
   - default overview remains readable on desktop and mobile
   - existing Sun, planets, and Moon behavior is unchanged
   - major moons appear, can be focused, and have parent-relative trails
   - jump menu remains usable with the larger catalog
   - expanded generated assets stay acceptable for static GitHub Pages delivery

## Locked Decisions

- Milestone 11 starts after Milestone 10 trail-rendering closeout.
- The first catalog expansion prioritizes recognizable major moons over completeness.
- The existing baseline generated-data profile remains available while the expanded profile is benchmarked.
- Educational context and richer exploration are lower-priority proposals for review, not blockers for the first catalog-expansion pass.
- Upstream kernels remain non-versioned.
- Versioning generated expanded-profile manifest and chunks is an open decision pending real output-size benchmarks.
