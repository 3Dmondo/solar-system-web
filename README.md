# Solar System Web

Web-based solar system visualizer designed for GitHub Pages, with a polished fullscreen experience for desktop and mobile.

## Current Status

This repository is scaffolded for a planet showcase first:

- Saturn
- Earth
- Moon

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
