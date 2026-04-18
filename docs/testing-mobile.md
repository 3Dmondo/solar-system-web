# Testing And Mobile Verification

## Current Automated Coverage

- `pnpm lint` checks the codebase.
- `pnpm test` runs Vitest unit and component tests under `src/**/*`.
- `pnpm build` validates TypeScript and the production bundle.
- `pnpm test:e2e` is separate from the default validation path and requires Playwright browsers.

## Current Gaps

- The checked-in Playwright smoke spec still targets an older Saturn-first startup flow.
- Canvas interactions are only partially covered by automated tests today.
- Manual desktop and mobile verification is still required before closing the overview milestone.

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
pnpm exec playwright install
pnpm test:e2e
```

## Manual Interaction Checklist

- Overview loads with the HUD title `Solar System`.
- Drag orbit feels stable on desktop and on touch devices.
- Wheel zoom and pinch zoom work smoothly.
- Double click or double tap focuses the intended body.
- Focus motion stops cleanly when the user interrupts it.
- Zooming back out makes it easy to recover a wider overview.
- The help overlay is readable and does not trap interaction.
- Star background and orbital trails remain visually helpful rather than distracting.
- Portrait and landscape layouts both remain usable.

## Device Coverage

- Use desktop browser emulation during each small interaction change.
- Use at least one real Android device for overview and focus interaction checks.
- Test iPhone Safari when available because mobile WebGL behavior can differ.
- Re-check the production preview after changes to textures, controls, or asset loading.
