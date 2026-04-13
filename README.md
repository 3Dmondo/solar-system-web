# Solar System Web

Web-based solar system visualizer designed for GitHub Pages, with a polished fullscreen experience for desktop and mobile.

## Current Status

The current app is a mocked fullscreen solar-system overview with:

- Sun
- Mercury
- Venus
- Saturn
- Earth
- Moon
- Mars
- Jupiter
- Uranus
- Neptune

It currently includes:

- broad overview navigation plus single-body focus
- star background rendering
- mocked orbital trails
- custom higher-fidelity rendering passes for Saturn, Earth, Moon, and Venus

The data layer starts mocked and is intended to evolve toward static assets generated from NASA/JPL ephemerides.

## Planned Stack

- React
- TypeScript
- Vite
- Three.js via react-three-fiber
- Vitest
- Playwright

## Documentation

- `docs/vision.md`
- `docs/architecture.md`
- `docs/roadmap.md`
- `docs/deployment-github-pages.md`
- `docs/testing-mobile.md`
- `docs/tasks/milestone-1.md`
- `docs/tasks/milestone-2.md`
- `docs/decisions/0001-web-stack.md`

## Development

Install dependencies and start the app with:

```powershell
pnpm install
pnpm dev
```

For testing on a phone on the same network:

```powershell
pnpm dev -- --host
```

## Deployment

GitHub Pages deployment is handled by the workflow in `.github/workflows/deploy-pages.yml`.

Setup steps are documented in `docs/deployment-github-pages.md`.
