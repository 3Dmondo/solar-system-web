# ADR 0001: Web Stack Selection

## Status

Accepted

## Decision

Use React, TypeScript, Vite, Three.js through react-three-fiber, Vitest, React Testing Library, Playwright, and GitHub Actions deployment for the static site.

## Context

The project needs:

- a maintainable stack for ongoing iteration
- static build output suitable for GitHub Pages
- a clean separation between app shell, scene orchestration, and rendering helpers
- room for progressively richer custom materials and interaction work
- automated test tooling that can grow with the project

## Rationale

- React and TypeScript keep UI and state changes approachable.
- Vite provides a fast local loop and simple static output.
- `@react-three/fiber` lets the repo compose Three.js scenes with React components while still keeping math and rendering helpers in separate modules.
- Vitest and React Testing Library cover domain logic and UI behavior.
- Playwright provides a path for real-browser smoke coverage as the interaction model matures.
- GitHub Actions fits the static deployment target.

## Consequences

- The repo requires a Node.js and `pnpm` toolchain.
- Rendering helpers should remain decoupled from React components where practical.
- Large texture assets and a growing single-page bundle must be watched as rendering fidelity increases.
- The codebase should keep long-lived presentation metadata and async-loaded ephemeris data separate so the rendering stack can evolve without rewriting scene consumers.
