# Solar System Web

Static web-based solar-system explorer built for GitHub Pages. The current repo expects generated real ephemeris assets at startup, surfaces explicit loading or error states when they are unavailable, and keeps a cinematic presentation scale with generated-data orbital trails.

## Current Experience

- Starts in a solar-system overview with the HUD title `Solar System`.
- Loads real ephemeris-driven body positions from generated assets at startup and shows an explicit loading or error state when they are unavailable.
- Renders the Sun, all 8 planets, the Moon, and the expanded major-moon set with the Milestone 13 fast moons restored.
- Supports desktop orbit plus wheel zoom and mobile drag plus pinch zoom.
- Uses a `Jump to` HUD menu plus double click or double tap to focus a body, and keeps `Jump to` available while focused so another body can be selected directly.
- Includes a HUD help overlay, a focused-mode overview return control, a real star catalog, default-on constellation overlays, an aligned Milky Way texture background, and continuous self-rotation.
- Uses directional camera easing, snaps the focus target onto the selected body center, frames focused bodies from the authored focus direction at about `10 x` body radius, and pulls back more decisively when returning to overview.
- Uses thicker opaque orbital trails so they read consistently even when they cross in front of planets.
- Uses custom material pipelines for Venus, Earth, Moon, and Saturn. The remaining bodies use shared texture-based materials.

## Current Project State

- Body positions now come from generated ephemeris assets by default.
- Missing local generated ephemeris assets now surface an explicit runtime error instead of silently substituting fallback positions.
- Orbital trails render from generated chunk data, including parent-relative satellite trails.
- The scene still routes through the provider-backed `bodyStateStore.ts` boundary, with shared presentation metadata plus async-loaded snapshots merged at the catalog seam.
- Milestone 5 now versions `public/ephemeris/body-metadata.json`, and local generated manifest or chunk assets are expected in the ignored `public/ephemeris/generated/` folder. The deployed default uses the one-year Milestone 13 targeted `4` samples/orbit major-moons release asset.
- `ScaleMode` exists only as a small domain placeholder. There is no realistic-scale UI yet.
- Default validation currently passes with `pnpm lint`, `pnpm test`, and `pnpm build`.
- `pnpm test:e2e` requires Playwright browsers and a local preview server.

## Stack

- React 19
- TypeScript 5
- Vite 7
- Three.js through `@react-three/fiber` and `@react-three/drei`
- Vitest and React Testing Library
- Playwright
- GitHub Actions for Pages deployment

## Commands

```powershell
pnpm dev
pnpm lint
pnpm test
pnpm build
.\scripts\Ensure-LocalWebEphemerisData.ps1
.\scripts\Stage-ExpandedMajorMoonsPreview.ps1
.\scripts\Package-ReducedMajorMoonsReleaseAsset.ps1
```

The local ephemeris helper reuses the pinned external `SpiceNet` workflow and defaults to a sibling checkout at `../SpiceNet`. It now defaults `de440s.bsp` to the JPL SSD URL `https://ssd.jpl.nasa.gov/ftp/eph/planets/bsp/de440s.bsp`; pass `-SpiceNetRepoRoot`, `-SpkUrl`, or `-SpkFileName` if your local setup differs. If `public/ephemeris/generated/` is still missing when you run the app locally, the HUD now surfaces an explicit real-data error instead of a placeholder scene.

GitHub Pages currently ships the accepted one-year Milestone 13 targeted `4` samples/orbit major-moons generated profile. Local expanded-profile inspection still uses `.\scripts\Stage-ExpandedMajorMoonsPreview.ps1` to copy ignored preview assets into `public/ephemeris/generated-expanded-major-moons/`, then starts Vite with `VITE_WEB_EPHEMERIS_PROFILE=expanded-major-moons`. Pass `-AllowMilestone13FastMoons` when staging the restored fast-moon profile. `.\scripts\Package-ReducedMajorMoonsReleaseAsset.ps1` packages staged preview assets into the release zip consumed by the Pages workflow.

For Playwright:

```powershell
pnpm exec playwright install
pnpm test:e2e
```

## Docs

- `AGENTS.md`
- `docs/vision.md`
- `docs/architecture.md`
- `docs/roadmap.md`
- `docs/deployment-github-pages.md`
- `docs/testing-mobile.md`
- `docs/tasks/milestone-1.md`
- `docs/tasks/milestone-2.md`
- `docs/tasks/milestone-3.md`
- `docs/tasks/milestone-4.md`
- `docs/decisions/0001-web-stack.md`
