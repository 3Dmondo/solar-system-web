# Milestone 4 Task List

## Status

Complete

## Goal

Introduce a stable body-state boundary that keeps the current mocked experience working while preparing the app for fixed-time snapshots and offline-generated ephemeris assets.

## Tasks

- [x] Split static body metadata from time-varying body state
- [x] Define a `BodyStateProvider`-style interface for snapshot-based scene data
- [x] Add a mocked snapshot provider that reproduces the current overview layout
- [x] Route scene consumers through the provider boundary instead of importing mocked catalog data directly
- [x] Move orbital trail derivation to provider-backed state inputs
- [x] Preserve current focus behavior, HUD labels, and material selection after the refactor
- [x] Add unit coverage for provider outputs and the metadata or state mapping helpers
- [x] Update roadmap, vision, architecture, and README docs to reflect the new boundary once it ships

## Proposed Shape

- Keep static facts such as `id`, `displayName`, `material`, radius, and focus tuning in metadata.
- Move snapshot values such as position and any future time-derived trail inputs into provider output.
- Keep the provider synchronous for now so the app stays simple and GitHub Pages friendly.
- Treat the current mocked layout as the first provider implementation, not as special-case scene logic.

## Acceptance Notes

- Milestone 4 should not change the visible solar-system layout in a meaningful way.
- The refactor should make Milestone 5 mostly about asset integration and time controls, not another data-model rewrite.
- Any deferred work around interpolation, asset formats, or multiple reference frames should stay clearly documented as future work.

## Closure Notes

- The app now resolves mocked solar-system data through a provider-backed selector layer instead of importing the old combined catalog directly.
- The visible overview experience is intentionally unchanged after the refactor.
- Milestone 5 can now focus on replacing mocked positions with offline-generated assets and adding time controls on top of the stabilized boundary.
