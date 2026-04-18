# Milestone 3 Task List

## Status

Complete

## Goal

Improve navigation clarity and readability in the current mocked overview without yet introducing real ephemerides or a new data backend.

## Tasks

- [x] Review current overview pain points on desktop and mobile
- [x] Improve multi-body discovery and re-selection in the overview
- [x] Refine overview-to-focus camera choreography where it feels abrupt or confusing
- [x] Evaluate whether lightweight labels or discovery aids are needed
- [x] Improve star and trail readability without overpowering the bodies
- [x] Refresh Playwright smoke coverage to match the overview-first startup flow
- [x] Perform manual desktop and mobile verification after the interaction pass
- [x] Update roadmap, vision, and architecture docs as the interaction model changes

## Reviewed Pain Points

- Scrolling discovery chips made overview navigation feel heavier and less obvious than a single `Jump to` entry point.
- Focusing from an off-angle view felt like orbiting back to an authored default instead of recentering the selected body.
- Transparent orbital trails changed appearance when crossing in front of planets, which made their visual weight feel inconsistent.

## Constraints

- Keep the experience fullscreen and minimal.
- Preserve the current mocked data model for this milestone.
- Avoid adding heavy UI chrome unless testing shows it is necessary.
- Keep GitHub Pages compatibility and mobile usability intact.
