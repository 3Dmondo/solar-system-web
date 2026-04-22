# Testing And Mobile Verification

## Current Automated Coverage

- `pnpm lint` checks the codebase.
- `pnpm test` runs Vitest unit and component tests under `src/**/*`.
- `pnpm build` validates TypeScript and the production bundle.
- `pnpm test:e2e` is separate from the default validation path and requires Playwright browsers plus a local preview server.

## Current Gaps

- The checked-in Playwright smoke spec covers overview startup plus the basic `Jump to` focus and overview-return path on desktop and mobile.
- Canvas interactions are only partially covered by automated tests today.
- Manual desktop and mobile verification is still required before closing the current interaction milestone.

## Local Commands

Quick local validation:

```powershell
pnpm lint
pnpm test
pnpm build
```

To run the app on the local network:

```powershell
pnpm dev -- --host
```

To run a production-like preview on the local network:

```powershell
pnpm build
pnpm preview -- --host
```

To prepare Playwright locally:

```powershell
pnpm build
pnpm preview -- --host 127.0.0.1 --port 4173
pnpm exec playwright install
pnpm test:e2e
```

## Manual Interaction Checklist

- Overview loads with the HUD title `Solar System`.
- The `Jump to` control is easy to notice in overview and focused modes on desktop and mobile.
- Opening `Jump to` feels lightweight on desktop and comfortable on mobile-sized layouts.
- Choosing a body from `Jump to` focuses the intended target, including direct body-to-body switches while already focused.
- Drag orbit feels stable on desktop and on touch devices.
- Wheel zoom and pinch zoom work smoothly.
- Double click or double tap focuses the intended body.
- Entering focus from an off-angle view recenters the target without an unwanted orbit-to-default move.
- Focus motion stops cleanly when the user interrupts it.
- The focused-mode `Overview` button is easy to find and returns to a clear wide view.
- Zooming back out makes it easy to recover a wider overview.
- The help overlay is readable and does not trap interaction.
- Star background and orbital trails remain visually helpful rather than distracting.
- Orbital trails keep a stable look when they overlap a planet and still feel readable at the chosen brightness.
- Portrait and landscape layouts both remain usable.

## Device Coverage

- Use desktop browser emulation during each small interaction change.
- Use at least one real Android device for overview and focus interaction checks.
- Test iPhone Safari when available because mobile WebGL behavior can differ.
- Re-check the production preview after changes to textures, controls, or asset loading.
