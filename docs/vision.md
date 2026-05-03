# Vision

## Product Goal

Build a static web-based solar system explorer that feels polished, readable, and educational on both desktop and mobile.

## Current Experience

The repository currently ships an overview-first solar-system scene with real-data startup and:

- generated ephemeris-driven positions loaded at startup, with explicit loading or error messaging when local or deployed data is unavailable
- Sun, all 8 planets, the Moon, and the expanded major-moon set with the Milestone 13 fast moons restored
- overview-to-body and planetary-system focus transitions driven by a dedicated `Jump to` selector plus double click or double tap for individual bodies, with `Jump to` still available while focused for direct switches and overview recovery
- directional camera easing that snaps the target onto the selected body center, approaches from the authored focus direction at about `10 x` body radius, and pulls back more decisively to overview
- orbit controls tuned separately for fine and coarse pointers
- an informational HUD, top-right selector rail, and bottom playback bar with play or pause, reverse or forward direction, bounded speed controls, and ephemeris-range pause warnings
- per-frame simulation-time advancement for smoother orbital motion
- chunk-derived orbital trails clipped by per-body default trail windows
- a real star-catalog sky layer with default-on constellation overlays, an aligned Milky Way texture background, and layer toggles
- continuous body self-rotation
- custom rendering passes for Venus, Earth, Moon, and Saturn
- reviewed mesh-backed non-spherical shapes for Phobos and Deimos, sharing the existing lighting, focus, label, indicator, selection, and trail behavior

## Current Constraints

- The app starts from generated real snapshot data, but local development still requires generated assets in `public/ephemeris/generated/`.
- The current deployed generated dataset is the one-year Milestone 13 targeted `4` samples/orbit major-moons profile, delivered through a pinned GitHub release asset.
- The experience uses a cinematic scale model only.
- Discovery aids are functional for the expanded major-moon catalog, with selectable planetary-system rows plus dedicated selector and playback surfaces instead of embedded HUD controls.
- Deferred rendering audit work, including pole-artifact review and deeper `/debug` checks, is tracked as an optional unnumbered milestone.
- The current rendering controls are limited to the layer panel and still need optional brightness tuning controls.
- Phobos and Deimos are the only mesh-backed moons in the current deployed catalog; additional moon meshes are deferred until size, orientation, and visible-value review.
- Cross-device interaction still needs ongoing regression checks as the catalog expands.

## Next Experience

The current implementation focus moves past Milestone 15 into the curated small-body expansion planned for Milestone 16, with optional rendering validation and data optimization only if future measurements justify it.

Focus areas:

- keep the current Sun, planet, Moon, and expanded major-moon behavior stable
- keep the accepted one-year JSON chunk delivery shape unless deployed measurements show a real user-facing issue
- keep fixed body assumptions behind a central registry that can drive ids, hierarchy, discovery groups, trails, labels, special presentation behavior, and future system views
- keep discovery and playback controls in dedicated, mobile-safe selector and control surfaces
- keep the Phobos and Deimos mesh path stable while preserving spherical fallback behavior for bodies without approved meshes
- revisit generated-data chunking or file format only if a later larger profile or deployed measurement shows the accepted one-year JSON chunk baseline is insufficient
- keep optional rendering validation and deeper data-format optimization separate from closed numbered milestones

## Long-Term Direction

- extend the current sky rendering controls with brightness tuning and optional readability presets
- continue validating constellation readability across the curated overlays
- support date and time selection plus different time rates
- expand the body catalog and educational context
- keep the final site compatible with static GitHub Pages hosting

## Non-Goals For The Current Phase

- live astronomy APIs or server-backed simulation
- realistic distances and sizes as the default presentation
- every minor moon, asteroid, dwarf planet, or spacecraft trajectory in the current deployed catalog
- generated ephemeris assets or upstream kernels committed to git
- long-form encyclopedia pages, quizzes, or guided tours in the current deployed catalog pass

## Workflow Expectations

- work in small incremental steps
- keep docs aligned with code
- explicitly mark planned work instead of describing it as already implemented
- pause after each meaningful step for user review
