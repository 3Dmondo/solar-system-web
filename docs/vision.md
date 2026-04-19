# Vision

## Product Goal

Build a static web-based solar system explorer that feels polished, readable, and educational on both desktop and mobile.

## Current Experience

The repository currently ships a mocked overview-first solar-system scene with:

- Sun, all 8 planets, and the Moon
- overview-to-body focus transitions driven by a `Jump to` HUD menu plus double click or double tap
- directional camera easing that preserves the current viewing angle when moving into focus and pulls back more decisively to overview
- orbit controls tuned separately for fine and coarse pointers
- a minimal HUD with a help overlay and focused-mode overview return
- a Milky Way star background
- mocked orbital trails rendered as thicker opaque lines
- continuous body self-rotation
- custom rendering passes for Venus, Earth, Moon, and Saturn

## Current Constraints

- Body positions and trails are hard-coded mocked values.
- The app now uses a synchronous mocked body-state provider, but still serves only hard-coded snapshot data.
- The experience uses a cinematic scale model only.
- Discovery aids are limited to the HUD and direct body interaction.
- There is no dedicated rendering-configuration UI yet.
- Cross-device interaction still needs a final closeout verification pass.

## Next Experience

The next implementation milestone is real positions and time controls on top of the new provider-backed data boundary.

Focus areas:

- integrate static offline-generated chunked ephemeris assets behind the existing provider shape
- keep browser work focused on loading and interpolating prepared chunks instead of raw-kernel parsing unless later benchmarks prove that unnecessary
- use kernel-derived body facts where they help the app, while keeping cinematic scale and focus tuning separate from physical metadata
- start the simulation from the current datetime with real-time advancement, pause, reverse, and rate controls without rewriting the current scene consumers again
- replace circular mocked trails with sampled position history derived from the same chunk data
- keep the current overview readability and focus behavior intact while the data source changes
- defer frame-switching and final trail UX until the later reference-frame milestone

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
