# Vision

## Product Goal

Build a static web-based solar system explorer that feels polished, readable, and educational on both desktop and mobile.

## Current Experience

The repository currently ships a mocked overview-first solar-system scene with:

- Sun, all 8 planets, and the Moon
- overview-to-body focus transitions driven by double click or double tap
- orbit controls tuned separately for fine and coarse pointers
- a minimal HUD with a help overlay
- a Milky Way star background
- mocked orbital trails
- continuous body self-rotation
- custom rendering passes for Venus, Earth, Moon, and Saturn

## Current Constraints

- Body positions and trails are hard-coded mocked values.
- The scene imports `mockedSolarSystemBodies` directly. There is no provider abstraction in use yet.
- The experience uses a cinematic scale model only.
- Discovery aids are limited to the HUD and direct body interaction.
- There is no dedicated rendering-configuration UI yet.
- Cross-device interaction still needs a final closeout verification pass.

## Next Experience

The next implementation milestone is the interaction and readability pass on top of the current mocked overview.

Focus areas:

- make body discovery and re-focusing clearer in the multi-body scene
- refine overview-to-focus camera choreography
- decide whether lightweight labels or other discovery aids are needed
- improve trail and background readability without cluttering the screen
- refresh automated smoke coverage for the overview-first flow
- finish desktop and mobile manual verification for the broader overview scene

## Long-Term Direction

- move from mocked data to static offline-generated ephemeris assets
- replace the decorative star background with a real star-catalog sky layer
- support optional constellation-line overlays
- add a minimized rendering-controls interface that stays usable on both mobile and desktop
- introduce a stable body-state provider boundary
- support date and time selection plus different time rates
- expand the body catalog and educational context
- keep the final site compatible with static GitHub Pages hosting

## Non-Goals For The Current Phase

- live astronomy APIs or server-backed simulation
- realistic distances and sizes as the default presentation
- final reference-frame controls
- production ephemerides integration
- final trail UX for satellites and non-sun-centered views

## Workflow Expectations

- work in small incremental steps
- keep docs aligned with code
- explicitly mark planned work instead of describing it as already implemented
- pause after each meaningful step for user review
