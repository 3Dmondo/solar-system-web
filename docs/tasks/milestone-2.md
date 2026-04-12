# Milestone 2 Task List

## Goal

Expand the current showcase into a mocked full-solar-system scene with overview navigation, focus transitions, orbital trails, and a star background.

## Tasks

- [x] Add Sun and all 8 planets to the mocked body catalog
- [x] Define a readable mocked overview scale and placement model
- [x] Render the full solar system in one scene
- [x] Preserve focus transitions from overview to single-body view
- [x] Allow zooming back out to recover a broad solar-system framing
- [x] Add self-rotation for all rendered planets
- [ ] Add mocked orbital trails
- [ ] Add star background rendering
- [ ] Verify desktop and mobile interaction in both overview and focused modes

Current implementation notes:

- planets are now spread across different mocked orbital angles to cover more of the ecliptic disk
- the Moon is kept in the mocked scene for continuity with the original showcase flow
- the Sun and the remaining overview planets now use local Solar System Scope texture maps
- Earth and Saturn are back on the shared Sun-based lighting model after correcting the light-direction convention used by the custom materials

## Notes

- Keep the new overview readable before chasing realism.
- Reuse the current focus and interaction patterns where possible.
- Leave real ephemerides and realistic scaling for later milestones.
- Pole rendering remains a known deferred issue; possible future approaches include cube-sphere geometry or impostor-style rendering.
