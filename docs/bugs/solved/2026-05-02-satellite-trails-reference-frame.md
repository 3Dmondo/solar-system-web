# Bug: Satellite trails use the wrong origin outside SSB

Status: Resolved
Date: 2026-05-02

## Summary

Satellite orbital trails are not drawn in the correct place when the selected reference frame is not the Solar System Barycenter. This affects body-centered views such as Earth-, Jupiter-, Saturn-, Uranus-, or Neptune-centered frames in expanded moon catalogs.

## Environment

- App surface: Solar system experience with reference-frame selector and orbital trails enabled.
- Browser/device: Unknown.
- Route or URL: Unknown; likely the main experience or `/debug`.
- Build/deploy context: Unknown; reported during pre-Milestone 13 one-year ephemeris chunk evaluation work.
- Relevant time or data state: Reduced Milestone 11 major-moon catalog or another catalog with natural satellites loaded.

## Steps To Reproduce

1. Load a catalog that includes at least one natural satellite and exposes a non-SSB parent-centered reference frame.
2. Enable orbital trails and satellites.
3. Select a reference frame whose origin is not `ssb`, for example Earth-centered or another loaded parent-centered frame.
4. Inspect the visible satellite trails relative to the satellite bodies and their parent body.

## Actual Behavior

Satellite trails are visually displaced from the satellite and parent system when the selected reference frame is not SSB.

## Expected Behavior

Satellite trails should remain visually centered on the satellite's parent body in the selected reference frame, with the current satellite position landing on or near the current trail endpoint.

## Evidence

- Screenshots: Not provided.
- Console/log output: Not provided.
- Network/debug observations: Not provided.
- Related files or code areas:
  - `src/features/experience/SolarSystemExperience.tsx` passes `selectedFrame.originBodyId` as `trailOriginBodyId` to `useResolvedBodyCatalog`, then calls `transformCatalogToFrame`.
  - `src/features/solar-system/data/webEphemerisProvider.ts` uses `trailOriginBodyId` as the effective trail origin when it is set, and only falls back to satellite-parent-relative trails when that origin is `null`.
  - `src/features/solar-system/data/referenceFrameTransform.ts` assumes satellite trails are parent-relative, then offsets them by the transformed parent position.
  - `src/features/solar-system/data/referenceFrameTransform.test.ts` covers parent-relative satellite trails and frame transforms, but its Earth-centered non-satellite trail expectation uses untransformed example data that does not prove provider/runtime frame-relative behavior.

## Frequency And Scope

Reported for satellites whenever the selected reference frame is not the Solar System Barycenter. Scope likely includes all natural satellites whose trails are rendered while a parent-centered frame is selected.

## Recent Changes

The active pre-Milestone 13 task evaluates one-year ephemeris chunks and includes visual trail-continuity inspection for planets and retained moons. No specific code change was identified as the confirmed trigger.

## Suspected Area

Reference-frame trail origin handling between `webEphemerisProvider` and `referenceFrameTransform`. A likely mismatch is that the provider returns satellite trails relative to the selected frame origin in body-centered frames, while the transform layer treats satellite trails as if they are still parent-relative and offsets them again by the parent position.

## Root Cause

Confirmed in `src/features/solar-system/data/webEphemerisProvider.ts`. `trailOriginBodyId` took precedence over satellite parent-relative sampling whenever a non-SSB reference frame was selected. That made a satellite trail relative to the selected frame origin, but `referenceFrameTransform` still treated the same samples as parent-relative and offset them by the transformed parent position.

## Fix Summary

Satellite trails now always use their parent body as the provider-side trail origin. `trailOriginBodyId` continues to apply to non-satellite trails only. Nearby type and runtime comments were updated to make that contract explicit.

## Changed Files

- `src/features/solar-system/data/webEphemerisProvider.ts`
- `src/features/solar-system/data/webEphemerisProvider.test.ts`
- `src/features/solar-system/data/referenceFrameTransform.ts`
- `src/features/solar-system/data/bodyStateStore.ts`
- `src/features/solar-system/domain/body.ts`
- `src/features/experience/SolarSystemExperience.tsx`

## Verification

- `pnpm test src/features/solar-system/data/webEphemerisProvider.test.ts` passed after rerunning outside the sandbox because the first attempt hit `spawn EPERM` while Vite/esbuild loaded config.
- `pnpm test` passed: 41 test files, 202 tests.
- `pnpm lint` passed.
- `pnpm build` passed. Vite still reports the existing large-chunk warning.

## Remaining Risks

- No visual/browser reproduction was performed because the report did not include a concrete frame/satellite screenshot or deploy URL.
- Parent-body and non-satellite frame-relative trail behavior is covered by unit tests but should still be included in the next manual `/debug` trail-continuity pass.

## Open Questions

- Exact first-exposed frame/satellite remains unknown.
- Trail endpoint and full-curve visual alignment were not inspected manually after the code fix.
- Local vs GitHub Pages reproduction remains unknown.
- Unit coverage confirms non-satellite trails still use the selected origin while satellite trails stay parent-relative.
