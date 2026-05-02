# Bug: Informational HUD Disappears Below 768 Px Width

Status: Resolved
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

- The HUD was visually covered by the playback controls rather than removed from the DOM.
- The final fix targets the shared `max-width: 767px` breakpoint by making the HUD an information layer controlled from the top rail.
- Deployed GitHub Pages was not separately reproduced during closeout; verification was local source/test/build based.

## Closeout

### Root Cause

The HUD used the base `inset: auto auto 1rem 1rem` placement below `768px`, putting it on the same bottom-left edge as the mobile playback bar. At `767px`, the playback controls expand across the bottom and have a higher stacking order, so they could occlude the HUD.

### Fix Summary

- Added an `i` information toggle to the top control rail.
- Made the informational HUD default open outside mobile portrait layouts and default closed in mobile portrait.
- The info HUD default now follows orientation changes automatically; it can still be shown or hidden with the `i` button and closed with the panel `x` button.
- Split the info HUD state from the active rail popover state so wide-enough layouts keep the info HUD visible while Help, Jump, Frame, or Layers are open.
- In mobile portrait, opening another rail popover temporarily hides the info HUD and restores it when that popover closes if the HUD was open beforehand.
- Kept the wide-screen HUD in the original top-left position.
- Docked the narrow-screen HUD below the top rail when opened instead of reserving space above the playback bar.
- Allowed the narrow info panel to receive touch/scroll events without being treated as an outside click.
- Added focused regression tests for the rail toggle behavior and narrow HUD docking rule.

### Changed Files

- `src/features/experience/SolarSystemExperience.tsx`
- `src/features/experience/components/ExperienceControlRail.tsx`
- `src/features/experience/components/ExperienceControlRail.test.tsx`
- `src/features/experience/components/experience-control-rail.css`
- `src/features/experience/components/experience-hud.css`
- `src/features/experience/components/ExperienceHud.test.tsx`
- `src/features/experience/hooks/useInfoPanelDefaultOpen.ts`
- `src/features/experience/domain/infoPanelVisibility.ts`

### Verification

- `pnpm vitest run src/features/experience/components/ExperienceHud.test.tsx src/features/experience/components/ExperienceControlRail.test.tsx` passed.
- `pnpm lint` passed with the existing `react-refresh/only-export-components` warning in `src/features/solar-system/components/SunImpostor.tsx`.
- `pnpm test` passed: 37 files, 180 tests.
- `pnpm build` passed with the existing large chunk warning.

### Remaining Risks

- No browser screenshot pass was run, so final visual spacing should still be inspected around `767px` width, portrait mobile, and compact mobile landscape.
