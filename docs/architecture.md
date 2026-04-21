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
- Experience shell and HUD: `src/features/experience`
- Solar-system domain, data, components, and rendering helpers: `src/features/solar-system`
- Static textures: `assets/textures`
- Browser smoke tests: `tests/e2e`
- Deployment workflow: `.github/workflows/deploy-pages.yml`

## Current Runtime Shape

- `App` renders `SolarSystemExperience` and can opt into the external web-data catalog source through `VITE_WEB_EPHEMERIS_DATA_BASE_URL` plus `VITE_WEB_EPHEMERIS_SCENE_UNITS_PER_KILOMETER`.
- `SolarSystemExperience` owns the focused target state, coarse-pointer detection, the simulation clock, and the resolved body-catalog hook.
- `ExperienceScene` creates the `Canvas`, lighting, focus camera rig, star background, orbital trails, and the planet list from the current resolved catalog.
- `ExperienceHud` shows the current target label, a grouped `Jump to` chooser in overview, short instructions, the current simulation time, the help overlay, focused-mode overview recovery, and runtime loading or fallback messages.
- The app starts in the `overview` target, with the camera at `[0, 14, 46]`.

## Interaction Model

- Desktop: drag to orbit, wheel to zoom, double click a body to focus it.
- Mobile: drag to orbit, pinch to zoom, double tap a body to focus it.
- The overview HUD exposes a `Jump to` button that opens a grouped chooser for direct focus and easier body discovery.
- Focus transitions are eased, can be interrupted by user input, preserve the current viewing angle when entering a body, and use directional profiles so body-to-overview moves pull back faster.
- The HUD exposes an `Overview` button while a body is focused, and zooming back out still works as a secondary recovery path.
- Orbit control tuning differs for coarse and fine pointers through `getControlProfile`.

## Data And Domain Boundaries

- `mockBodyStateProvider` in `src/features/solar-system/data/mockBodyCatalog.ts` is the current synchronous source for mocked snapshot state.
- Static body metadata and mocked snapshot positions are now separated in the mock data layer and merged only at scene-consumption boundaries.
- `bodyStateStore.ts` is the current selector layer and shared resolved-catalog shape used by both mocked and async sources.
- `useResolvedBodyCatalog` in `src/features/experience/state` is the current runtime seam that can keep a mocked fallback catalog visible while an async source loads or fails.
- `useSimulationClock` in `src/features/experience/state` currently starts from the current datetime and advances the requested UTC time in real time.
- `webBodyCatalogSource.ts` composes the cached dataset loader, async ephemeris provider, and uniform physical scaling into the shared resolved-catalog shape, including focus offsets that scale with the physically derived radii.
- `webBodyCatalogRuntime.ts` turns the external web-data source on only when the runtime env provides both the data base URL and the physical scale factor.
- `BodyId`, `ViewTargetId`, and `BodyDefinition` live in `src/features/solar-system/domain/body.ts`.
- `focus.ts` contains the current camera target and position helpers.
- `focus.ts` also contains directional transition profiles plus helpers that preserve the current view direction when deriving a focused camera position.
- `scales.ts` currently contains only a small label helper for the planned scale-mode concept.
- The default runtime still falls back to the existing mocked overview layout until the external web-data source is explicitly configured.

## Rendering Model

- Lighting uses a point light at the Sun plus a small ambient contribution.
- `StarBackground` currently renders a camera-centered, non-interactive textured star sphere.
- The planned sky evolution is a static catalog-driven layer that renders individual stars as points and can optionally draw constellation lines.
- `OrbitalTrails` renders non-interactive circular placeholder trails derived from mocked positions, using thicker opaque lines so their appearance stays consistent across body overlaps.
- `PlanetBody` routes each body to either a custom material pipeline or the shared mock texture material.
- Saturn uses a custom surface material and ring mesh.
- Earth uses day, night, normal, specular, and cloud layers.
- Venus uses a textured surface plus a cloud shell.
- Moon uses texture and height data for extra relief.
- The remaining bodies use shared texture-driven materials from `mockBodyTextures.ts`.

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
- `vite.config.ts` uses `/solar-system-web/` as the base during GitHub Actions builds and `./` locally.
- Static texture imports are bundled through Vite so they work from the project-site base path.

## Known Gaps And Planned Refactors

- Finish manual desktop and mobile validation for the current multi-body overview.
- Add a static star-catalog data pipeline for a real sky background and optional constellation overlays.
- Design a minimized rendering-settings UI that can expose sky and scene controls without consuming much screen space.
- Address visible pole artifacts on some body textures.
- Evaluate bundle-size reductions if the current single chunk keeps growing.
