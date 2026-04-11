# ADR 0001: Web Stack Selection

## Status

Accepted

## Decision

Use React, TypeScript, Vite, Three.js through react-three-fiber, Vitest, React Testing Library, and Playwright.

## Rationale

- strong maintainability
- static-site friendly
- good test ecosystem
- flexible enough for advanced rendering

## Consequences

- requires a Node.js toolchain locally and in CI
- rendering logic should stay decoupled from React-specific components where practical
