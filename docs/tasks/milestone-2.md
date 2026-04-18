# Milestone 2 Task List

## Status

Implemented in code. Closeout verification still open.

## Goal

Expand the initial showcase into a mocked full-solar-system overview with overview navigation, focus transitions, orbital trails, and a star background.

## Delivered

- [x] Add the Sun and all 8 planets to the mocked body catalog
- [x] Define a readable mocked overview scale and placement model
- [x] Render the full solar system in one scene
- [x] Start the experience in an overview framing
- [x] Preserve focus transitions from overview to single-body view
- [x] Allow zooming back out to recover a broad solar-system framing
- [x] Add self-rotation for all rendered bodies
- [x] Add mocked orbital trails
- [x] Add star background rendering
- [x] Keep the HUD and help overlay working in the overview scene
- [x] Move the remaining overview planets to texture-backed materials

## Remaining Closeout

- [x] Refresh Playwright smoke coverage for the overview-first experience
- [ ] Perform manual desktop and mobile verification in both overview and focused modes
- [ ] Mark Milestone 2 closed after the verification pass

## Notes

- Planet positions and trails are intentionally mocked.
- The Moon remains in the scene for continuity with the original showcase.
- Returning to a wider view is currently zoom-driven rather than button-driven.
- Pole rendering remains a known deferred issue.
