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
- The generator now accepts optional text metadata kernels and emits first-pass per-body radii, GM, pole, axial-tilt, and rotation metadata when direct `BODYnnn_*` assignments are available.
- The current metadata workflow keeps the upstream NAIF text kernels out of git, downloads them into a local cache when refreshing, and versions only the parsed `body-metadata.json` snapshot.
- The current scripted ephemeris refresh workflow uses cached official NAIF kernels and regenerates the mixed-cadence local baseline without versioning the upstream binaries or generated chunk set.
- Current manifest provenance uses stable source-file metadata instead of absolute local paths, and reproducible timestamps can be driven through `SOURCE_DATE_EPOCH`.
- Generated outputs can now carry stable profile labels so cached artifacts are self-identifying without relying on local folder names alone.
- Output should be directly consumable by the Milestone 5 web data layer.

## Tasks

- [x] Add a generator CLI or equivalent scripted entry point that accepts kernel inputs, coverage window, output path, and per-body cadence settings.
- [ ] Support the kernel set needed for the first benchmark, including leap-second and body-metadata sources in addition to `de441t`.
  Current status: the repository now has a repeatable cached-download script for the current `de440s + naif0012 + pck00011 + gm_de440` baseline. `de441t` still needs a pinned download source before it can replace the scripted default.
- [x] Emit a manifest plus chunk files for the Sun, planets, and Moon in a compact JSON-array format suitable for HTTP compression.
- [x] Include sampled velocities so the web app can use cubic Hermite interpolation.
- [ ] Extract all useful kernel-derived body metadata that can be gathered reliably, with radii, axial tilt, and rotation period treated as first-priority outputs.
  Current status: the generator can now merge straightforward text-kernel `BODYnnn_*` assignments, has been exercised against real `pck00011.tpc` and `gm_de440.tpc`, emits a versioned metadata snapshot for the Sun, planets, and Moon, and now makes that snapshot self-describing with explicit units, reference conventions, and an explicit body-set header.
- [ ] Preserve additional metadata fields that may become useful in later educational milestones when extraction is low-risk.
  Current status: the emitted metadata now includes low-risk derived shape fields such as equatorial radius, polar radius, volume-equivalent radius, flattening, and simple spherical/tri-axial flags, plus approximate mass, bulk density, surface gravity, and escape velocity derived from GM and the reference radius.
- [ ] Record source provenance such as kernel names, versions, coverage, and generation settings in the manifest output.
  Current status: the manifest now records source-file roles, names, byte lengths, SHA-256 hashes, and optional canonical source URLs instead of machine-specific paths, and generated outputs now carry explicit tool/profile identity.
- [ ] Keep output deterministic so the generated assets can be cached, diffed, and validated.
  Current status: manifests and metadata snapshots now honor `SOURCE_DATE_EPOCH` for reproducible timestamps and avoid embedding local absolute kernel paths.
- [x] Add validation that compares generated chunk samples back to `SpiceNet` live queries at representative timestamps.
- [ ] Document the local cache workflow for downloaded kernels and the CI workflow for non-versioned kernel acquisition.
  Current status: `SpiceNet` now documents and scripts both the metadata refresh flow and the local ephemeris baseline refresh flow, with CI expected to run the same scripts in a fresh workspace.

## Acceptance Notes

- `SpiceNet` can generate the first 1950 through 2050 benchmark dataset without manual hand-editing of inputs.
- Output is stable enough for the web app to parse and benchmark repeatedly.
- Kernel binaries are not required to be committed to either repository.
- The official text metadata kernels are downloaded when refreshing and are not committed; the parsed metadata snapshot is committed so the web side can consume stable small JSON.
- The current local ephemeris baseline is regenerated into ignored artifacts from cached downloaded kernels rather than being committed.
- The generator can be run locally against a cached kernel folder and in CI against freshly downloaded kernels.
