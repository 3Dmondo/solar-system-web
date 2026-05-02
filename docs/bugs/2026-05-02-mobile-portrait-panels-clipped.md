# Bug: Mobile Portrait Selector Panels Are Clipped

Status: Reported
Date: 2026-05-02

## Summary

After the Milestone 11 Phase 4 HUD and selector redesign, selector/help panels can render partially off-screen on a mobile device in portrait orientation. The clipped panel content is not fully readable or reachable, which blocks normal use of the top-right controls.

## Environment

- App surface: Milestone 11 Phase 4 HUD/selector rail
- Browser/device: Mobile device in portrait orientation; exact browser and viewport unknown
- Route or URL: Main solar-system experience; exact route unknown
- Build/deploy context: After Milestone 11 Phase 4 work; exact branch, commit, and local/deployed context unknown
- Relevant time or data state: Screenshot shows simulation time `2026-05-02 07:17:51 UTC`

## Steps To Reproduce

1. Open the app on a mobile device in portrait orientation.
2. Open one of the top-right rail panels, such as Help, Jump to, reference frame, or Layers.
3. Observe whether the opened panel remains fully inside the visible viewport.

## Actual Behavior

The opened panel is partially clipped off the left side of the viewport. In the provided screenshot, only the right portion of the help panel is visible, and several lines of text begin outside the screen.

## Expected Behavior

All selector and help panels should stay fully inside the portrait mobile viewport. If a panel cannot fit vertically, it should remain height-constrained and scrollable without horizontal clipping.

## Evidence

- Screenshots: User-provided screenshot shows the top-right rail visible, the bottom playback bar visible, and a help panel clipped at the left viewport edge.
- Console/log output: Unknown
- Network/debug observations: Unknown
- Related files or code areas:
  - `src/features/experience/components/experience-control-rail.css`
  - `src/features/experience/components/jump-to-selector.css`
  - `src/features/experience/components/reference-frame-selector.css`
  - `src/features/experience/components/layer-panel.css`
  - `src/features/experience/components/ExperienceControlRail.tsx`
  - `src/features/experience/components/JumpToSelector.tsx`
  - `src/features/experience/components/ReferenceFrameSelector.tsx`
  - `src/features/experience/components/LayerPanel.tsx`

## Frequency And Scope

Reported on mobile portrait orientation after Milestone 11 Phase 4. The issue may affect all rail-hosted panels because the panel styles use absolute positioning from their individual rail item with `right: 0`; exact scope across Help, Jump to, reference frame, and Layers still needs verification.

## Recent Changes

Milestone 11 Phase 4 moved Help, Fullscreen, Jump to, reference-frame, and Layers into a shared top-right rail and moved playback controls to a bottom-center bar.

## Suspected Area

Likely in the mobile layout for the Phase 4 selector rail and its anchored panels. Current panel CSS constrains width with expressions like `width: min(..., calc(100vw - 1.5rem))`, but the panels are positioned `absolute` relative to each individual rail item. On narrow portrait screens, panels opened from rail items that are not the rightmost item can still extend beyond the left edge of the viewport.

## Open Questions

- Which mobile browser, device model, and exact viewport size reproduced the screenshot?
- Does the clipping happen for every rail panel or only the Help panel?
- Was this observed on local dev, production preview, or the deployed GitHub Pages build?
