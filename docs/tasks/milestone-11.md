# Milestone 11: Full Solar System Explorer

Status: In Progress

## Start Point

Milestone 11 starts after the Milestone 10 trail-rendering scope closed. Deferred rendering audit and validation work is tracked separately in `docs/tasks/optional-rendering-audit-and-validation.md` and does not block the major-moon catalog path.

## Progress So Far

- Added a central current-body registry in `src/features/solar-system/domain/body.ts`.
- The registry now drives the current `BodyId` union, NAIF id lookups, parent hierarchy, presentation metadata, and HUD jump-menu grouping.
- Existing schema-1 generated-data parsing remains unchanged.

## Goal

Broaden the solar-system catalog into a fuller explorer, starting with a curated major natural satellite expansion. Educational context and richer exploration modes are included as lower-priority proposals for review, not blockers for the first catalog-expansion pass.

## Scope

- Start with recognizable major natural satellites, not every file in the JPL SSD catalog.
- Use `C:\Dev\repos\3Dmondo\SpiceNet\docs\SsdCatalog\ssd_catalog.json` to choose candidate kernels and compare download-size tradeoffs.
- Benchmark generated web output before making the expanded body set the default deployed dataset.
- Keep the existing Sun, planets, and Moon behavior stable while expanding the catalog.
- Keep upstream kernels and generated ephemeris assets out of git.

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
- [ ] Extend the central registry with the curated major-moon body set after expanded kernel coverage is chosen.
- [ ] Replace hard-coded body assumptions in the web app with registry lookups where the larger catalog needs dynamic behavior.
- [ ] Preserve schema-1 ephemeris parsing for the current generated dataset.
- [ ] Add schema-2 parsing only if the expanded generated data needs repeated SPK provenance, parent body ids, body categories, or other manifest fields that do not fit the current schema.

### Phase 2: SpiceNet Expanded Profile

- [ ] Add a new `SpiceNet` generation profile named `expanded-major-moons` without changing the existing `baseline-de440s-ssb-25y-mixed-cadence` profile in place.
- [ ] Extend `Spice.WebDataGenerator` to accept repeated SPK inputs so planets and satellite systems can come from separate SSD catalog entries.
- [ ] Add known body names, parent ids, and cadence defaults for the expanded body set.
- [ ] Make metadata export tolerate partial metadata for bodies whose radii, GM, pole, or rotation fields are unavailable from current generic kernels.
- [ ] Preserve complete metadata output for the existing Sun, planets, and Moon.
- [ ] Benchmark expanded output size, largest chunk gzip size, and interpolation error before web runtime adoption.

Initial SSD catalog kernel candidates to evaluate:

- planets: keep `de440s.bsp` unless expanded coverage requires another planet kernel
- Jupiter system: evaluate compact or current kernels such as `jup380s.bsp`
- Saturn system: evaluate `sat428.bsp` or newer Saturn alternatives
- Uranus system: evaluate `ura117.bsp` or other validated Uranus kernels
- Neptune system: evaluate `nep100.bsp` or newer Neptune alternatives
- Mars satellites: choose only after coverage and size are checked

### Phase 3: Web Runtime Integration

- [ ] Consume the expanded generated profile through the existing static asset flow after the benchmark passes.
- [ ] Add presentation metadata for the curated major moons with conservative default trail windows and shared material behavior.
- [ ] Keep parent-relative trails for all satellites through the existing hierarchy behavior.
- [ ] Update body labels and indicators so crowded planet systems remain readable on desktop and mobile.
- [ ] Add optional moon visibility or filtering in the existing layer or control surface if the default overview becomes visually noisy.
- [ ] Keep the deployed app compatible with static GitHub Pages hosting.

### Phase 4: Discovery UI

- [ ] Replace the fixed `Jump to` groups with dynamic groups by system.
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
- [ ] Let the reference-frame selector offer relevant loaded body-centered frames instead of only SSB and Earth.
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
- Generated ephemeris assets and upstream kernels remain non-versioned.
