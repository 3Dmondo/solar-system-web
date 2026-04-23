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
- Visiting `/debug` on the current host enables a lightweight FPS overlay for local performance sampling without changing the normal runtime behavior.
- When the external source is enabled, the runtime loads generated manifest and chunk assets from the configured data base URL and uses the committed `public/ephemeris/body-metadata.json` snapshot by default, with an optional explicit metadata-URL override.
- The agreed local generated-asset convention is `public/ephemeris/generated/`, which is served from `./ephemeris/generated` when the runtime is pointed at local generated data.
- The first real-data activation pass uses a default physical scale of `0.001` scene units per kilometer unless `VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER` overrides it.
- Real positions and kernel-derived mean radii still share that one explicit km-to-scene factor; the runtime does not apply a second hidden scale to body positions.
- The scene now presents real positions through one explicit frame transform: raw J2000 ephemeris vectors are rotated into a J2000-ecliptic-aligned render frame and then mapped into the app's `x/z` orbital plane with `y` up before focus, controls, and rendering consume them.
- `SolarSystemExperience` owns the focused target state, coarse-pointer detection, the simulation clock, and the resolved body-catalog hook.
- `ExperienceScene` creates the `Canvas`, lighting, focus camera rig, star background, orbital trails, and the planet list from the current resolved catalog.
- The focus camera now keeps the authored overview angle but derives overview framing distance, orbit-control zoom bounds, and camera clip planes from the loaded scene extents so the physically scaled Milestone 5 catalog remains navigable.
- Entering focus mode now snaps the orbit target directly onto the selected body's center and uses a simple default focused framing distance of about `10 x` the planet radius from the authored focus direction.
- Focused-body tracking now uses a split update path: live ephemeris refreshes keep recomputing the authored focused camera pose while the transition is still settling, then translate the current camera and target together once focus is active so manual orbit and zoom adjustments are preserved.
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

## Data And Domain Boundaries

- `bodyPresentation.ts` contains the shared display metadata that stays stable across data sources.
- `bodyStateStore.ts` is the current selector layer and shared resolved-catalog shape used by async loaders and scene consumers.
- `useResolvedBodyCatalog` in `src/features/experience/state` is the current runtime seam that now surfaces an explicit empty loading or error catalog before the first real dataset load and keeps the last successfully loaded real catalog visible during later refresh failures.
- `useSimulationClock` in `src/features/experience/state` currently starts from the current datetime, advances the requested UTC time on every animation frame by default, supports pause or resume, and exposes one minimal playback-rate cycle across the current forward-speed presets.
- `webBodyCatalogSource.ts` composes the cached dataset loader, async ephemeris provider, the shared J2000-to-scene frame transform, and uniform physical scaling into the resolved-catalog shape, including focus offsets that scale with the physically derived radii inside that same scene frame, and it now reuses the scaled metadata across clock-driven refreshes instead of rebuilding that static layer every tick.
- `webEphemerisProvider.ts` now derives a first trail-history payload from the active loaded chunk using body-specific default windows before that data is mapped into scene space.
- `webBodyCatalogRuntime.ts` now resolves the generated data base URL and first-pass scene scale from defaults unless runtime env overrides are supplied, and it resolves physical body metadata from the committed `public/ephemeris/body-metadata.json` snapshot unless a dedicated metadata URL override is provided.
- The current metadata path materially improves positional accuracy and mean-radius scaling, but axial orientation, spin-period fidelity, and Earth-Sun seasonal orientation still need a dedicated Milestone 5 alignment pass.
- `BodyId`, `ViewTargetId`, and `BodyDefinition` live in `src/features/solar-system/domain/body.ts`.
- `focus.ts` contains the current camera target and position helpers.
- `focus.ts` also contains directional transition profiles plus helpers that preserve the current view direction when deriving a focused camera position.
- `scales.ts` currently contains only a small label helper for the planned scale-mode concept.

## Rendering Model

- Lighting uses a point light at the Sun plus a small ambient contribution.
- `StarBackground` currently renders a camera-centered, non-interactive textured star sphere.
- The planned sky evolution is a static catalog-driven layer that renders individual stars as points and can optionally draw constellation lines.
- Orbital trails now render sampled history from the active loaded chunk, clipped by body-specific default trail windows and lightly emphasized for the focused body.
- `PlanetBody` routes each body to either a custom material pipeline or the shared textured-material path.
- Saturn uses a custom surface material and ring mesh.
- Earth uses day, night, normal, specular, and cloud layers.
- Venus uses a textured surface plus a cloud shell.
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
- Add a static star-catalog data pipeline for a real sky background and optional constellation overlays.
- Design a minimized rendering-settings UI that can expose sky and scene controls without consuming much screen space.
- Address visible pole artifacts on some body textures.
- Review the live sun-direction response of layered Earth shading, Saturn's ring shadow on the globe, and Venus cloud lighting under moving-body updates.
- Align rendered axial tilt, rotation speeds, Earth-Sun orientation, and other high-value physical characteristics with the available solar-system metadata.
- Evaluate bundle-size reductions if the current single chunk keeps growing.
