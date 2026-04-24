# Vision

## Product Goal

Build a static web-based solar system explorer that feels polished, readable, and educational on both desktop and mobile.

## Current Experience

The repository currently ships an overview-first solar-system scene with real-data startup and:

- generated ephemeris-driven positions loaded at startup, with explicit loading or error messaging when local or deployed data is unavailable
- Sun, all 8 planets, and the Moon
- overview-to-body focus transitions driven by a `Jump to` HUD menu plus double click or double tap, with `Jump to` still available while focused for direct body-to-body switches
- directional camera easing that snaps the target onto the selected body center, approaches from the authored focus direction at about `10 x` body radius, and pulls back more decisively to overview
- orbit controls tuned separately for fine and coarse pointers
- a minimal HUD with a help overlay, focused-mode overview return, pause or resume, and cycling playback-rate controls
- per-frame simulation-time advancement for smoother orbital motion
- chunk-derived orbital trails clipped by per-body default trail windows
- a Milky Way star background
- continuous body self-rotation
- custom rendering passes for Venus, Earth, Moon, and Saturn

## Current Constraints

- Orbital trails currently use fixed per-body default windows, and the richer styling pass plus longer historical lookback for outer planets are deferred to the later trail UX milestone.
- The app now starts from generated real snapshot data, but local development still requires generated assets in `public/ephemeris/generated/`.
- The smoother per-frame clock path is now the default, but its current runtime cost still needs a dedicated optimization pass.
- Body axial orientation, self-rotation periods, and Earth-Sun seasonal orientation are not yet aligned as tightly as the real-data path should allow.
- The experience uses a cinematic scale model only.
- Discovery aids are limited to the HUD and direct body interaction.
- There is no dedicated rendering-configuration UI yet.
- Cross-device interaction still needs a final closeout verification pass.

## Next Experience

The next implementation slice focuses on finishing the real-data milestone after startup activation.

Focus areas:

- optimize the now-default per-frame runtime path before milestone closeout
- align body axial orientation, spin rates, Earth-Sun seasonal orientation, and other high-value physical characteristics with the rendered scene
- add reverse playback on top of the landed pause and rate controls after the current performance, lighting, and physical-alignment follow-up
- expand verification for startup, chunk-boundary loading, and focused-body recovery while keeping the current overview readability and focus behavior intact
- defer frame-switching, deeper trail history, and final trail UX until the later reference-frame and trail milestone

## Long-Term Direction

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
