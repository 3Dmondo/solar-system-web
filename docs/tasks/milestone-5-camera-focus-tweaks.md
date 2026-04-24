# Milestone 5 Camera Focus Tweaks

## Status

Ready

## Goal

Remove the remaining high-rate focused-camera issues in Milestone 5 so focusing on a planet keeps the camera looking at the live body center immediately and does not require a manual interaction to stabilize the view.

## Current Repo Snapshot

- The first Milestone 5 runtime optimization task is now closed for the current scope after landing the debug benchmark seam, catalog and trail caching passes, closer overview inspection zoom, and a layout-synchronized focused follow update.
- Overview mode now allows much closer manual zoom in the physically scaled runtime, which made it easier to compare overview motion with focused motion during diagnosis.
- Focused follow behavior is materially improved, but high playback rates still expose residual camera-target issues during and just after focus changes.

## Reported Issues To Fix

- At `1d/s`, focusing on a planet can leave the camera looking at where the body was when the focus action was triggered instead of the body's live center.
- At `1d/s`, after focus changes to a planet, the planet can still jump back and forth until the first manual orbit or zoom interaction.
- After that first manual interaction, the planet appears to stay fixed on screen, although not necessarily centered, which suggests the manual controls path is stabilizing a state that the automatic follow path should already own.

## Investigation Targets

- `src/features/experience/components/ExperienceScene.tsx`
  - verify how `desiredTarget`, `desiredCameraPosition`, `trackedFocusTarget`, and the controls target diverge during a focus change while the body keeps moving
  - verify whether the focus target is captured too early relative to the live body position used by the first focused render
  - verify whether the transition path and the settled follow path disagree about which state owns the live target
- `src/features/experience/domain/focusTracking.ts`
  - confirm the translated view math still preserves the intended camera-to-target relationship under high-rate body motion
- `src/features/experience/components/ExperienceHud.tsx`
  - confirm the focus-change trigger timing does not introduce an avoidable one-commit lag between the selected body and the first focused camera target

## Constraints

- Preserve the current Milestone 5 performance gains unless a new measurement pass shows a regression and justifies reopening the runtime performance task.
- Keep manual orbit and zoom adjustments intact once focus has settled.
- Keep the focus target on the live body center and keep orbiting around that live center.
- Do not regress overview behavior, the closer overview inspection zoom, loading and error handling, or chunk-boundary behavior.
- Keep body and trail motion synchronized to the same simulation timestamp.

## Acceptance Criteria

- At `1d/s`, focusing on a planet points the camera at the live body center rather than a stale target from the moment of the focus request.
- At `1d/s`, the focused body no longer jumps back and forth after focus changes while waiting for the first manual interaction.
- Manual orbit and zoom still work after focus settles, and the orbit center remains the live body center.
- Overview mode still behaves as expected and remains useful for motion comparison.
- `pnpm test` and `pnpm build` stay green for any touched camera, focus, or runtime files.

## Verification Scenarios

- `/debug` at `2026-04-24T00:00:00Z` in overview at `1x`, `1h/s`, and `1d/s`
- focus Earth from overview at `1d/s` and confirm the camera immediately targets the live body center
- focus another planet at `1d/s` and confirm no back-and-forth jump appears before user interaction
- orbit and zoom after focus settles and confirm the selected body remains the orbit center
- return to overview and confirm the comparison workflow still works
