# Milestone 2 Task List

## Goal

Expand the current showcase into a mocked full-solar-system scene with overview navigation, focus transitions, orbital trails, and a star background.

## Tasks

- [ ] Add Sun and all 8 planets to the mocked body catalog
- [ ] Define a readable mocked overview scale and placement model
- [ ] Render the full solar system in one scene
- [ ] Preserve focus transitions from overview to single-body view
- [ ] Add a way to return to the overview
- [ ] Add self-rotation for all rendered planets
- [ ] Add mocked orbital trails
- [ ] Add star background rendering
- [ ] Verify desktop and mobile interaction in both overview and focused modes

## Notes

- Keep the new overview readable before chasing realism.
- Reuse the current focus and interaction patterns where possible.
- Leave real ephemerides and realistic scaling for later milestones.
- Pole rendering remains a known deferred issue; possible future approaches include cube-sphere geometry or impostor-style rendering.
