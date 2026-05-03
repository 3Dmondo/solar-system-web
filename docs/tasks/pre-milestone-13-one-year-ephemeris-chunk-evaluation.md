# Pre-Milestone 13: One-Year Ephemeris Chunk Evaluation

Status: Closed

## Summary

Evaluated the current reduced Milestone 11 major-moon catalog with `1` year ephemeris chunks before Milestone 13 fast-moon cadence work begins.

The final local and GitHub Pages assessments passed using a temporary evaluation release asset. Generated ephemeris JSON stayed out of git.

Decision: keep one-year JSON chunks as the reduced-profile baseline for Milestone 13 fast-moon cadence work unless later restored fast-moon measurements prove a different format or loading strategy is needed.

Post-Milestone 13 note: the later restored targeted `4` samples/orbit fast-moon profile also passed with one-year JSON chunks and became the default GitHub Pages deployment.

## Goals

- Generate a reduced major-moon evaluation dataset with `ChunkYears = 1`.
- Preserve the current Milestone 11 deployed body set and keep deferred Milestone 13 fast-moon ids excluded.
- Make the scene visible as soon as the manifest, body metadata, and active ephemeris chunk are loaded.
- Let planetary and satellite trails start partial and extend backward as past chunks become available.
- Preload enough past and future chunks for smooth `1y/s` playback in both directions.
- Finish with a deployed GitHub Pages assessment and an explicit keep, revise, or reject decision for one-year chunks.

## Runtime Expectations

- First scene visibility should not wait for adjacent, past-trail, or future chunks.
- The active chunk is required for the first visible scene.
- The preloader should warm:
  - the active chunk
  - `5` previous one-year chunks, clipped at the dataset start
  - `5` future one-year chunks, clipped at the dataset end
  - any additional previous chunks required by the loaded catalog's maximum trail-history window
- Trails should progressively fill from ready previous chunks until each body's configured trail window is available.
- Forward and reverse `1y/s` playback should not visibly stall across warmed year boundaries.
- Existing ephemeris-range clamping and UTC warnings should remain the dataset-edge behavior.

## Checklist

### Phase 1: Runtime Readiness

- [x] Confirm `loadSnapshotAtUtc` waits only for the active chunk.
- [x] Confirm prefetch warms `5` previous chunks and `5` future chunks around the active chunk.
- [x] Confirm trail-history prefetch can load additional previous chunks beyond the `5` year reverse-playback buffer when needed.
- [x] Confirm the default chunk-cache budget can hold trail history plus active, previous playback, and future playback chunks.
- [x] Confirm loaded previous chunks extend trails without blocking first scene visibility.

### Phase 2: Evaluation Dataset And Release Asset

- [x] Generate the reduced major-moon dataset with `ChunkYears = 1`.
- [x] Verify the manifest excludes deferred Milestone 13 fast-moon ids `401`, `402`, `501`, `502`, `601`, `602`, `603`, `604`, `701`, and `705`.
- [x] Record body count, chunk count, raw total size, gzip or zip total size, and largest chunk size.
- [x] Package the dataset as a temporary evaluation release asset, for example `ephemeris-expanded-major-moons-reduced-1y-eval-v1.zip`.
- [x] Temporarily point the GitHub Pages workflow at the evaluation release tag and asset name.
- [x] Keep generated chunk JSON out of git.

### Phase 3: Local Debug Pass

- [x] Run `pnpm lint`.
- [x] Run `pnpm test`.
- [x] Run `pnpm build`.
- [x] Inspect `/debug` locally with the one-year evaluation dataset.
- [x] Record cold and warm startup behavior to first visible scene.
- [x] Record active chunk load and parse behavior.
- [x] Record progressive past-trail extension behavior.
- [x] Test forward and reverse `1y/s` playback across at least five consecutive year boundaries.
- [x] Record JS heap behavior after startup, after preload warmup, and after several minutes of playback when the browser exposes heap data.

### Phase 4: GitHub Pages Assessment

- [x] Deploy the app to GitHub Pages with the temporary evaluation release asset.
- [x] Record the deployed URL, release tag, asset name, asset size, commit SHA, and assessment date.
- [x] Repeat the local `/debug` timing and memory observations on the deployed site.
- [x] Use browser DevTools Network for one cold reload with cache disabled and one warm reload with cache enabled.
- [x] Inspect visible trail continuity for planets and retained moons.
- [x] Inspect forward and reverse `1y/s` playback across warmed year boundaries.
- [x] Confirm dataset-edge clamping still pauses playback and shows the UTC range warning.

## Assessment Record

- Deployed URL: `https://3Dmondo.github.io/solar-system-web/debug`
- Release tag: `ephemeris-expanded-major-moons-reduced-1y-eval-v1`
- Release asset: `ephemeris-expanded-major-moons-reduced-1y-eval-v1.zip`
- Commit SHA: `d14d4d4`
- Assessment date: `2026-05-03`
- Body count: `19`
- Chunk count: `199`
- Raw generated size: `62,280,991` bytes
- Gzip total size: `30,261,951` bytes
- Packaged asset size: `30,281,559` bytes
- Largest chunk size: `chunk-1982-1983.json`, `317,371` bytes raw, `153,404` bytes gzip
- Cold startup to first visible scene: Passed locally and deployed; first scene became visible after the active chunk loaded.
- Warm startup to first visible scene: Passed locally and deployed; cached reload was smooth.
- Active chunk load and parse timing: Passed in `/debug`; no visible parse stall was observed.
- Progressive trail extension timing: Passed; past trails filled in progressively as previous chunks became ready.
- Forward `1y/s` boundary result: Passed across warmed consecutive year boundaries.
- Reverse `1y/s` boundary result: Passed across warmed consecutive year boundaries.
- JS heap observations: Passed; no runaway heap growth was observed during startup, preload warmup, or several minutes of playback.
- Visual trail continuity notes: Planet and retained-moon trails remained continuous enough for the reduced catalog assessment.
- Decision: Keep one-year chunks for Milestone 13 reduced-profile and fast-moon cadence evaluation.

## Execution Notes

- Runtime readiness is covered by `webEphemerisProvider` unit coverage: snapshot load still fetches only the active chunk, prefetch warms five previous and five future chunks, extra previous chunks are prefetched for longer trail windows, and cached previous chunks extend trails progressively.
- The one-year reduced output source used for this pass is `C:\Dev\repos\3Dmondo\SpiceNet\artifacts\web-data\expanded-major-moons-reduced-chunk-years\chunk-years-1`.
- The ignored local staging path is `public/ephemeris/generated-expanded-major-moons/`.
- The ignored packaged asset path is `.tmp/ephemeris-release/ephemeris-expanded-major-moons-reduced-1y-eval-v1.zip`.
- Asset SHA-256: `202d9b745fef9006002ecc80f96d5951a9f061f4017a36a805c0610e5698cb29`.
- Local verification passed: `pnpm lint`, `pnpm test`, and `pnpm build`.
- Local `/debug` assessment with the one-year evaluation dataset passed.
- GitHub Pages deployed assessment with the temporary one-year evaluation release asset passed.
- The deployment workflow was temporarily pointed at the evaluation tag and asset for the closed assessment pass. It later moved to the Milestone 13 targeted fast-moon release asset.
- Exact stopwatch timing breakdowns were not preserved in the docs; the closeout records the observed pass/fail assessment results and any visible runtime concerns.

## Acceptance Criteria

- First visible scene appears after only the active chunk is loaded.
- Past trails visibly or measurably extend as previous chunks arrive.
- Forward and reverse `1y/s` playback remain smooth across warmed year boundaries.
- No generated ephemeris JSON is committed.
- GitHub Pages successfully serves the temporary evaluation asset.
- The final assessment records one explicit decision:
  - keep one-year chunks for Milestone 13 work
  - revise the buffer or loading strategy
  - reject one-year chunks for now

## Defaults

- Dataset scope: reduced Milestone 11 major-moon catalog only.
- Playback preload buffer: `5` one-year chunks before and after the active chunk.
- Trail preload: additional past chunks as needed for configured trail windows.
- Final assessment: temporary GitHub release asset consumed by GitHub Pages.
- Fast-moon reintroduction and sub-day cadence were completed in Milestone 13; one-year JSON chunks remained acceptable for the restored profile, so binary or alternate file formats are optional future work only if later measurements justify them.
