# Optional: Expanded Data Optimization After Phase 3 Deploy

Status: Optional Backlog

## Start Point

This work starts only after the Milestone 11 Phase 3 reduced major-moons experience is deployed to GitHub Pages and measured against the deployed static-hosting path. It does not block Phase 3 UI work or the first reduced-catalog deployment.

## Goal

Evaluate whether the reduced expanded dataset needs chunk-size, cache, or file-format optimization after real GitHub Pages behavior is known.

## Scope

- Compare deployed startup latency, transfer behavior, parse time, cache churn, and browser memory against the local debug pass.
- Revisit generated chunk duration only if the deployed `25` year reduced profile causes a measured user-facing issue.
- Compare compact JSON plus gzip against at least one binary numeric-array format before considering protobuf.
- Test Float64, Float32, and any proposed quantized or delta-encoded representation against visual error and interpolation error before changing runtime format.
- Keep optimization changes separate from Phase 3 UI/readability changes.

## Deferred From Milestone 11 Phase 2B

- Browser parse-time and cache-churn comparison across `25`, `10`, `5`, and `1` year chunks.
- Data-format comparison including transfer size, decode time, parse allocations, implementation complexity, and numeric precision.
- Chunk-cache tuning beyond the current bounded active, adjacent, and trail-history budget.
- Any generated-data format migration.

## Adoption Notes

- Do not change the deployed generated-data format unless deployed metrics show a real problem.
- Prefer the smallest runtime and build-system change that fixes the measured bottleneck.
- Keep schema-1 compatibility until a new schema field or binary layout is actually required.
