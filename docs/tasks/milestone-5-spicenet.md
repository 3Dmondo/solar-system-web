# Milestone 5 SpiceNet Task List

## Status

Planned

## Goal

Extend the pinned external `SpiceNet` repository so it can generate web-ready ephemeris and metadata assets for `solar-system-web` without requiring browser-side SPICE parsing.

## Scope

- `SpiceNet` remains an external repository pinned by commit or tag from this project.
- The first target dataset uses `de441t` with coverage from 1950 through 2050.
- Current benchmark baseline is shared `25` year chunks with mixed per-body cadence rather than uniform sampling.
- Current output baseline is a compact minified manifest plus flattened per-body state arrays in chunk files.
- The manifest now explicitly describes sample layout and timestamp reconstruction so the browser runtime does not depend on implicit decoder rules.
- Output should be directly consumable by the Milestone 5 web data layer.

## Tasks

- [x] Add a generator CLI or equivalent scripted entry point that accepts kernel inputs, coverage window, output path, and per-body cadence settings.
- [ ] Support the kernel set needed for the first benchmark, including leap-second and body-metadata sources in addition to `de441t`.
- [x] Emit a manifest plus chunk files for the Sun, planets, and Moon in a compact JSON-array format suitable for HTTP compression.
- [x] Include sampled velocities so the web app can use cubic Hermite interpolation.
- [ ] Extract all useful kernel-derived body metadata that can be gathered reliably, with radii, axial tilt, and rotation period treated as first-priority outputs.
- [ ] Preserve additional metadata fields that may become useful in later educational milestones when extraction is low-risk.
- [ ] Record source provenance such as kernel names, versions, coverage, and generation settings in the manifest output.
- [ ] Keep output deterministic so the generated assets can be cached, diffed, and validated.
- [x] Add validation that compares generated chunk samples back to `SpiceNet` live queries at representative timestamps.
- [ ] Document the local cache workflow for downloaded kernels and the CI workflow for non-versioned kernel acquisition.

## Acceptance Notes

- `SpiceNet` can generate the first 1950 through 2050 benchmark dataset without manual hand-editing of inputs.
- Output is stable enough for the web app to parse and benchmark repeatedly.
- Kernel binaries are not required to be committed to either repository.
- The generator can be run locally against a cached kernel folder and in CI against freshly downloaded kernels.
