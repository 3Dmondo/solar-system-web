# Bug: TypeScript BaseUrl Deprecation Warning

Status: Reported
Date: 2026-05-02

## Summary

The TypeScript configuration reports a deprecation warning for `compilerOptions.baseUrl` in `tsconfig.app.json`. The project should either remove the deprecated option if it is unnecessary or explicitly silence the warning with `ignoreDeprecations` after confirming the migration path.

## Environment

- App surface: TypeScript project configuration
- Browser/device: Not applicable
- Route or URL: Not applicable
- Build/deploy context: Local repo on Windows; warning reported for `C:\Dev\repos\3Dmondo\solar-system-web\tsconfig.app.json`
- Relevant time or data state: TypeScript dependency is `^5.9.3`; `pnpm typecheck` currently runs `tsc -b`

## Steps To Reproduce

1. Open or validate `C:\Dev\repos\3Dmondo\solar-system-web\tsconfig.app.json` with TypeScript diagnostics enabled.
2. Observe the warning on the `"baseUrl"` compiler option.

## Actual Behavior

The TypeScript diagnostic reports:

```text
C:\Dev\repos\3Dmondo\solar-system-web\tsconfig.app.json: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0. Specify compilerOption '"ignoreDeprecations": "6.0"' to silence this error.
  Visit https://aka.ms/ts6 for migration information.
```

Local CLI check:

```text
pnpm typecheck
tsc -b
```

completed with no output or nonzero exit code in the current environment, so the warning may currently be editor or TypeScript-version dependent.

## Expected Behavior

The TypeScript configuration should not produce deprecation warnings in normal editor or validation workflows.

## Evidence

- Screenshots: Not provided
- Console/log output: User-provided TypeScript diagnostic above
- Network/debug observations: Not applicable
- Related files or code areas:
  - `tsconfig.app.json`
  - `tsconfig.json`
  - `package.json`

## Frequency And Scope

Reported for `tsconfig.app.json` when TypeScript diagnostics inspect `"baseUrl"`. Local inspection found `"baseUrl": "."` only in `tsconfig.app.json`, with no `paths` or `ignoreDeprecations` entries in the TypeScript config files.

## Recent Changes

Unknown.

## Suspected Area

`tsconfig.app.json` currently includes `"baseUrl": "."`. Initial import inspection suggests source imports are mostly relative paths plus package imports, so `baseUrl` may be removable if no absolute project-root imports depend on it. If removal is not safe, TypeScript suggests adding `"ignoreDeprecations": "6.0"` under `compilerOptions` as a temporary silencing option.

## Open Questions

- Is the warning coming from the IDE's bundled TypeScript version, workspace TypeScript, `pnpm build`, or another validation command?
- Does any source, test, config, or generated file rely on project-root absolute imports that require `baseUrl`?
- Should the solver prefer removing `baseUrl` if unused, or add `ignoreDeprecations` as a temporary compatibility measure?
