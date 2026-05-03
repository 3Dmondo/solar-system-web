# Deferred: Expanded Data Optimization For Milestone 13

Status: Deferred To Milestone 13

## Start Point

This work was originally a post-deploy Milestone 11 follow-up. After the reduced major-moons profile deployed to GitHub Pages with about `4` seconds of startup time, the current data path was accepted for Milestone 11 and optimization moved to Milestone 13. A later pre-Milestone 13 local and deployed assessment accepted one-year JSON chunks as the reduced-profile starting baseline.

## Goal

Evaluate whether the reduced expanded dataset or the restored fast-moon dataset needs chunk-size, cache, or file-format optimization during Milestone 13.

## Scope

- Compare deployed startup latency, transfer behavior, parse time, cache churn, and browser memory against the local debug pass if Milestone 13 changes the data profile.
- Revisit generated chunk duration only if the accepted one-year reduced profile or restored fast-moon profile causes a measured user-facing issue.
- Compare compact JSON plus gzip against at least one binary numeric-array format before considering protobuf.
- Test Float64, Float32, and any proposed quantized or delta-encoded representation against visual error and interpolation error before changing runtime format.
- Keep optimization changes separate from the closed Milestone 11 UI/readability changes.

## Deferred From Milestone 11 Phase 2B

- Browser parse-time and cache-churn comparison across chunk durations beyond the accepted one-year baseline.
- Data-format comparison including transfer size, decode time, parse allocations, implementation complexity, and numeric precision.
- Chunk-cache tuning beyond the current bounded active, adjacent, and trail-history budget.
- Any generated-data format migration.

## Adoption Notes

- Do not change the deployed generated-data format unless deployed metrics show a real problem.
- Prefer the smallest runtime and build-system change that fixes the measured bottleneck.
- Keep schema-1 compatibility until a new schema field or binary layout is actually required.
