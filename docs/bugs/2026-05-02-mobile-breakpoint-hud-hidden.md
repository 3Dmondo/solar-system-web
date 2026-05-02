# Bug: Informational HUD Disappears Below 768 Px Width

Status: Reported
Date: 2026-05-02

## Summary

The informational HUD disappears when the viewport width drops below `768px`. The breakpoint appears tied to the playback controls switching into their mobile layout at `767px`, where they occupy the bottom of the screen and can cover the HUD after the HUD moves from top-left to bottom-left.

## Environment

- App surface: Informational HUD and playback controls
- Browser/device: Unknown; reproduced by changing horizontal viewport resolution around `768px`
- Route or URL: Main solar-system experience; exact route unknown
- Build/deploy context: After Milestone 11 Phase 4 HUD and playback-control redesign; exact branch and local/deployed context unknown
- Relevant time or data state: Unknown

## Steps To Reproduce

1. Open the solar-system experience with the informational HUD visible.
2. Set the viewport width to `768px` and observe the HUD in the top-left area.
3. Reduce the viewport width to `767px`.
4. Observe the playback controls changing shape and occupying the whole bottom side of the screen.
5. Check whether the informational HUD remains visible.

## Actual Behavior

When viewport width changes from `768px` to `767px`, the informational HUD disappears. The playback controls switch to a wrapped mobile layout that spans the bottom of the screen.

## Expected Behavior

The informational HUD should remain visible and readable across the `768px` to `767px` breakpoint. If the playback controls need the bottom edge on narrow screens, the HUD should stay in a non-overlapping safe region or intentionally collapse into an accessible compact state.

## Evidence

- Screenshots: Not provided
- Console/log output: Unknown
- Network/debug observations: Unknown
- Related files or code areas:
  - `src/features/experience/components/experience-hud.css`
  - `src/features/experience/components/playback-controls.css`
  - `src/features/experience/components/ExperienceHud.tsx`
  - `src/features/experience/components/PlaybackControls.tsx`

## Frequency And Scope

Reported as reproducible at the responsive breakpoint where horizontal viewport width changes from `768px` to `767px`. Scope across browser engines, device orientation, and different HUD content states is unknown.

## Recent Changes

Milestone 11 Phase 4 moved simulation time and transport controls into a bottom playback bar and kept the main HUD informational.

## Suspected Area

Likely CSS breakpoint interaction. `experience-hud.css` positions `.experience-hud` at top-left only inside `@media (min-width: 768px)`. Below `768px`, it falls back to the base `inset: auto auto 1rem 1rem`, which places it bottom-left. At the same breakpoint, `playback-controls.css` applies `@media (max-width: 767px)`, expanding `.playback-controls` across the bottom with `left: 0.75rem`, `right: 0.75rem`, wrapping controls, and a higher `z-index` (`14`) than the HUD (`10`). This may hide or occlude the HUD rather than removing it from the DOM.

## Open Questions

- Is the HUD still present in the DOM but visually covered by playback controls?
- Does this happen in both portrait and landscape narrow viewports?
- Should the narrow-layout HUD remain top-left, move above the playback bar, or collapse into a compact control?
- Does the issue reproduce on deployed GitHub Pages, local dev, or both?
