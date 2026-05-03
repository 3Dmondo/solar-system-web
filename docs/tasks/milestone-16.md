# Milestone 16: Dwarf Planets And Major Asteroids

Status: Planned

## Start Point

Milestone 16 starts after the expanded major-moon catalog has been validated and after the non-spherical moon path has at least proven the rendering model for small irregular bodies. Pluto and Charon, asteroid packs, spacecraft trajectories, and long-tail minor moons were intentionally deferred from Milestone 11.

The current runtime can already filter presentation metadata by the loaded generated-data manifest, derive selector groups from loaded hierarchy, and tolerate partial generated physical metadata. This milestone should use those existing seams to add a curated small-body expansion rather than widening the catalog indiscriminately.

## Goal

Expand the solar-system catalog with a curated first set of dwarf planets and major asteroids, including generated ephemeris assets, physical metadata, selector organization, discovery behavior, and texture or shape fallbacks suitable for static GitHub Pages delivery.

## Scope

- Add a reviewed candidate set for dwarf planets, Pluto-system bodies, and major asteroids.
- Generate and benchmark a new static data profile with the selected bodies.
- Add registry entries, selector grouping, labels, indicators, trails, and facts for accepted bodies.
- Keep bodies with unclear texture or mesh rights on the solid-color or simple-shape fallback.
- Prefer SPICE/NAIF metadata and kernels when available, and document every fallback.
- Preserve the current overview-first experience and existing planet and moon behavior.

## Out Of Scope

- Every known minor planet or trans-Neptunian object.
- Long-tail minor moons.
- Spacecraft trajectories.
- High-fidelity asteroid-belt particle clouds.
- Live network ephemeris queries from the browser.
- Replacing the accepted one-year JSON chunk strategy unless measurements show it is no longer acceptable.

## Initial Candidate Tiers

### Tier 1: First Small-Body Profile

| Body | Category | Candidate reason | Initial gate |
| --- | --- | --- | --- |
| Pluto | Dwarf planet | Historically deferred from Milestone 11; anchor for Pluto-system exploration | Kernel and metadata availability, orbit-scale fit |
| Charon | Pluto moon | Useful paired system with Pluto; texture candidate already documented in Milestone 11 texture research | Parent-relative trail readability and texture realism caveat |
| Ceres | Dwarf planet / asteroid belt | Largest asteroid-belt body and dwarf planet | Kernel, physical metadata, and texture or fallback review |
| Vesta | Major asteroid | Large, well-studied asteroid with strong visual identity | Kernel, physical metadata, shape or texture review |

### Tier 2: Candidate Expansion

| Body | Category | Candidate reason | Initial gate |
| --- | --- | --- | --- |
| Pallas | Major asteroid | One of the largest main-belt asteroids | Ephemeris and visual-discovery value |
| Hygiea | Major asteroid | Large main-belt object, likely near-spherical | Metadata and selector clutter review |
| Juno | Major asteroid | Historic large asteroid candidate | Metadata and visual value |
| Psyche | Major asteroid | Prominent mission target and dense-metal candidate | Kernel and model/texture rights review |
| Eris | Dwarf planet | Massive trans-Neptunian dwarf planet | Very distant overview readability and ephemeris range |
| Haumea | Dwarf planet | Rapidly rotating elongated dwarf planet candidate | Shape representation and metadata confidence |
| Makemake | Dwarf planet | Major trans-Neptunian dwarf planet | Texture/fallback and orbit readability |

Tier 2 should not automatically ship with Tier 1. Promote bodies only after the data profile, UI density, and static-size budget stay healthy.

## Checklist

### Phase 1: Candidate And Kernel Review

- [ ] Confirm the initial body list and NAIF ids through the sibling `SpiceNet` SSD catalog workflow.
- [ ] Identify required SPICE kernels for each candidate and whether they are practical for CI or release-asset generation.
- [ ] Record orbital period, generated cadence candidate, expected trail window, parent or system grouping, and metadata availability.
- [ ] Decide whether Pluto and Charon ship with Tier 1 or remain a separate Pluto-system follow-up.
- [ ] Decide whether dwarf planets and asteroids share one catalog group or separate selector groups.

### Phase 2: Generated Data Profile

- [ ] Add a new `SpiceNet` generation profile for the selected small-body catalog.
- [ ] Benchmark raw size, gzip size, largest chunk size, parse time, generation time, and cache behavior.
- [ ] Review whether the existing one-year chunk strategy remains acceptable.
- [ ] Keep generated chunks out of git and package accepted output as a pinned release asset if the profile ships.
- [ ] Refresh `public/ephemeris/body-metadata.json` or add a profile-aware metadata snapshot path for the accepted bodies.

### Phase 3: Runtime Catalog Integration

- [ ] Add accepted body entries to `BODY_REGISTRY` with category, hierarchy, group, default trail window, color, radius fallback, and facts fallback.
- [ ] Extend selector grouping so dwarf planets and asteroids are discoverable without crowding planet and moon systems.
- [ ] Confirm reference-frame behavior for Pluto-system bodies and asteroid bodies.
- [ ] Confirm satellite visibility toggles do not accidentally hide dwarf planets or asteroids.
- [ ] Add or update focused-body facts for accepted bodies.
- [ ] Add texture or shape asset mappings only after the same source and license gate used by earlier texture work.

### Phase 4: Visual And UX Validation

- [ ] Validate the overview with planets, current major moons, and accepted small bodies loaded together.
- [ ] Check labels and indicators for clutter in the asteroid belt and outer solar system.
- [ ] Check focused views for Pluto, Charon, Ceres, and Vesta if accepted.
- [ ] Verify trails remain readable in SSB and relevant parent-centered frames.
- [ ] Validate mobile selector usability with the expanded catalog.
- [ ] Decide whether any Tier 2 candidates should be deferred based on size, clutter, or weak visual value.

## Verification

1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`
4. SpiceNet profile-generation and benchmark run for the accepted candidate set
5. Metadata snapshot spot check for every accepted new body
6. Manual desktop and mobile visual checks for overview, selector grouping, focused views, labels, indicators, and trails
7. Deployed GitHub Pages validation if a new release asset is adopted

## Locked Decisions

- This is a curated small-body expansion, not a complete minor-body catalog.
- Pluto, Charon, Ceres, and Vesta are the first review tier unless kernel or delivery constraints force a smaller first pass.
- Generated ephemeris assets remain static and release-asset-backed by default.
- Bodies without approved texture or mesh assets must still render acceptably through simple fallback materials.
- UI density and static delivery budget can reject otherwise interesting candidates.
