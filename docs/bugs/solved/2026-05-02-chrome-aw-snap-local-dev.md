# Bug: Chrome Aw Snap Crashes On Local Dev Server

Status: Resolved
Date: 2026-05-02

## Summary

Chrome frequently shows an `Aw, Snap!` renderer crash while browsing the app from the local `pnpm dev` Vite server. The same crash has not been observed while browsing the deployed GitHub Pages site, though production impact is still unverified.

## Environment

- App surface: Main solar-system experience served locally by Vite
- Browser/device: Chrome; exact version, OS details, GPU, and device unknown
- Route or URL: Local dev server from `pnpm dev`; exact URL and route unknown
- Build/deploy context: Local Vite dev server. Deployed GitHub Pages production build has not shown the issue so far.
- Relevant time or data state: Unknown

## Steps To Reproduce

1. Start the local dev server with `pnpm dev`.
2. Open the app in Chrome.
3. Browse the site normally, including scene navigation and UI interactions.
4. Observe whether Chrome eventually replaces the page with an `Aw, Snap!` crash screen.

## Actual Behavior

Chrome frequently displays the `Aw, Snap!` tab crash page while browsing the locally served app.

## Expected Behavior

The app should remain stable in Chrome during local development. The local dev server should not trigger renderer crashes during normal browsing.

## Evidence

- Screenshots: Not provided
- Console/log output: Unknown; an `Aw, Snap!` crash may clear normal page console context
- Network/debug observations: Unknown
- Related files or code areas:
  - `package.json` (`pnpm dev` runs `vite`)
  - `vite.config.ts`
  - `src/App.tsx`
  - `src/features/solar-system/data/webBodyCatalogRuntime.ts`
  - `src/features/solar-system/data/webDatasetLoader.ts`
  - `src/features/solar-system/data/webEphemerisProvider.ts`
  - `src/features/experience/components/DebugFpsOverlay.tsx`
  - `public/ephemeris/generated/`
  - `public/ephemeris/generated-expanded-major-moons/`

## Frequency And Scope

Reported as frequent when using Chrome against the local `pnpm dev` server. The deployed GitHub Pages build has not reproduced the crash for the reporter so far. Scope across other browsers, Chrome versions, routes, local generated-data profiles, and production preview builds is unknown.

## Recent Changes

Recent Milestone 11 work deployed the reduced major-moon profile and added larger generated ephemeris assets, parent-relative satellite trails, default-on sky layers, selector panels, and playback controls. Milestone 13 planning calls out future data-format, chunk-size, parse-cost, and memory work if measurements justify it.

## Suspected Area

Unknown. A local-only Chrome `Aw, Snap!` crash could come from dev-mode overhead rather than the production app path. Areas to investigate include Vite dev-server/HMR overhead, large generated JSON chunk fetch and parse behavior, retained trail/chunk caches, WebGL/GPU memory pressure from textures and scene objects, source-map/devtools overhead, or differences between local ignored generated assets and the pinned GitHub Pages release asset.

The `/debug` route may help capture FPS, JS heap when available, and generated-data timing samples before the crash, but it may also add observer overhead and should be compared against the normal route.

## Open Questions

- What exact Chrome version, OS version, and GPU reproduce the crash?
- Does the crash happen on the normal route, `/debug`, or both?
- Does it reproduce with DevTools closed?
- Which local data profile is active: default `public/ephemeris/generated/`, `VITE_WEB_EPHEMERIS_PROFILE=expanded-major-moons`, or a custom `VITE_WEB_EPHEMERIS_DATA_BASE_URL`?
- Does `pnpm build` followed by `pnpm preview` reproduce locally, or only `pnpm dev`?
- Does the crash correlate with specific actions such as focusing moons, opening selectors, changing reference frame, fast playback, or leaving the app running?
- Is Chrome task-manager memory, GPU memory, or `chrome://crashes` information available after a crash?

## Closeout

Root cause:

- Confirmed code-level memory pressure in the web ephemeris runtime. Parsed chunk sample arrays were retained as regular JavaScript number arrays, which are expensive for large generated JSON chunks.
- Confirmed retained-cache growth risk in trail sampling. Per-chunk trail samplers cached moving interior trail ranges by `startIndex:endIndex`; during high-rate playback these keys can keep changing and retain many overlapping arrays.
- Confirmed stale sampler retention risk in chunk cache eviction. When the provider evicted chunk promises and parsed chunks from the LRU cache, sampler caches for the evicted chunk were not purged, so closures could keep evicted chunk data and cached trail interiors reachable.

Fix summary:

- Store parsed ephemeris sample buffers as `Float64Array` after JSON validation so retained chunk data is compact and the raw parsed JSON arrays can be collected.
- Bound each trail sampler's cached moving interior ranges with a small LRU window.
- Purge absolute and relative trail samplers for a chunk whenever that chunk is evicted from the provider cache, and clear the single cached trail snapshot if it references the evicted chunk.
- Added regression coverage for typed sample buffers and bounded trail-range caching.

Changed files:

- `src/features/solar-system/data/webEphemeris.ts`
- `src/features/solar-system/data/webEphemeris.test.ts`
- `src/features/solar-system/data/webEphemerisTrails.ts`
- `src/features/solar-system/data/webEphemerisTrails.test.ts`
- `src/features/solar-system/data/webEphemerisProvider.ts`
- `docs/bugs/solved/2026-05-02-chrome-aw-snap-local-dev.md`

Verification:

- `pnpm test src/features/solar-system/data/webEphemeris.test.ts src/features/solar-system/data/webEphemerisTrails.test.ts src/features/solar-system/data/webEphemerisProvider.test.ts` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- `pnpm test` passed: 38 files, 185 tests.

Remaining risks:

- The original Chrome `Aw, Snap!` crash was not reproduced locally in this session, so the browser crash itself is not proven eliminated by direct Chrome crash-loop measurement.
- JSON parsing still temporarily materializes the raw response arrays before conversion to typed arrays; Milestone 13 data-format work may still be needed if chunk parse peaks remain too high on constrained devices.
- DevTools, source maps, GPU driver behavior, and Vite dev-mode overhead can still amplify memory use independently of the retained-runtime fixes above.
