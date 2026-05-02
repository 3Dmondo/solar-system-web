# Bug: Outer Planet Trails Show Gaps In Focused View

Status: Reported
Date: 2026-05-02

## Summary

When focusing on an outer planet, long planet trails far in the background can appear interrupted instead of continuous. The attached screenshot shows Saturn's trail rendered as separated horizontal segments near the top of the scene while another outer planet is focused.

## Environment

- App surface: Orbital trail rendering in focused-body views
- Browser/device: Unknown
- Route or URL: Main solar-system experience; exact route unknown
- Build/deploy context: After Milestone 10 trail-rendering changes and Milestone 11 reduced major-moon deployment; exact branch, commit, and local/deployed context unknown
- Relevant time or data state: Unknown

## Steps To Reproduce

1. Open the solar-system experience with orbital trails enabled.
2. Focus an outer planet.
3. Inspect long background trails for other outer planets, especially Saturn's trail when it is far behind the focused body.
4. Compare against overview mode, where the reporter did not notice this interruption.

## Actual Behavior

Saturn's trail appears as a discontinuous line in the focused view. In the provided screenshot, the trail near the top of the viewport is broken into repeated separated dashes or segments rather than drawing as one continuous path.

## Expected Behavior

Planet trails should remain visually continuous in focused views, including when the trail is far behind the focused body. Focus mode should not introduce visible trail gaps that are absent in overview mode.

## Evidence

- Screenshots: User-provided screenshot shows a focused outer-planet view with Saturn and other bodies near the top of the viewport; Saturn's horizontal trail is visibly interrupted in the far background.
- Console/log output: Unknown
- Network/debug observations: Unknown
- Related files or code areas:
  - `src/features/experience/components/ExperienceScene.tsx`
  - `src/features/solar-system/domain/focus.ts`
  - `src/features/experience/domain/controlProfile.ts`
  - `src/features/solar-system/components/OrbitTrails.tsx`
  - `src/features/solar-system/components/GlowingTrailLine.tsx`
  - `src/features/solar-system/data/webEphemerisProvider.ts`
  - `src/features/solar-system/data/webEphemerisTrails.ts`

## Frequency And Scope

Reported in focused views for outer planets. The reporter did not notice the issue in overview mode. Scope across specific focused targets, reference frames, browsers, viewport sizes, and playback speeds is unknown.

## Recent Changes

Milestone 10 switched orbital trails to constant-width screen-space ribbons and deferred deeper focused-view trail validation. Milestone 11 added reduced major-moon data, parent-relative satellite trails, dynamic chunk prefetch/cache budgeting, and focused-view validation for retained moons.

## Suspected Area

Unknown. This may or may not be related to `docs/bugs/2026-05-02-outer-satellite-trail-artifacts.md`.

Possible areas to verify:

- Focused-view camera clip planes from `getCameraClipPlanes`; far background trail geometry may interact with near/far precision or clipping when the camera is close to an outer body.
- Fat-line rendering via drei `Line`/Three `Line2`, especially screen-space ribbon joins, depth behavior, and large world-coordinate precision.
- Trail sample continuity and chunk stitching for long planet trails, particularly if the focused camera angle makes gaps more obvious.
- Depth testing against nearby focused-body geometry or sky/background layers.

## Open Questions

- Which body was focused in the screenshot?
- Which reference frame was selected?
- Does the gap persist while paused, or does it change during playback?
- Does it reproduce in production preview or deployed GitHub Pages, or only local dev?
- Does disabling depth testing for trails, changing camera angle, or returning to overview make the trail continuous?
- Is Saturn the only planet trail with visible gaps, or do Jupiter/Uranus/Neptune trails show the same issue in focused views?
