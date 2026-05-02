# Bug: Fast Refresh Lint Warning In Sun Impostor

Status: Reported
Date: 2026-05-02

## Summary

Running `pnpm lint` completes with one React Fast Refresh warning in `SunImpostor.tsx`. The normal verification path should be warning-free so later agents do not have to distinguish expected lint noise from new regressions.

## Environment

- App surface: Lint and React component/module structure
- Browser/device: Not applicable
- Route or URL: Not applicable
- Build/deploy context: Local repo on Windows PowerShell
- Relevant time or data state: Not applicable

## Steps To Reproduce

1. From the repository root, run `pnpm lint`.
2. Observe the ESLint output.

## Actual Behavior

`pnpm lint` exits successfully but reports one warning:

```text
C:\Dev\repos\3Dmondo\solar-system-web\src\features\solar-system\components\SunImpostor.tsx
  136:17  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

1 problem (0 errors, 1 warning)
```

## Expected Behavior

`pnpm lint` should complete with no warnings.

## Evidence

- Screenshots: Not provided
- Console/log output: `pnpm lint` reproduced the warning above.
- Network/debug observations: Not applicable
- Related files or code areas:
  - `src/features/solar-system/components/SunImpostor.tsx`
  - `src/features/solar-system/components/SunImpostorWrapper.tsx`
  - `eslint.config.js`
  - `docs/bugs/solved/2026-05-02-body-labels-overlap-ui-controls.md`

## Frequency And Scope

The warning reproduces every time `pnpm lint` runs in the current working tree. It is limited to one file and one ESLint rule.

## Recent Changes

Unknown. A solved bug report for body-label layering already recorded that `pnpm lint` passed with this existing `SunImpostor.tsx` warning, so the warning predates this report.

## Suspected Area

Likely caused by `SunImpostor.tsx` exporting both the `SunImpostor` React component and non-component exports such as `computeSunImpostorOpacity` and `SUN_IMPOSTOR_THRESHOLDS`. The lint config enables `react-refresh/only-export-components` as a warning with constant exports allowed, but exported functions from component files still trigger the rule.

`SunImpostorWrapper.tsx` imports `computeSunImpostorOpacity` from `SunImpostor.tsx`, so a likely fix is to move shared Sun impostor helpers/constants into a separate non-component module while keeping the component file component-only.

## Open Questions

- Should the solver keep `SUN_IMPOSTOR_THRESHOLDS` public from a helper module, or remove the export if no external code needs it?
- Should a focused unit test cover `computeSunImpostorOpacity` after moving it out of the component module?
