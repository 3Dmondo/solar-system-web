# Solar System Web

Static web-based solar-system explorer built for GitHub Pages. The current repo delivers a fullscreen mocked overview with a cinematic scale model rather than real astronomical distances.

## Current Experience

- Starts in a solar-system overview with the HUD title `Solar System`.
- Renders the Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, and Neptune.
- Supports desktop orbit plus wheel zoom and mobile drag plus pinch zoom.
- Uses double click or double tap to focus a body from the overview.
- Includes a HUD help overlay, a Milky Way star sphere, mocked orbital trails, and continuous self-rotation.
- Uses custom material pipelines for Venus, Earth, Moon, and Saturn. The remaining bodies use shared texture-based materials.

## Current Project State

- Body positions and trails are mocked.
- There is no `BodyStateProvider` abstraction wired into the scene yet.
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
```

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
- `docs/decisions/0001-web-stack.md`
