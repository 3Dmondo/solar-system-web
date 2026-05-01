# Architecture

## Current Stack

- React 19 plus TypeScript 5
- Vite 7 for local development and static build output
- Three.js through `@react-three/fiber` and `@react-three/drei`
- Vitest plus React Testing Library for unit and component tests
- Playwright for browser smoke coverage
- GitHub Actions for Pages deployment
- `pnpm` as the package manager

## Source Map

- App entry: `src/main.tsx`, `src/App.tsx`
- Versioned kernel-derived metadata snapshot: `public/ephemeris/body-metadata.json`
- Local generated ephemeris asset root: `public/ephemeris/generated/`
- Generated Milky Way sky texture target: `public/sky/milky-way.etc1s.ktx2`
- Basis Universal transcoder runtime files for KTX2 sky textures: `public/basis/`
- Local ephemeris helper: `scripts/Ensure-LocalWebEphemerisData.ps1`
- Expanded major-moons preview helper: `scripts/Stage-ExpandedMajorMoonsPreview.ps1`
- Experience shell and HUD: `src/features/experience`
- Solar-system domain, data, components, and rendering helpers: `src/features/solar-system`
- Static textures: `assets/textures`
- Browser smoke tests: `tests/e2e`
- Deployment workflow: `.github/workflows/deploy-pages.yml`

## Current Runtime Shape

- `App` renders `SolarSystemExperience` and now defaults to the generated web-data catalog at `./ephemeris/generated`, with `VITE_WEB_EPHEMERIS_DATA_BASE_URL` plus `VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER` available as overrides. The deployed `./ephemeris/generated` profile is the reduced expanded-major-moons release artifact. `VITE_WEB_EPHEMERIS_PROFILE=expanded-major-moons` remains an opt-in local preview path that points at ignored assets staged under `./ephemeris/generated-expanded-major-moons`.
- Visiting `/debug` on the current host enables a lightweight FPS overlay for local performance sampling, starts the clock from the Milestone 5.1 benchmark timestamp by default, and adds debug-only timing samples across generated-data loads, chunk parsing, and the main runtime phases without changing the normal route behavior. The overlay also shows JS heap use when the browser exposes `performance.memory`.
- When the external source is enabled, the runtime loads generated manifest and chunk assets from the configured data base URL and uses the committed `public/ephemeris/body-metadata.json` snapshot by default, with an optional explicit metadata-URL override.
- The agreed local generated-asset convention is `public/ephemeris/generated/`, which is served from `./ephemeris/generated` when the runtime is pointed at local generated data.
- The expanded major-moons preview convention is `public/ephemeris/generated-expanded-major-moons/`, staged from the sibling reduced `SpiceNet` output by `scripts/Stage-ExpandedMajorMoonsPreview.ps1` and kept out of git except for `.gitkeep`. The staging helper blocks the Milestone 13 fast-moon ids unless explicitly overridden for future sub-day validation. `scripts/Package-ReducedMajorMoonsReleaseAsset.ps1` packages that staged reduced profile into the GitHub release asset consumed by Pages.
- The first real-data activation pass uses a default physical scale of `0.001` scene units per kilometer unless `VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER` overrides it.
- Real positions and kernel-derived mean radii still share that one explicit km-to-scene factor; the runtime does not apply a second hidden scale to body positions.
- The scene now presents real positions through one explicit frame transform: raw J2000 ephemeris vectors are rotated into a J2000-ecliptic-aligned render frame and then mapped into the app's `x/z` orbital plane with `y` up before focus, controls, and rendering consume them.
- `SolarSystemExperience` owns the focused target state, coarse-pointer detection, the simulation clock, and the resolved body-catalog hook.
- `ExperienceScene` creates the `Canvas`, lighting, focus camera rig, the sky layers, orbital trails, and the planet list from the current resolved catalog.
- The Milky Way sky texture layer is wired as a KTX2 asset at `./sky/milky-way.etc1s.ktx2`, defaults visible, and remains user-toggleable. Missing generated texture assets fail quietly so normal development remains usable if the generated asset is absent.
- The focus camera now keeps the authored overview angle but derives overview framing distance, orbit-control zoom bounds, and camera clip planes from the loaded scene extents so the physically scaled Milestone 5 catalog remains navigable.
- Overview mode now keeps the broad scene framing but allows a much closer minimum zoom distance in the physically scaled runtime so planets can be inspected manually without leaving overview.
- Entering focus mode now snaps the orbit target directly onto the selected body's center and uses a simple default focused framing distance of about `10 x` the planet radius from the authored focus direction.
- Focused-body tracking now uses a split update path: live ephemeris refreshes keep the target snapped to the live body center while the camera eases into the authored focused framing, and the transition path is translated with live body motion before the settled translated-follow path takes over so manual orbit and zoom adjustments are preserved, with those focused follow updates applied in a layout-synchronized pass before paint rather than after paint.
- `ExperienceHud` shows the current target label, a grouped `Jump to` chooser whenever real bodies are loaded, short instructions, the current simulation time, pause or resume plus playback-rate controls, the help overlay, focused-mode overview recovery, and runtime loading or error messages.
- The app still starts in the `overview` target, and smaller scenes keep the legacy `[0, 14, 46]` overview framing.

## Interaction Model

- Desktop: drag to orbit, wheel to zoom, double click a body to focus it.
- Mobile: drag to orbit, pinch to zoom, double tap a body to focus it.
- The HUD exposes a `Jump to` button whenever real bodies are loaded, so you can switch directly between bodies without returning to overview first.
- Focus transitions are eased, can be interrupted by user input, and use directional profiles so body-to-overview moves pull back faster.
- Focus transitions now keep the selected body centered from the start of the move by snapping the controls target to the selected body before the camera eases into its authored focused distance.
- The HUD exposes an `Overview` button while a body is focused, and zooming back out still works as a secondary recovery path.
- Orbit control tuning differs for coarse and fine pointers through `getControlProfile`.
- The fullscreen button toggles immersive mode using the browser Fullscreen API with graceful degradation on unsupported browsers.
- The layer panel provides toggles for orbital trails, body indicators, labels, satellites, stars, constellations, and the Milky Way texture layer, collapsible to save screen space. Satellites, Milky Way, stars, and constellations are visible by default; turning satellites off hides natural-satellite bodies and their trails, labels, and indicators while keeping planets available.
- The reference-frame selector derives its menu from loaded satellite systems. The deployed reduced catalog exposes SSB plus loaded parent-centered frames such as Earth, Jupiter, Saturn, Uranus, and Neptune when their moons are present.

## Data And Domain Boundaries

- `BODY_REGISTRY` in `src/features/solar-system/domain/body.ts` is the central registry for ids, NAIF mappings, hierarchy, body category, system grouping, display names, colors, default trail windows, special spin-initialization strategy, and HUD jump-menu grouping. It includes the deployed Sun, planet, Moon, and reduced major-moon set plus long-term entries for Milestone 13 fast moons that remain filtered out until their generated data is restored. Jump-menu membership lives on registry entries, `BODY_JUMP_GROUPS` and `BODY_SYSTEM_GROUPS` are derived from that metadata, and `getBodyDiscoveryGroups` combines quick picks with non-duplicated loaded system bodies for the HUD. Registry category and hierarchy helpers also drive scene star handling, body-indicator exclusion, textured star material behavior, and satellite tidal-lock parent targeting.
- `bodyPresentation.ts` derives the shared display metadata from `BODY_REGISTRY` so it stays stable across data sources while keeping the existing provider-facing metadata shape.
- `bodyStateStore.ts` is the current selector layer and shared resolved-catalog shape used by async loaders and scene consumers.
- `useResolvedBodyCatalog` in `src/features/experience/state` is the current runtime seam that now surfaces an explicit empty loading or error catalog before the first real dataset load and keeps the last successfully loaded real catalog visible during later refresh failures.
- `useSimulationClock` in `src/features/experience/state` currently starts from the current datetime, advances the requested UTC time on every animation frame by default, supports pause or resume, exposes one minimal playback-rate cycle across the current forward-speed presets, and emits a stable `simulationInitialUtcMs` used to anchor Earth's prime-meridian orientation.
- `SimulationClockContext` in `src/features/experience/state` exposes `playbackRateMultiplier`, `isPaused`, and `simulationInitialUtcMs` via React context so all rotation consumers share one source of truth without prop drilling.
- `referenceFrame.ts` keeps SSB plus registry-derived body-centered frame definitions and builds the active frame menu from loaded parent-satellite systems.
- `webBodyCatalogSource.ts` composes the cached dataset loader, async ephemeris provider, the shared J2000-to-scene frame transform, and uniform physical scaling into the resolved-catalog shape, including focus offsets that scale with the physically derived radii inside that same scene frame when generated radius metadata is available. It filters presentation metadata to the body ids present in the loaded generated-data manifest before physical scaling, so future registry entries do not require the current deployed manifest or metadata snapshot to contain them, tolerates partial or missing generated physical metadata for expanded bodies by preserving presentation fallback values, and reuses the scaled metadata across clock-driven refreshes instead of rebuilding that static layer every tick.
- `webEphemerisProvider.ts` now derives a first trail-history payload from the active loaded chunk using body-specific default windows before that data is mapped into scene space, and the current runtime caches per-chunk trail sampler state so stable interior trail segments can be reused across nearby frames.
- `webBodyCatalogRuntime.ts` now resolves the generated data base URL and first-pass scene scale from defaults unless runtime env overrides are supplied, and it resolves physical body metadata from the committed `public/ephemeris/body-metadata.json` snapshot unless a dedicated metadata URL override is provided.
- The physical alignment pass is now complete: `mapPhysicalMetadataToScaledBodyMetadata` transforms each body's `northPoleUnitVectorJ2000` through the J2000-to-render-frame matrix and computes a signed angular velocity from the sidereal rotation period and retrograde flag, emitting `poleDirectionRender` and `angularVelocityRadPerSec` on every `BodyMetadata` entry consumed by the scene. Earth also carries a registry-derived `spinInitialPhaseStrategy` so its prime meridian starts aligned to the simulation's solar-noon anchor without a renderer body-id check.
- `BodyId`, `ViewTargetId`, and `BodyDefinition` live in `src/features/solar-system/domain/body.ts`. `BodyId` is derived from `BODY_REGISTRY`, and `BodyMetadata` carries optional `poleDirectionRender` (north-pole unit vector in render space) and `angularVelocityRadPerSec` (signed physical spin rate) alongside radius and focus offset when generated metadata is complete enough to derive them.
- `focus.ts` contains the current camera target and position helpers.
- `focus.ts` also contains directional transition profiles plus helpers that preserve the current view direction when deriving a focused camera position.
- `scales.ts` currently contains only a small label helper for the planned scale-mode concept.

## Rendering Model

- Body indicators render camera-facing ring billboards for bodies whose screen-space radius is below the visibility threshold (4 px). The indicators use a custom GLSL ring shader and smooth opacity transitions during zoom. Satellite indicators are additionally hidden in distant overview contexts when their projected separation from the parent planet is too small, but remain available in parent or satellite focused views.
- Body labels render as HTML overlays using drei's `Html` component, positioned above each body. Labels auto-hide when the body is large on screen (> 80 px radius) and are clickable to focus the body. Satellite labels share the same parent-separation gate as indicators so global overviews stay readable while focused local-system views can still expose moon labels.
- The Sun impostor is a camera-facing billboard with a radial-gradient shader that remains visible when the Sun sphere is too small to see. It blends opacity based on screen-space radius thresholds (appears below 15 px, full opacity below 3 px).
- Post-processing uses `@react-three/postprocessing` for a subtle bloom effect on the Sun impostor.
- Lighting uses custom world-space shaders on all planet materials. The scene has only a small ambient light for non-custom materials (e.g., orbit trails); there is no PointLight.
- All planet materials use `meshBasicMaterial` as a base with `onBeforeCompile` shader injection to compute world-space diffuse lighting. This avoids view-matrix inconsistencies that caused incorrect lighting on mobile Chrome/Android with Three.js built-in lighting.
- Shared shader utilities live in `src/features/solar-system/rendering/shaderChunks.ts` (GLSL snippets) and `shaderInjection.ts` (injection helpers). The `useWorldSpaceLighting` hook manages light-direction uniforms and per-frame updates.
- Bump mapping (Moon) and normal mapping (Earth) use fixed UV offsets instead of screen-space derivatives for consistent results at any zoom level.
- Ring shadows (Saturn) and cloud layers (Earth, Venus) apply shadow/lighting only to the diffuse component, naturally blending at the terminator without artificial cutoffs.
- `StarField` renders real stars from the HYG v4.2 catalog as `Three.Points` under a shared camera-centered sky anchor. The shader uses spectral-type color tinting and the current linear brightness and point-size tuning. The catalog contains 8,920 naked-eye stars loaded from `public/stars/catalog.json`.
- `MilkyWayLayer` renders a default-on inward-facing sky sphere under the same shared sky anchor, scaled to half the shared sky shell so it stays comfortably inside the camera far plane while catalog stars remain on the outer shell. It loads the generated `4096x2048` ETC1S KTX2 texture at `public/sky/milky-way.etc1s.ktx2` through Three.js `KTX2Loader` with Basis transcoder files served from `public/basis/`, uses sRGB color with reduced shader brightness, tests depth without writing depth so planets occlude it, and currently ships without mipmaps. The source is NASA SVS `milkyway_2020_8k_gal.exr`, a galactic-coordinate Milky Way background; an `8192x4096` test asset was rejected after browser memory testing. The shader samples by render-space direction, converting through J2000 equatorial space into galactic longitude/latitude before deriving NASA plate carree UVs, so the texture aligns with the RA/Dec-derived star layer instead of relying on sphere UV orientation.
- `ConstellationLines` renders a single precomputed `THREE.LineSegments` geometry under the same shared sky anchor. The current `public/stars/constellations.json` dataset contains 34 curated constellation figures regenerated from d3-celestial source geometry.
- Star and constellation coordinates use J2000 equatorial RA/Dec transformed to the ecliptic-aligned render frame via `raHoursDecDegreesToRenderFrame` in `starCatalog.ts`, then uploaded once and reused across frames.
- `scripts/Convert-ConstellationLines.ps1` is the current deterministic path for regenerating the curated constellation dataset from d3-celestial while preserving the selected constellation ID set and display names.
- `SkyLayer` keeps Milky Way, stars, and constellations centered on the camera and scales the shared sky shell each frame from the active camera near/far clip planes so sky layers remain visible across overview and focused zoom ranges.
- Star and constellation vertex data remains static after upload; only the shared sky anchor transform is updated each frame.
- The planned sky evolution still includes better visual tuning, possible star brightness controls, proper motion animation, star name labels, and constellation name overlays.
- Orbital trails now render interpolated history from the active loaded chunk plus any contiguous ready previous chunks, clipped by body-specific default trail windows, resampled with per-body cadence multipliers from presentation metadata, and styled as constant-width opaque screen-space ribbons so sampled point joins do not create additive hot spots. Runtime prefetch warms the active chunk, next chunk, and the loaded catalog's trail-history previous chunks; the default cache budget expands from a minimum of `6` chunks to cover loaded trail history plus active and next chunks for smaller chunk-year profiles without unbounded growth.
- `PlanetBody` routes each body to either a custom material pipeline or the shared textured-material path.
- Bodies with `material: 'basic'` use `SolidBodyMaterial`, a shared lit solid-color path for staged catalog bodies that do not yet have texture assets.
- Every body mesh now rotates around its physical north-pole axis at its physical sidereal rate via a quaternion composed of a pole-alignment quaternion and a per-frame spin quaternion. Rotation is driven by `simDelta = delta × playbackRateMultiplier × (isPaused ? 0 : 1)` so it stays consistent with the simulation clock.
- The Moon is tidally locked: its spin angle is derived each frame from the Moon-to-Earth direction projected onto its equatorial plane, keeping the same face toward Earth at all simulation speeds.
- Saturn uses a custom surface material and a ring mesh whose plane is kept perpendicular to Saturn's physical spin axis by orienting it with a quaternion derived from the metadata pole direction. The `ringNormal` shader uniform in `SaturnSurfaceMaterial` uses the same pole vector so ring shadows remain geometrically consistent with the ring mesh.
- Earth uses day, night, normal, specular, and cloud layers. The cloud shell and the cloud-shadow UV offset in the surface shader advance in sync around Earth's tilted pole axis at the same angular rate. The surface shader samples cloud shadows using an `earthPoleDirection` uniform (from metadata) instead of world Y so shadow latitude rings track the correct axis. Earth's prime meridian is anchored to solar noon at simulation start and advances at the physical sidereal rate.
- Venus uses a textured surface plus a cloud shell that rotates retrograde around Venus's tilted pole, drifting relative to the surface for visible atmospheric super-rotation.
- Moon uses texture and height data for extra relief.
- The remaining bodies use shared texture-driven materials from `bodyTextures.ts`.

## Testing And Validation

Passing checks in the current repo state:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

Additional notes:

- `pnpm test` runs Vitest only. It does not cover live canvas interaction in a real browser.
- `pnpm test:e2e` is separate and requires `pnpm exec playwright install` plus a local preview server at `http://127.0.0.1:4173`.
- The checked-in Playwright smoke spec now covers the overview HUD startup flow on desktop and mobile browser projects.
- The deployed reduced major-moon profile currently starts in about `4` seconds, which is acceptable for Milestone 11; chunk-size and file-format optimization are deferred to Milestone 13.

## Deployment

- GitHub Pages deployment is defined in `.github/workflows/deploy-pages.yml`.
- The workflow builds on pushes to `master` and on manual dispatch.
- The workflow downloads the pinned GitHub release asset `ephemeris-expanded-major-moons-reduced-v1.zip` from release tag `ephemeris-expanded-major-moons-reduced-v1`, expands it into `public/ephemeris/generated/`, validates that deferred Milestone 13 fast-moon ids are absent, and publishes those generated assets through the normal `dist/` artifact without committing them to git. `scripts/Package-ReducedMajorMoonsReleaseAsset.ps1` packages the ignored staged preview assets into that release-asset shape.
- `vite.config.ts` uses `/solar-system-web/` as the base during GitHub Actions builds and `./` locally.
- Static texture imports are bundled through Vite so they work from the project-site base path.

## Known Gaps And Planned Refactors

- Finish manual desktop and mobile validation for the current multi-body overview.
- Finish visual tuning and validation for the current real sky background and curated constellation overlays.
- Extend the minimized rendering-settings UI with sky-specific controls such as brightness.
- Address visible pole artifacts on some body textures.
- Evaluate bundle-size reductions if the current single chunk keeps growing.
- Revisit reduced major-moon chunk duration and data format in Milestone 13 only if later measurements justify it.
