# Milestone 13: Fast Moon Cadence

Status: In Progress

## Start Point

Milestone 13 starts after Milestone 11 deploys and validates the reduced expanded major-moon profile. Milestone 11 intentionally defers fast undersampled moons whose orbital periods are too short for the current integer-day cadence floor.

Sub-day profiling, fast-moon tuning, truth-comparison diagnostics for those bodies, and reintroduction of the deferred fast moons belong here rather than in Milestone 11. The pre-Milestone 13 one-year reduced-profile chunk evaluation passed locally and on GitHub Pages, so one-year JSON chunks are the reduced-profile baseline for this milestone unless restored fast-moon measurements prove a different loading strategy or file format is needed.

## Goal

Reintroduce fast major moons with sampling dense enough to preserve local orbital motion, focused views, and trails without forcing the rest of the catalog into unnecessarily large assets.

## Scope

- Add sub-day cadence support or an equivalent fast-satellite sampling strategy in `SpiceNet`.
- Keep slower moons on coarser cadences when they pass visual and interpolation gates.
- Re-benchmark output size, largest chunk gzip size, parse cost, and memory after fast moons are restored.
- Use the accepted one-year reduced-profile chunk assessment as the starting static-delivery baseline.
- Revisit reduced-profile chunk duration, request count, and file format only if the restored fast-moon profile or later deployed measurements make it necessary.
- Keep generated assets out of git until the profile clears accuracy and browser budget gates.
- Preserve the existing static GitHub Pages delivery model.

## Deferred From Milestone 11

- Mars: Phobos `401`, Deimos `402`
- Jupiter: Io `501`, Europa `502`
- Saturn: Mimas `601`, Enceladus `602`, Tethys `603`, Dione `604`
- Uranus: Ariel `701`, Miranda `705`
- Reduced-profile data optimization: chunk duration, cache churn, compact JSON versus binary numeric-array format, Float64/Float32/quantized representation, and release-asset packaging changes only if the accepted one-year JSON chunk baseline stops being acceptable.

## Candidate Strategy

- Allow fractional `SampleDays` values in the generation profile, or add explicit sample intervals in hours.
- Choose cadences from orbital period, not from body category alone.
- Target enough samples per orbit for stable Hermite interpolation and readable local trails: use `4` samples per orbital period as the minimum visual gate and `8` samples per orbital period as the preferred starting point.
- Consider per-body caps so very fast moons do not dominate the entire profile size without review.
- Keep the manifest schema unchanged if fractional days fit the current `SampleDays` field and runtime layout.
- Treat visual inspection as the final user-experience gate; retained Milestone 11 moons passed despite conservative diagnostic flags, so normalized error should trigger review rather than reject a body automatically.

## Initial Sampling Ratios

Approximate orbital-period-to-cadence ratios for the Milestone 11 deferred moons if sampled at the current `1 day` floor:

- Phobos: `0.32` samples per orbit
- Mimas: `0.94` samples per orbit
- Deimos: `1.26` samples per orbit
- Enceladus: `1.37` samples per orbit
- Miranda: `1.41` samples per orbit
- Io: `1.77` samples per orbit
- Tethys: `1.89` samples per orbit
- Ariel: `2.52` samples per orbit
- Dione: `2.74` samples per orbit
- Europa: `3.55` samples per orbit

Europa, Dione, and Ariel are the most plausible first candidates for a permissive visual re-check, but they still fall below the preferred `4` to `8` samples-per-orbit target for focused inspection.

## Checklist

### Phase 1: Generator Cadence Support

- [x] Add fractional-day cadence support to the expanded `SpiceNet` profile path.
- [x] Add generator tests for fractional cadence sample counts, terminal chunk-end samples, and manifest output.
- [x] Confirm the current web runtime can parse and interpolate fractional `SampleDays` without schema changes.

### Phase 2: Fast Moon Benchmark

- [x] Define per-body cadence candidates for Phobos, Deimos, Io, Europa, Mimas, Enceladus, Tethys, Dione, Ariel, and Miranda.
- [x] Derive first-pass cadence candidates from orbital period using at least `4` samples per orbit and a preferred `8` samples per orbit target before size and memory tradeoff review.
- [x] Run at least three profile variants: current integer-day baseline for comparison, targeted fast-moon sub-day profile, and conservative high-quality profile.
- [x] Report raw size, gzip size, largest chunk gzip size, request count, parse time, and generation time.
- [ ] Compare the accepted one-year reduced-profile chunk baseline against any proposed smaller-chunk or alternate-format profile only if measured startup, parse, or memory costs require it.
- [x] Normalize interpolation error by local orbit scale and estimate focused-view screen displacement.
- [ ] Build a truth-comparison visual diagnostic for selected timestamps that can render sampled/interpolated positions against direct `SpiceNet` truth for the deferred fast moons.
- [ ] Inspect whether the original large kilometer errors are visible in actual focused local-system views at normal playback speeds, fast playback, and paused trail inspection.

### Phase 3: Runtime And UX Validation

- [x] Reintroduce the deferred fast moons into the preview profile.
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
- One-year JSON chunks are accepted for the reduced-profile Milestone 13 starting point after local and deployed assessment.

## Execution Notes

- 2026-05-03: Phase 1 generator support is implemented in the sibling `SpiceNet` checkout. `Spice.WebDataGenerator` now carries `SampleDays` as a fractional numeric value for default cadence, per-body cadence overrides, manifest body cadence, and configured-cadence benchmark reports. The generator retains the existing manifest schema and runtime layout string.
- 2026-05-03: Added `SpiceNet` unit coverage for fractional cadence parsing, sub-day sample timelines, terminal chunk-end samples, and manifest cadence field types.
- 2026-05-03: The web runtime already accepted positive numeric `SampleDays`; added a regression test for fractional-day sample-time reconstruction and removed integer cadence casts from the local reduced-moon diagnostic script.
- 2026-05-03: Added `C:\Dev\repos\3Dmondo\SpiceNet\scripts\Generate-WebDataFastMoonCadenceBenchmarks.ps1` for the Phase 2 benchmark run. The script preserves the accepted pre-Milestone 13 one-year JSON chunk baseline by using `--chunk-years 1` for all variants and keeps outputs under ignored `SpiceNet\artifacts\web-data\milestone-13-fast-moon-cadence\`.
- 2026-05-03: The Phase 2 runner defines three variants but has only been validated with `-PrintOnly` so far: `IntegerDayBaseline`, `TargetedFastMoons`, and `ConservativeHighQuality`.
- 2026-05-03: Ran all three Phase 2 variants from cached kernels with one-year chunks. Total wall-clock time for the combined run was about `7` minutes. Outputs remain ignored under `C:\Dev\repos\3Dmondo\SpiceNet\artifacts\web-data\milestone-13-fast-moon-cadence\`.
- 2026-05-03: Added `C:\Dev\repos\3Dmondo\SpiceNet\scripts\Measure-FastMoonCadenceBenchmarks.ps1` to summarize generated size, largest one-year chunk size, local Node `JSON.parse` timing for the largest chunk, and fast-moon orbit-scale normalized error.
- 2026-05-03: Staged the targeted `4` samples/orbit profile into `public/ephemeris/generated-expanded-major-moons/` with `-AllowMilestone13FastMoons`. User visual inspection reported the `4` samples/orbit profile looks fine.
- 2026-05-03: Local texture inventory does not include dedicated texture files for the restored fast moons Phobos, Deimos, Io, Europa, Mimas, Enceladus, Tethys, Dione, Ariel, or Miranda. The app already wires the available dedicated major-moon textures for Ganymede, Callisto, Rhea, Titan, Iapetus, Umbriel, Titania, Oberon, and Triton; restored fast moons remain on the solid-color fallback until approved texture assets are added.
- 2026-05-03: Prepared a GitHub Pages validation deployment path for the targeted `4` samples/orbit profile. The Pages workflow now points at release tag `ephemeris-expanded-major-moons-targeted-4-samples-v1` and asset `ephemeris-expanded-major-moons-targeted-4-samples-v1.zip`, with an explicit fast-moon allow flag in the release-asset validation. This is a validation deployment choice, not the final adoption decision.
- 2026-05-03: Included user trail-sampling tuning for Europa, Ariel, Umbriel, Titania, and Oberon in the deployment-validation commit.

## Fast-Moon Cadence Candidates

These first-pass candidates are period-derived. `TargetedDays` provides at least `4` samples per orbit; `HighQualityDays` is the preferred `8` samples per orbit starting point before size, parse, memory, and visual review.

| Body | NAIF id | Approx period days | TargetedDays | HighQualityDays |
| --- | ---: | ---: | ---: | ---: |
| Phobos | `401` | `0.319` | `0.080` | `0.040` |
| Deimos | `402` | `1.263` | `0.316` | `0.158` |
| Io | `501` | `1.769` | `0.442` | `0.221` |
| Europa | `502` | `3.551` | `0.888` | `0.444` |
| Mimas | `601` | `0.942` | `0.235` | `0.118` |
| Enceladus | `602` | `1.370` | `0.343` | `0.171` |
| Tethys | `603` | `1.888` | `0.472` | `0.236` |
| Dione | `604` | `2.737` | `0.684` | `0.342` |
| Ariel | `701` | `2.520` | `0.630` | `0.315` |
| Miranda | `705` | `1.413` | `0.353` | `0.177` |

## Phase 2 Benchmark Record

Inputs:

- Source: `C:\Dev\repos\3Dmondo\SpiceNet\scripts\Generate-WebDataFastMoonCadenceBenchmarks.ps1 -Variant All`
- Measurement: `C:\Dev\repos\3Dmondo\SpiceNet\scripts\Measure-FastMoonCadenceBenchmarks.ps1 -AsJson`
- Coverage: `1901` through `2099`, emitted as `199` one-year chunks per variant.
- Truth sampling: `6` hours.
- Parse timing: local Node `JSON.parse` of each variant's largest raw JSON chunk; this is a local parse proxy, not a browser `/debug` measurement.
- Focused displacement proxy: max interpolation error normalized by mean local orbit radius from `chunk-2026-2027.json`, projected onto a `300 px` focused orbit radius.

| Variant | Raw bytes | Gzip bytes | Largest chunk | Largest gzip bytes | Largest JSON.parse ms |
| --- | ---: | ---: | --- | ---: | ---: |
| Integer day baseline | `145,120,405` | `69,731,109` | `chunk-1980-1981.json` | `353,264` | `3.62` |
| Targeted fast moons, 4 samples/orbit | `345,253,693` | `164,242,990` | `chunk-2040-2041.json` | `832,232` | `8.23` |
| Conservative high quality, 8 samples/orbit | `627,504,807` | `296,833,013` | `chunk-2040-2041.json` | `1,504,551` | `12.69` |

Fast-moon normalized result summary:

- Integer-day baseline remains visibly invalid for fast moons: Phobos, Mimas, Enceladus, and Miranda exceed `70%` of mean local orbit radius, and several others exceed a `20 px` focused displacement proxy.
- Targeted `4` samples/orbit reduces all deferred fast moons to roughly `1.5%` to `1.7%` of local orbit radius, about `4.6 px` to `5.2 px` on the focused displacement proxy.
- Conservative `8` samples/orbit reduces all deferred fast moons to roughly `0.10%` to `0.16%` of local orbit radius, about `0.3 px` to `0.5 px` on the focused displacement proxy.
- The 8-sample profile is the first benchmark profile that clearly clears the numeric focused-displacement proxy, but it raises total gzip from the accepted reduced-profile baseline's `30.3 MB` to `296.8 MB`.
- One-year chunks are still viable by largest-chunk parse proxy: even the 8-sample profile's largest raw one-year chunk parsed locally in about `13 ms`. Browser `/debug` startup, heap, and visual playback still need validation before adoption.
