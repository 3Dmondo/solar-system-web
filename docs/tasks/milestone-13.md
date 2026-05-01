# Milestone 13: Fast Moon Cadence

Status: Planned

## Start Point

Milestone 13 starts after Milestone 11 validates a reduced expanded major-moon preview. Milestone 11 intentionally defers fast undersampled moons whose orbital periods are too short for the current integer-day cadence floor.

Sub-day profiling, fast-moon tuning, truth-comparison diagnostics for those bodies, and reintroduction of the deferred fast moons belong here rather than in Milestone 11.

## Goal

Reintroduce fast major moons with sampling dense enough to preserve local orbital motion, focused views, and trails without forcing the rest of the catalog into unnecessarily large assets.

## Scope

- Add sub-day cadence support or an equivalent fast-satellite sampling strategy in `SpiceNet`.
- Keep slower moons on coarser cadences when they pass visual and interpolation gates.
- Re-benchmark output size, largest chunk gzip size, parse cost, and memory after fast moons are restored.
- Keep generated assets out of git until the profile clears accuracy and browser budget gates.
- Preserve the existing static GitHub Pages delivery model.

## Deferred From Milestone 11

- Mars: Phobos `401`, Deimos `402`
- Jupiter: Io `501`, Europa `502`
- Saturn: Mimas `601`, Enceladus `602`, Tethys `603`, Dione `604`
- Uranus: Ariel `701`, Miranda `705`

## Candidate Strategy

- Allow fractional `SampleDays` values in the generation profile, or add explicit sample intervals in hours.
- Choose cadences from orbital period, not from body category alone.
- Target enough samples per orbit for stable Hermite interpolation and readable local trails.
- Consider per-body caps so very fast moons do not dominate the entire profile size without review.
- Keep the manifest schema unchanged if fractional days fit the current `SampleDays` field and runtime layout.

## Checklist

### Phase 1: Generator Cadence Support

- [ ] Add fractional-day or hour-based cadence support to the expanded `SpiceNet` profile path.
- [ ] Add generator tests for fractional cadence sample counts, terminal chunk-end samples, and manifest output.
- [ ] Confirm the current web runtime can parse and interpolate fractional `SampleDays` without schema changes.

### Phase 2: Fast Moon Benchmark

- [ ] Define per-body cadence candidates for Phobos, Deimos, Io, Europa, Mimas, Enceladus, Tethys, Dione, Ariel, and Miranda.
- [ ] Run at least three profile variants: current integer-day baseline for comparison, targeted fast-moon sub-day profile, and conservative high-quality profile.
- [ ] Report raw size, gzip size, largest chunk gzip size, request count, parse time, and generation time.
- [ ] Normalize interpolation error by local orbit scale and estimate focused-view screen displacement.
- [ ] Build a truth-comparison visual diagnostic for selected timestamps that can render sampled/interpolated positions against direct `SpiceNet` truth for the deferred fast moons.
- [ ] Inspect whether the original large kilometer errors are visible in actual focused local-system views at normal playback speeds, fast playback, and paused trail inspection.

### Phase 3: Runtime And UX Validation

- [ ] Reintroduce the deferred fast moons into the preview profile.
- [ ] Validate focused local-system views for Mars, Jupiter, Saturn, and Uranus.
- [ ] Check parent-relative trails for visible discontinuities during playback and pause.
- [ ] Validate jump-menu usability and body picking with the restored dense systems.
- [ ] Measure browser memory on desktop and mobile after opening dense moon systems.

### Phase 4: Adoption Decision

- [ ] Decide whether the restored fast-moon profile is acceptable for default deployment.
- [ ] Decide whether generated expanded-profile assets should remain CI-generated, be manually staged, or be versioned after size gates pass.
- [ ] Update Milestone 11 closeout notes if Milestone 13 changes the final major-moon catalog.

## Verification

1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`
4. SpiceNet generator tests for fractional or hour-based cadence
5. SpiceNet expanded fast-moon benchmark
6. Browser preview checks for dense moon systems

## Locked Decisions

- Fast moons should not be forced into Milestone 11 with one-day cadence.
- The sampling strategy must be chosen from orbital behavior and validated with visual impact, not kilometer error alone.
- The slower Milestone 11 moon subset remains the near-term preview path while this cadence work is planned.
