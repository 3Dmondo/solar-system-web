# Vision

## Product Goal

Build a static web-based solar system explorer that feels polished, readable, and educational on both desktop and mobile.

## Current Experience

The repository currently ships an overview-first solar-system scene with real-data startup and:

- generated ephemeris-driven positions loaded at startup, with explicit loading or error messaging when local or deployed data is unavailable
- Sun, all 8 planets, the Moon, and the reduced Milestone 11 major-moon set
- overview-to-body focus transitions driven by a `Jump to` HUD menu plus double click or double tap, with `Jump to` still available while focused for direct body-to-body switches
- directional camera easing that snaps the target onto the selected body center, approaches from the authored focus direction at about `10 x` body radius, and pulls back more decisively to overview
- orbit controls tuned separately for fine and coarse pointers
- a minimal HUD with a help overlay, focused-mode overview return, pause or resume, and cycling playback-rate controls
- per-frame simulation-time advancement for smoother orbital motion
- chunk-derived orbital trails clipped by per-body default trail windows
- a real star-catalog sky layer with default-on constellation overlays, an aligned Milky Way texture background, and layer toggles
- continuous body self-rotation
- custom rendering passes for Venus, Earth, Moon, and Saturn

## Current Constraints

- The app starts from generated real snapshot data, but local development still requires generated assets in `public/ephemeris/generated/`.
- The current deployed generated dataset is the reduced major-moons profile; fast undersampled moons remain deferred to Milestone 13.
- The experience uses a cinematic scale model only.
- Discovery aids are functional for the reduced major-moon catalog, but the HUD, selector, and playback controls still need a focused Phase 4 redesign.
- Deferred rendering audit work, including pole-artifact review and deeper `/debug` checks, is tracked as an optional unnumbered milestone.
- The current rendering controls are limited to the layer panel and still need optional brightness tuning controls.
- Cross-device interaction still needs a final closeout verification pass.

## Next Experience

The next implementation slice focuses on Milestone 11 Phase 4: refining the HUD, selectors, and playback controls before closeout.

Focus areas:

- keep the current Sun, planet, and Moon behavior stable while the catalog boundary expands
- use the `SpiceNet` SSD catalog snapshot to choose candidate satellite kernels and benchmark generated web output
- keep fixed body assumptions behind a central registry that can drive ids, hierarchy, discovery groups, trails, labels, special presentation behavior, and future system views
- keep the reduced major-moon deployment stable while deferring fast undersampled moons to Milestone 13 sub-day cadence work
- move discovery and playback controls out of the informational HUD into dedicated, mobile-safe selector and control surfaces
- revisit generated-data chunking or file format only in Milestone 13 if the accepted `4` second deployed startup becomes a measured problem
- keep educational context and richer exploration modes as lower-priority proposals until the major-moon path is validated

## Long-Term Direction

- extend the current sky rendering controls with brightness tuning and optional readability presets
- continue validating constellation readability across the curated overlays
- support date and time selection plus different time rates
- expand the body catalog and educational context
- keep the final site compatible with static GitHub Pages hosting

## Non-Goals For The Current Phase

- live astronomy APIs or server-backed simulation
- realistic distances and sizes as the default presentation
- every minor moon, asteroid, dwarf planet, or spacecraft trajectory in the first catalog expansion
- generated ephemeris assets or upstream kernels committed to git
- long-form encyclopedia pages, quizzes, or guided tours in the first major-moon pass

## Workflow Expectations

- work in small incremental steps
- keep docs aligned with code
- explicitly mark planned work instead of describing it as already implemented
- pause after each meaningful step for user review
