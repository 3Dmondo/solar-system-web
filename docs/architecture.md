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
- Local ephemeris helper: `scripts/Ensure-LocalWebEphemerisData.ps1`
- Experience shell and HUD: `src/features/experience`
- Solar-system domain, data, components, and rendering helpers: `src/features/solar-system`
- Static textures: `assets/textures`
- Browser smoke tests: `tests/e2e`
- Deployment workflow: `.github/workflows/deploy-pages.yml`

## Current Runtime Shape

- `App` renders `SolarSystemExperience` and now defaults to the generated web-data catalog at `./ephemeris/generated`, with `VITE_WEB_EPHEMERIS_DATA_BASE_URL` plus `VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER` available as overrides.
- Visiting `/debug` on the current host enables a lightweight FPS overlay for local performance sampling, starts the clock from the Milestone 5.1 benchmark timestamp by default, and adds debug-only timing samples across the main runtime phases without changing the normal route behavior.
- When the external source is enabled, the runtime loads generated manifest and chunk assets from the configured data base URL and uses the committed `public/ephemeris/body-metadata.json` snapshot by default, with an optional explicit metadata-URL override.
- The agreed local generated-asset convention is `public/ephemeris/generated/`, which is served from `./ephemeris/generated` when the runtime is pointed at local generated data.
- The first real-data activation pass uses a default physical scale of `0.001` scene units per kilometer unless `VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER` overrides it.
- Real positions and kernel-derived mean radii still share that one explicit km-to-scene factor; the runtime does not apply a second hidden scale to body positions.
- The scene now presents real positions through one explicit frame transform: raw J2000 ephemeris vectors are rotated into a J2000-ecliptic-aligned render frame and then mapped into the app's `x/z` orbital plane with `y` up before focus, controls, and rendering consume them.
- `SolarSystemExperience` owns the focused target state, coarse-pointer detection, the simulation clock, and the resolved body-catalog hook.
- `ExperienceScene` creates the `Canvas`, lighting, focus camera rig, the sky layers, orbital trails, and the planet list from the current resolved catalog.
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
- The layer panel provides toggles for orbital trails and body indicators, collapsible to save screen space.

## Data And Domain Boundaries

- `bodyPresentation.ts` contains the shared display metadata that stays stable across data sources.
- `bodyStateStore.ts` is the current selector layer and shared resolved-catalog shape used by async loaders and scene consumers.
- `useResolvedBodyCatalog` in `src/features/experience/state` is the current runtime seam that now surfaces an explicit empty loading or error catalog before the first real dataset load and keeps the last successfully loaded real catalog visible during later refresh failures.
- `useSimulationClock` in `src/features/experience/state` currently starts from the current datetime, advances the requested UTC time on every animation frame by default, supports pause or resume, exposes one minimal playback-rate cycle across the current forward-speed presets, and emits a stable `simulationInitialUtcMs` used to anchor Earth's prime-meridian orientation.
- `SimulationClockContext` in `src/features/experience/state` exposes `playbackRateMultiplier`, `isPaused`, and `simulationInitialUtcMs` via React context so all rotation consumers share one source of truth without prop drilling.
- `webBodyCatalogSource.ts` composes the cached dataset loader, async ephemeris provider, the shared J2000-to-scene frame transform, and uniform physical scaling into the resolved-catalog shape, including focus offsets that scale with the physically derived radii inside that same scene frame, and it now reuses the scaled metadata across clock-driven refreshes instead of rebuilding that static layer every tick.
- `webEphemerisProvider.ts` now derives a first trail-history payload from the active loaded chunk using body-specific default windows before that data is mapped into scene space, and the current runtime caches per-chunk trail sampler state so stable interior trail segments can be reused across nearby frames.
- `webBodyCatalogRuntime.ts` now resolves the generated data base URL and first-pass scene scale from defaults unless runtime env overrides are supplied, and it resolves physical body metadata from the committed `public/ephemeris/body-metadata.json` snapshot unless a dedicated metadata URL override is provided.
- The physical alignment pass is now complete: `mapPhysicalMetadataToScaledBodyMetadata` transforms each body's `northPoleUnitVectorJ2000` through the J2000-to-render-frame matrix and computes a signed angular velocity from the sidereal rotation period and retrograde flag, emitting `poleDirectionRender` and `angularVelocityRadPerSec` on every `BodyMetadata` entry consumed by the scene.
- `BodyId`, `ViewTargetId`, and `BodyDefinition` live in `src/features/solar-system/domain/body.ts`. `BodyMetadata` now carries `poleDirectionRender` (north-pole unit vector in render space) and `angularVelocityRadPerSec` (signed physical spin rate) alongside radius and focus offset.
- `focus.ts` contains the current camera target and position helpers.
- `focus.ts` also contains directional transition profiles plus helpers that preserve the current view direction when deriving a focused camera position.
- `scales.ts` currently contains only a small label helper for the planned scale-mode concept.

## Rendering Model

- Body indicators render camera-facing ring billboards for bodies whose screen-space radius is below the visibility threshold (4 px). The indicators use a custom GLSL ring shader and smooth opacity transitions during zoom.
- Body labels render as HTML overlays using drei's `Html` component, positioned above each body. Labels auto-hide when the body is large on screen (> 80 px radius) and are clickable to focus the body.
- The Sun impostor is a camera-facing billboard with a radial-gradient shader that remains visible when the Sun sphere is too small to see. It blends opacity based on screen-space radius thresholds (appears below 15 px, full opacity below 3 px).
- Post-processing uses `@react-three/postprocessing` for a subtle bloom effect on the Sun impostor.
- Lighting uses custom world-space shaders on all planet materials. The scene has only a small ambient light for non-custom materials (e.g., orbit trails); there is no PointLight.
- All planet materials use `meshBasicMaterial` as a base with `onBeforeCompile` shader injection to compute world-space diffuse lighting. This avoids view-matrix inconsistencies that caused incorrect lighting on mobile Chrome/Android with Three.js built-in lighting.
- Shared shader utilities live in `src/features/solar-system/rendering/shaderChunks.ts` (GLSL snippets) and `shaderInjection.ts` (injection helpers). The `useWorldSpaceLighting` hook manages light-direction uniforms and per-frame updates.
- Bump mapping (Moon) and normal mapping (Earth) use fixed UV offsets instead of screen-space derivatives for consistent results at any zoom level.
- Ring shadows (Saturn) and cloud layers (Earth, Venus) apply shadow/lighting only to the diffuse component, naturally blending at the terminator without artificial cutoffs.
- `StarField` renders real stars from the HYG v4.2 catalog as `Three.Points` under a shared camera-centered sky anchor. The shader uses spectral-type color tinting and the current linear brightness and point-size tuning. The catalog contains 8,920 naked-eye stars loaded from `public/stars/catalog.json`.
- `ConstellationLines` renders a single precomputed `THREE.LineSegments` geometry under the same shared sky anchor. The current `public/stars/constellations.json` dataset contains 34 curated constellation figures.
- Star and constellation coordinates use J2000 equatorial RA/Dec transformed to the ecliptic-aligned render frame via `raHoursDecDegreesToRenderFrame` in `starCatalog.ts`, then uploaded once and reused across frames.
- `SkyLayer` keeps stars and constellations centered on the camera and scales the shared sky shell each frame from the active camera near/far clip planes so both layers remain visible across overview and focused zoom ranges.
- Star and constellation vertex data remains static after upload; only the shared sky anchor transform is updated each frame.
- The planned sky evolution still includes better visual tuning, possible star brightness controls, proper motion animation, star name labels, and constellation name overlays.
- Orbital trails now render sampled history from the active loaded chunk, clipped by body-specific default trail windows and lightly emphasized for the focused body.
- `PlanetBody` routes each body to either a custom material pipeline or the shared textured-material path.
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

## Deployment

- GitHub Pages deployment is defined in `.github/workflows/deploy-pages.yml`.
- The workflow builds on pushes to `master` and on manual dispatch.
- The workflow now checks out `3Dmondo/SpiceNet` at tag `v0.0.1`, generates `public/ephemeris/generated/` from the JPL SSD `de440s.bsp` URL before the web build, and publishes those generated assets through the normal `dist/` artifact without committing them to git.
- `vite.config.ts` uses `/solar-system-web/` as the base during GitHub Actions builds and `./` locally.
- Static texture imports are bundled through Vite so they work from the project-site base path.

## Known Gaps And Planned Refactors

- Finish manual desktop and mobile validation for the current multi-body overview.
- Finish visual tuning and validation for the current real sky background and curated constellation overlays.
- Extend the minimized rendering-settings UI with sky-specific controls such as brightness.
- Address visible pole artifacts on some body textures.
- Evaluate bundle-size reductions if the current single chunk keeps growing.
