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

- `App` renders `SolarSystemExperience`.
- `SolarSystemExperience` owns the focused target state and coarse-pointer detection.
- `ExperienceScene` creates the `Canvas`, lighting, focus camera rig, star background, orbital trails, and the planet list.
- `ExperienceHud` shows the current target label, short instructions, and the help overlay.
- The app starts in the `overview` target, with the camera at `[0, 14, 46]`.

## Interaction Model

- Desktop: drag to orbit, wheel to zoom, double click a body to focus it.
- Mobile: drag to orbit, pinch to zoom, double tap a body to focus it.
- Focus transitions are eased and can be interrupted by user input.
- There is no dedicated return-to-overview button. Zooming back out is the current recovery path.
- Orbit control tuning differs for coarse and fine pointers through `getControlProfile`.

## Data And Domain Boundaries

- `mockedSolarSystemBodies` in `src/features/solar-system/data/mockBodyCatalog.ts` is the current source of truth for body size, mocked position, focus offset, and material selection.
- `BodyId`, `ViewTargetId`, and `BodyDefinition` live in `src/features/solar-system/domain/body.ts`.
- `focus.ts` contains the current camera target and position helpers.
- `scales.ts` currently contains only a small label helper for the planned scale-mode concept.
- The planned `BodyStateProvider` abstraction is not implemented yet. The scene still imports mocked data directly.

## Rendering Model

- Lighting uses a point light at the Sun plus a small ambient contribution.
- `StarBackground` currently renders a camera-centered, non-interactive textured star sphere.
- The planned sky evolution is a static catalog-driven layer that renders individual stars as points and can optionally draw constellation lines.
- `OrbitalTrails` renders non-interactive circular placeholder trails derived from mocked positions.
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
- `pnpm test:e2e` is separate and requires `pnpm exec playwright install`.
- The checked-in Playwright smoke spec still reflects an earlier Saturn-first expectation and should be updated before treating e2e coverage as current.

## Deployment

- GitHub Pages deployment is defined in `.github/workflows/deploy-pages.yml`.
- The workflow builds on pushes to `master` and on manual dispatch.
- `vite.config.ts` uses `/solar-system-web/` as the base during GitHub Actions builds and `./` locally.
- Static texture imports are bundled through Vite so they work from the project-site base path.

## Known Gaps And Planned Refactors

- Extract a real data-provider boundary instead of importing mocked catalog data directly.
- Add automated browser coverage that matches the overview-first experience.
- Finish manual desktop and mobile validation for the current multi-body overview.
- Add a static star-catalog data pipeline for a real sky background and optional constellation overlays.
- Design a minimized rendering-settings UI that can expose sky and scene controls without consuming much screen space.
- Address visible pole artifacts on some body textures.
- Evaluate bundle-size reductions if the current single chunk keeps growing.
