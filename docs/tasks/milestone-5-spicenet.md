# Milestone 5 SpiceNet Task List

## Status

Completed

## Goal

Extend the pinned external `SpiceNet` repository so it can generate web-ready ephemeris and metadata assets for `solar-system-web` without requiring browser-side SPICE parsing.

## Scope

- `SpiceNet` remains an external repository pinned by commit or tag from this project.
- The accepted `SpiceNet` dataset for Milestone 5 uses `de440s` with coverage from 1950 through 2050.
- Current benchmark baseline is shared `25` year chunks with mixed per-body cadence rather than uniform sampling.
- Current output baseline is a compact minified manifest plus flattened per-body state arrays in chunk files.
- The manifest now explicitly describes its body set, sample layout, and timestamp reconstruction so the browser runtime does not depend on implicit decoder rules.
- The generator now accepts optional text metadata kernels and emits first-pass per-body radii, GM, pole, axial-tilt, and rotation metadata when direct `BODYnnn_*` assignments are available.
- The current metadata workflow keeps the upstream NAIF text kernels out of git, downloads them into a local cache when refreshing, and versions only the parsed `body-metadata.json` snapshot.
- The current scripted ephemeris refresh workflow uses cached official NAIF kernels and regenerates the mixed-cadence local baseline without versioning the upstream binaries or generated chunk set.
- Current manifest provenance uses stable source-file metadata instead of absolute local paths, and reproducible timestamps can be driven through `SOURCE_DATE_EPOCH`.
- Generated outputs can now carry stable profile labels so cached artifacts are self-identifying without relying on local folder names alone.
- Proper leap-second-aware UTC-to-TDB conversion is explicitly deferred to a later milestone; Milestone 5 closes on the documented approximate conversion path.
- Output should be directly consumable by the Milestone 5 web data layer.

## Tasks

- [x] Add a generator CLI or equivalent scripted entry point that accepts kernel inputs, coverage window, output path, and per-body cadence settings.
- [x] Support the agreed kernel set for the first Milestone 5 dataset.
  Current status: the accepted `SpiceNet` baseline is `de440s + naif0012 + pck00011 + gm_de440`, with proper leap-second-aware conversion explicitly deferred to a later milestone.
- [x] Emit a manifest plus chunk files for the Sun, planets, and Moon in a compact JSON-array format suitable for HTTP compression.
- [x] Include sampled velocities so the web app can use cubic Hermite interpolation.
- [x] Extract all useful kernel-derived body metadata that can be gathered reliably, with radii, axial tilt, and rotation period treated as first-priority outputs.
  Current status: the current metadata snapshot is accepted as usable for Milestone 5, based on real `pck00011.tpc` and `gm_de440.tpc`, with explicit units, reference conventions, and body-set metadata.
- [x] Preserve additional metadata fields that may become useful in later educational milestones when extraction is low-risk.
  Current status: the emitted metadata includes low-risk derived shape and physical fields such as flattening, approximate mass, bulk density, surface gravity, and escape velocity.
- [x] Record source provenance such as kernel names, versions, coverage, and generation settings in the manifest output.
  Current status: the manifest records source-file roles, names, byte lengths, SHA-256 hashes, canonical source URLs, tool identity, and generation profile labels.
- [x] Keep output deterministic so the generated assets can be cached, diffed, and validated.
  Current status: manifests and metadata snapshots honor `SOURCE_DATE_EPOCH` when reproducible timestamps are needed and avoid embedding local absolute kernel paths.
- [x] Add validation that compares generated chunk samples back to `SpiceNet` live queries at representative timestamps.
- [x] Document the local cache workflow for downloaded kernels and the CI workflow for non-versioned kernel acquisition.
  Current status: `SpiceNet` documents and scripts both the metadata refresh flow and the local ephemeris baseline refresh flow, with CI expected to run the same scripts in a fresh workspace.

## Acceptance Notes

- `SpiceNet` can generate the first 1950 through 2050 benchmark dataset without manual hand-editing of inputs.
- Output is stable enough for the web app to parse and benchmark repeatedly.
- Kernel binaries are not required to be committed to either repository.
- The official text metadata kernels are downloaded when refreshing and are not committed; the parsed metadata snapshot is committed so the web side can consume stable small JSON.
- The current local ephemeris baseline is regenerated into ignored artifacts from cached downloaded kernels rather than being committed.
- The generator can be run locally against a cached kernel folder and in CI against freshly downloaded kernels.
- The accepted Milestone 5 `SpiceNet` baseline is `de440s`, and proper leap-second-aware conversion is explicitly deferred to a future milestone.
