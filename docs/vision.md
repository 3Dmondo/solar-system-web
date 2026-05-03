# Vision

## Product Goal

Build a static web-based solar system explorer that feels polished, readable, and educational on both desktop and mobile.

## Current Experience

The repository currently ships an overview-first solar-system scene with real-data startup and:

- generated ephemeris-driven positions loaded at startup, with explicit loading or error messaging when local or deployed data is unavailable
- Sun, all 8 planets, the Moon, and the reduced Milestone 11 major-moon set
- overview-to-body and planetary-system focus transitions driven by a dedicated `Jump to` selector plus double click or double tap for individual bodies, with `Jump to` still available while focused for direct switches and overview recovery
- directional camera easing that snaps the target onto the selected body center, approaches from the authored focus direction at about `10 x` body radius, and pulls back more decisively to overview
- orbit controls tuned separately for fine and coarse pointers
- an informational HUD, top-right selector rail, and bottom playback bar with play or pause, reverse or forward direction, bounded speed controls, and ephemeris-range pause warnings
- per-frame simulation-time advancement for smoother orbital motion
- chunk-derived orbital trails clipped by per-body default trail windows
- a real star-catalog sky layer with default-on constellation overlays, an aligned Milky Way texture background, and layer toggles
- continuous body self-rotation
- custom rendering passes for Venus, Earth, Moon, and Saturn

## Current Constraints

- The app starts from generated real snapshot data, but local development still requires generated assets in `public/ephemeris/generated/`.
- The current deployed generated dataset is the one-year reduced major-moons profile accepted by the pre-Milestone 13 local and deployed assessment; fast undersampled moons remain deferred to Milestone 13.
- The experience uses a cinematic scale model only.
- Discovery aids are functional for the reduced major-moon catalog, with selectable planetary-system rows plus dedicated selector and playback surfaces instead of embedded HUD controls.
- Deferred rendering audit work, including pole-artifact review and deeper `/debug` checks, is tracked as an optional unnumbered milestone.
- The current rendering controls are limited to the layer panel and still need optional brightness tuning controls.
- Cross-device interaction still needs a final closeout verification pass.

## Next Experience

The current implementation focus moves from Milestone 11 closeout to Milestone 13 fast-moon cadence work.

Focus areas:

- keep the current Sun, planet, Moon, and reduced major-moon behavior stable while fast undersampled moons are evaluated
- use the accepted one-year reduced-profile chunk baseline as the starting delivery shape for Milestone 13
- keep fixed body assumptions behind a central registry that can drive ids, hierarchy, discovery groups, trails, labels, special presentation behavior, and future system views
- reintroduce fast undersampled moons only after sub-day or equivalent cadence validation passes
- keep discovery and playback controls in dedicated, mobile-safe selector and control surfaces
- revisit generated-data chunking or file format only in Milestone 13 if restored fast-moon measurements show the accepted one-year JSON chunk baseline is insufficient
- keep optional rendering validation and deeper data-format optimization separate from the closed Milestone 11 scope

## Long-Term Direction

- extend the current sky rendering controls with brightness tuning and optional readability presets
- continue validating constellation readability across the curated overlays
- support date and time selection plus different time rates
- expand the body catalog and educational context
- keep the final site compatible with static GitHub Pages hosting

## Non-Goals For The Current Phase

- live astronomy APIs or server-backed simulation
- realistic distances and sizes as the default presentation
- every minor moon, asteroid, dwarf planet, or spacecraft trajectory in the next fast-moon pass
- generated ephemeris assets or upstream kernels committed to git
- long-form encyclopedia pages, quizzes, or guided tours in the fast-moon cadence pass

## Workflow Expectations

- work in small incremental steps
- keep docs aligned with code
- explicitly mark planned work instead of describing it as already implemented
- pause after each meaningful step for user review
