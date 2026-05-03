# Roadmap

## Current Snapshot

- Milestone 1 foundation and featured-body rendering work is complete.
- Milestone 2 mocked overview work is complete, including browser smoke coverage and manual closeout verification.
- Milestone 3 interaction and readability work is complete, including the grouped `Jump to` chooser, eased focus transitions, a focused-mode overview return control, and manual closeout verification.
- Milestone 4 data-abstraction work is complete, including separated presentation metadata, the selector-backed `bodyStateStore`, and provider-backed scene consumers.
- Milestone 5 browser data-integration work is complete, with real ephemeris-driven positions from startup, simulation clock with playback controls, physical alignment across all bodies, lighting coherence with live Sun position, and a mobile lighting fix that replaces Three.js built-in lighting with custom world-space shaders across all materials. Reverse playback, explicit date picking, and additional browser coverage are deferred to later milestones.
- Milestone 6 body discovery and UI controls work is complete, with body indicator billboards for sub-pixel bodies, Sun impostor with bloom, layer visibility panel, and fullscreen button.
- Milestone 7 reference frames and trail UX work is complete, with reference frame selection (SSB/Earth-centered), satellite parent-relative trails, glowing trail rendering, UI selector, performance optimizations, and extended chunk prefetch.
- Milestone 9 sky catalog and rendering controls is complete, with real HYG star data, deterministic curated constellation overlays, and camera-centered sky anchoring.
- Milestone 10 rendering and performance refinement is complete for the shipped trail-rendering scope, with pole-artifact audit and deeper `/debug` validation deferred to an optional unnumbered milestone.
- Milestone 11 full solar system explorer work is complete. It delivered the central registry, reduced major-moon deployment path, HUD, selector, playback-control, ephemeris-range, educational context, and selectable planetary-system view passes; Milestone 13 later restored the deferred fast moons into the current default deployment.
- Milestone 12 Milky Way sky texture work is complete, with an aligned KTX2 Milky Way background, default-on constellations, default-on Milky Way layer, and 4k texture target after 8k browser memory testing.
- Milestone 13 fast moon cadence work is complete. The current GitHub Pages deployment uses the targeted `4` samples/orbit expanded major-moons release asset with one-year JSON chunks and restored Phobos, Deimos, Io, Europa, Mimas, Enceladus, Tethys, Dione, Ariel, and Miranda.
- Milestone 14 satellite texture and metadata work is complete. The current deployed major-moon set has approved NASA texture coverage where assets were available, and the committed body metadata snapshot now includes generated physical metadata for all current major moons.
- Milestone 15 non-spherical moon shape work is planned. It will prototype mesh-backed rendering for selected irregular moons, starting with Phobos and Deimos.
- Milestone 16 dwarf-planet and major-asteroid catalog work is planned. It will add a curated small-body expansion after kernel, metadata, UI-density, and static-delivery review.

## Milestone 1: Foundation And Planet Showcase

Status: Complete

Delivered:

- app scaffold, test tooling, and fullscreen shell
- desktop and mobile orbit controls
- focus state and camera helpers
- custom rendering passes for Saturn, Earth, and Moon
- GitHub Pages deployment workflow

## Milestone 2: Mocked Solar System Overview

Status: Complete

Delivered:

- Sun plus all 8 planets added to the mocked catalog
- overview-first camera framing and zoom-driven recovery path
- body self-rotation across the scene
- star background and mocked orbital trails
- texture-backed materials for the remaining overview bodies

## Milestone 3: Interaction And Readability Pass

Status: Complete

Goals:

- improve body discovery and re-selection in the multi-body scene
- refine focus choreography between overview and close view
- add minimal labels or guidance only if the current HUD is not enough
- improve trail and background readability
- verify the updated flow on desktop and mobile

## Milestone 4: Data Abstraction

Status: Complete

Goals:

- introduce a stable `BodyStateProvider`-style boundary
- split static body metadata from time-varying snapshot state
- support clean fixed-time snapshots
- route scene consumers through provider-backed data
- prepare the path for offline-generated ephemeris assets

Delivered:

- static body metadata split from time-varying mocked state
- synchronous `BodyStateProvider` types and mocked provider implementation
- `bodyStateStore` selectors for merged body definitions and metadata lookups
- provider-backed scene, HUD, focus, and trail consumers
- unit coverage for provider helpers and selector resolution

## Milestone 5: Real Positions And Time

Status: Complete

Goals:

- add a deployment-time preprocessing step that turns JPL or SPICE ephemerides into small static chunked assets plus kernel-derived body metadata
- integrate the accepted external `SpiceNet` `de440s` benchmark baseline and choose the final chunk duration empirically from measured browser results
- prefer compressed JSON as the first browser format and move to a custom binary payload only if benchmarks justify it
- keep the browser runtime focused on loading, caching, and interpolating prepared chunks rather than parsing raw kernel data by default
- consume `SpiceNet` as a pinned external preprocessing dependency
- download ephemeris files during CI or CD instead of versioning them in this repo
- evolve the provider path to support async snapshot loading and visible loading states without rewriting the whole scene again
- start from the current datetime with real-time advancement plus pause, reverse, and rate controls
- replace circular mock trails with sampled position history and support body-specific default trail windows
- benchmark chunk size, prefetch behavior, and startup latency so the overview stays smooth on mobile and desktop

Delivered:

- real ephemeris-driven positions from startup with explicit loading and error states
- simulation clock with pause, resume, and playback-rate controls
- sampled position history trails with body-specific windows
- physical alignment: axial orientation, sidereal rotation, Earth prime meridian, Saturn ring plane, Venus retrograde clouds, tidally locked Moon
- lighting coherence: Earth, Saturn, and Venus lighting tracks live Sun position
- mobile lighting fix: all materials use custom world-space shaders via meshBasicMaterial + onBeforeCompile to avoid mobile Chrome lighting inconsistencies
- shared shader utilities for world-space lighting, bump mapping, and shadow calculations

Deferred to later milestones:

- reverse playback
- explicit date picking
- browser coverage for real-data edge cases
- chunk-size and startup-latency benchmarking

## Milestone 6: Body Discovery And UI Controls

Status: Complete

Goals:

- add body indicator billboards that appear when bodies are too small to see, with auto-threshold based on screen-space radius
- make indicator billboards selectable with the same interaction model as body meshes
- handle indicator overlap when distant bodies cluster by applying a radial spread algorithm
- add a Sun impostor with bloom post-processing for visibility from far distances, blending smoothly with the rendered sphere
- add body labels as HTML overlays that help identify bodies at a glance
- add a collapsible layer visibility panel with toggles for trails, body indicators, and labels, designed for future cinematic-scale toggle
- add a floating fullscreen button in the top-right corner
- verify body discovery and selection work correctly on both desktop and mobile

Delivered:

- camera-facing ring indicator billboards with GLSL shader, auto-appearing below 4 px screen radius threshold
- indicator selection via click/tap using drei Billboard raycasting
- radial spread algorithm for overlapping indicators in screen space
- Sun impostor billboard with radial gradient shader and smooth opacity blend based on screen-space radius
- post-processing bloom effect via @react-three/postprocessing
- body labels using drei Html component with click-to-focus and auto-hide when body is large on screen
- collapsible layer visibility panel with toggles for trails, body indicators, and labels
- floating fullscreen button with Fullscreen API and graceful degradation
- useScreenSpaceRadius hook with batch computation support
- useLayerVisibility state management hook
- unit test coverage for screen-space radius and layer visibility logic

## Milestone 7: Reference Frames And Trail UX

Status: Complete

Goals:

- add reference-frame selection with SSB and Earth-centered options
- design extensible frame system for future body-centered views
- keep reference frame selection independent from focus/overview modes
- transform all body positions to selected frame origin
- render satellite trails always parent-relative regardless of frame
- replace trail rendering with glowing lines using additive blending
- extend trail history further into the past via background chunk prefetch

Delivered:

- reference frame state and transformation layer with 16 unit tests
- satellite parent-relative trail positioning for Moon orbit visibility
- glowing trail rendering with additive blending and tuned opacity
- reference frame selector UI with glassmorphic styling
- time-based relative trail sampling for proper cycloid/retrograde shapes in Earth-centered view
- performance optimizations: trail epoch quantization (100ms), cached relative samplers, one-time material setup
- extended chunk prefetch (2 previous chunks) and increased cache capacity (4 → 6) for outer planet trails
- different sample rate handling for bodies with varying cadences (e.g., Moon vs Earth)

Deferred:

- tail-fade treatment evaluation
- GPU-based trail transformation (TrailLineMaterial prepared but not yet integrated)

## Milestone 8: Cinematic View Mode

Status: Postponed

Goals:

- add an optional cinematic scale mode alongside the physically scaled view
- enlarge planet and moon radii non-linearly while keeping the real-scale mode available
- introduce extra separation offsets only for moons and other satellites so local systems stay readable without moving unrelated bodies
- label the cinematic mode clearly so it is understood as a non-physical presentation

## Milestone 9: Sky Catalog And Rendering Controls

Status: Complete

Goals:

- replace the decorative star sphere with a static sky built from a real star catalog such as Hipparcos
- render stars as point primitives such as `Three.Points`, with apparent size and brightness driven by real catalog data
- support optional constellation-line overlays from a static reference dataset
- add a rendering-configuration UI that stays minimized by default and uses as little screen space as possible
- design the controls so they remain clear and low-friction on both mobile and desktop

Delivered:

- HYG v4.2 star catalog filtered to naked-eye stars (magnitude ≤ 6.5), producing 8920 stars in ~500KB JSON
- star rendering via Three.Points with GLSL shaders for magnitude-based size and spectral-type-based color
- J2000 equatorial RA/Dec to ecliptic-aligned render frame coordinate transformation
- shared camera-centered sky anchor with clip-plane-aware shell scaling so sky layers stay visible at large overview zoom distances
- constellation line overlays for 34 curated constellations using a precomputed `THREE.LineSegments` geometry
- layer visibility toggles for stars and constellations in existing LayerPanel
- removed legacy decorative star texture (8k_stars_milky_way.jpg) saving ~1.9MB
- constellation data now regenerates deterministically from d3-celestial source geometry (BSD-3-Clause) for the curated 34-constellation set

## Milestone 10: Rendering And Performance Refinement

Status: Complete

Goals:

- make orbital trails thicker and more stable while preserving existing trail data and reference-frame behavior
- review production bundle output after rendering changes
- keep stars, constellations, and new user-facing rendering controls out of this milestone

Delivered:

- trail rendering now uses constant-width opaque screen-space ribbons with consistent overview and focused-view appearance
- trail sampling now resamples from the existing Hermite interpolation path with per-body cadence multipliers
- ready previous chunks are stitched into trail history so long trail windows are not capped by the active chunk start after prefetch warms the cache
- production build output was reviewed for bundle-size regressions

Deferred to optional rendering audit and validation milestone:

- manual overview and focused-view trail readability checks
- pole-artifact audit and targeted mitigation
- deeper `/debug` checks with updated trails visible

## Optional Milestone: Rendering Audit And Validation

Status: Optional Backlog

Goals:

- verify updated trail readability in overview and focused views
- audit pole artifacts across the Sun, all planets, and the Moon
- apply targeted pole-artifact fixes only after the affected bodies and material paths are confirmed
- check `/debug` behavior with updated trails visible
- add mobile fallbacks only if measured or manual validation shows a real issue

## Milestone 11: Full Solar System Explorer

Status: Complete

Goals:

- broaden the body catalog through a curated major natural satellite expansion
- use the `SpiceNet` SSD catalog snapshot to choose and benchmark candidate satellite kernels before changing the default deployed dataset
- replace fixed body assumptions with a central registry that can drive IDs, hierarchy, discovery groups, trails, labels, and future system views
- propose lightweight educational context and richer exploration modes as lower-priority follow-up tracks

Delivered:

- central current-body registry now drives `BodyId`, NAIF lookups, hierarchy, presentation metadata, and HUD jump-menu grouping
- curated major-moon registry entries were first loaded from the reduced deployed generated-data profile; Milestone 13 later restored the fast undersampled moons in the current default profile
- reference-frame options now derive from loaded satellite systems, so expanded catalogs can expose parent-centered frames without hard-coding each system into the UI
- schema-1 generated-data parsing now tolerates partial generated physical metadata for staged expanded bodies while preserving full baseline metadata behavior
- remaining catalog-growth runtime assumptions needed for this phase are now registry-driven, including Earth prime-meridian spin initialization metadata
- a separate `SpiceNet` `expanded-major-moons` generation script now records the selected SSD kernels, body ids, parent ids, and starter cadence defaults without changing the baseline profile
- the first expanded configured-cadence benchmark ran from the local SSD cache; output size is plausible for inspection, but fast-moon interpolation errors require a reduced Milestone 11 dataset before adoption
- the first full expanded generated manifest and chunks remain unversioned, while the reduced deployed profile is pinned through a GitHub release asset to keep Pages builds from redownloading multi-gigabyte kernels
- Phase 3 shipped the reduced `expanded-major-moons` profile through the default deployed static asset path using a pinned GitHub release artifact
- the reduced preview target temporarily removes fast undersampled moons, keeping the slower major moons for Phase 3 while Milestone 13 handles sub-day cadence
- Phase 2B local validation passed well enough to proceed, with final timing and memory confidence deferred to the deployed GitHub Pages path
- Phase 3 UI/readability work delivered satellite indicator and label distance gating, a satellite visibility toggle, mobile control layout fixes, deployed reduced-profile validation, and static Pages compatibility
- Phase 4 closed the HUD and discovery UI redesign: Quick picks were removed, `Jump to` moved into an isolated selector with `Overview` as the first row, selectors are height-constrained and scrollable when needed, simulation time and playback controls moved to the bottom center, playback now uses one play or pause action plus explicit direction and bounded speed controls, ephemeris range boundaries clamp and pause with a clear HUD warning, help moved near fullscreen, and the main HUD is informational
- Phase 5 closed the lower-priority educational context proposal with a read-only focused-body facts drawer backed by generated physical facts and two short Wikipedia-sourced description paragraphs; quizzes, tours, and long-form pages remain deferred
- Phase 6 closed with selectable planetary-system rows in `Jump to`; selecting a system keeps the active reference frame unchanged while transitioning to the parent planet from a padded distance that frames the loaded satellites
- the pre-Milestone 13 one-year reduced-profile chunk evaluation passed locally and on the deployed GitHub Pages build; Milestone 13 kept one-year JSON chunks for the restored fast-moon profile
- Milestone 11 closeout is complete; its fast-moon cadence follow-up was resolved in Milestone 13

Resolved By Milestone 13:

- sub-day fast-moon cadence support and restored fast-moon deployment
- one-year chunk adoption for the restored profile after benchmark and deployed validation
- data-format changes were not needed for the accepted restored profile

Optional follow-up:

- `docs/tasks/optional-expanded-data-optimization-after-deploy.md`

Deferred until the major-moon path is validated:

- Pluto and Charon
- asteroid packs
- spacecraft trajectories
- long-tail minor moons

## Milestone 12: Milky Way Sky Texture Layer

Status: Complete

Goals:

- add a toggleable Milky Way texture layer behind the real star catalog
- use a generated KTX2 ETC1S asset from the source EXR, defaulting to no mipmaps
- keep the source EXR out of the repository unless explicitly approved
- document attribution and conversion workflow for the generated sky asset

Delivered:

- default-on Milky Way layer toggle and KTX2 runtime loading path
- default-on constellation layer
- Basis transcoder files served from `public/basis/`
- generated `4096x2048` ETC1S KTX2 texture at `public/sky/milky-way.etc1s.ktx2`
- direction-based galactic texture sampling aligned to the RA/Dec-derived star layer
- reduced Milky Way brightness, planet depth occlusion, and rejected `8192x4096` texture after browser memory testing

## Milestone 13: Fast Moon Cadence

Status: Complete

Goals:

- add sub-day or equivalent fast-satellite sampling support for deferred major moons
- own fast-moon profiling, tuning, truth diagnostics, and cadence selection that were removed from Milestone 11
- reintroduce Phobos, Deimos, Io, Europa, Mimas, Enceladus, Tethys, Dione, Ariel, and Miranda after cadence validation
- benchmark restored fast-moon output size, interpolation error, parse cost, and browser memory
- use the accepted one-year reduced-profile chunk assessment as the starting static-delivery baseline
- validate dense local-system views, parent-relative trails, jump-menu behavior, and focused playback before default adoption

Delivered:

- fractional-day `SampleDays` support in the sibling `SpiceNet` web-data generator without a manifest schema change
- benchmark tooling for integer-day, targeted `4` samples/orbit, and high-quality `8` samples/orbit profiles
- restored fast moons in the deployed expanded major-moons profile: Phobos, Deimos, Io, Europa, Mimas, Enceladus, Tethys, Dione, Ariel, and Miranda
- targeted `4` samples/orbit profile adopted after normalized error review, local visual inspection, and deployed GitHub Pages validation
- one-year JSON chunks retained for the restored profile, with generated data still shipped through a pinned GitHub release asset rather than committed to git
- available texture inventory reviewed; restored fast moons without local dedicated assets use the solid-color fallback

## Milestone 14: Satellite Textures And Physical Metadata

Status: Complete

Goals:

- adopt approved NASA texture assets for the full currently deployed major-moon catalog
- refresh committed generated physical metadata so current satellites receive radii, shape fields, pole orientation, rotation, and GM-derived facts when SPICE provides them
- inventory NASA 3D moon model availability without adding production GLTF rendering

Delivered:

- added NASA 3D Resources JPG textures for Phobos, Deimos, Io, Europa, Mimas, Enceladus, Tethys, Dione, Ariel, and Miranda
- preserved the existing reduced major-moon texture assets and routed the full deployed major-moon set through the shared texture-backed material path
- refreshed `public/ephemeris/body-metadata.json` for all 29 current deployed body ids
- updated the sibling SpiceNet metadata snapshot script so future refreshes request the full current web body set
- documented Phobos and Deimos as the first future non-spherical mesh candidates, with other moon GLTF/USDZ sizes recorded for later review

## Milestone 15: Non-Spherical Moon Shapes

Status: Planned

Goals:

- add a production-ready non-spherical rendering path for selected irregular moons
- start with Phobos and Deimos using the NASA model inventory documented in Milestone 14
- preserve the existing physical pole, spin, lighting, focus, selection, label, indicator, and trail contracts
- keep spherical rendering as the fallback for every body without an approved runtime mesh
- measure mesh asset and bundle impact for the static GitHub Pages delivery path

## Milestone 16: Dwarf Planets And Major Asteroids

Status: Planned

Goals:

- add a curated small-body generated-data profile for dwarf planets and major asteroids
- review Pluto, Charon, Ceres, and Vesta as the first candidate tier
- add registry, selector, facts, trail, label, and indicator support for accepted bodies
- keep generated assets static and release-asset-backed by default
- defer broad minor-body catalogs, spacecraft trajectories, and asteroid-belt particle clouds
