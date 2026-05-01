# GitHub Pages Deployment

## Source Of Truth

- Workflow: `.github/workflows/deploy-pages.yml`
- Vite base-path logic: `vite.config.ts`

## Current Deployment Behavior

- GitHub Pages deploys on pushes to `master`.
- Manual runs are also allowed through `workflow_dispatch`.
- The build job checks out `3Dmondo/SpiceNet` at tag `v0.0.1`, installs dependencies with `pnpm install --frozen-lockfile`, generates `public/ephemeris/generated/` before the web build, and then runs `pnpm build`.
- `actions/configure-pages@v5` is used with `enablement: true`.
- The deploy job publishes the `dist/` artifact.
- The workflow-generated ephemeris assets are copied into `dist/ephemeris/generated/` through Vite's normal `public/` handling, and the deployed app now consumes them through the default real-data runtime path.

## Expected URL

- `https://3Dmondo.github.io/solar-system-web/`

## Base Paths

- Local builds use `./`.
- GitHub Actions builds use `/solar-system-web/`.

## Local Verification

```powershell
pnpm build
```

If you want to inspect the production bundle locally:

```powershell
pnpm preview -- --host
```

## First-Time Repository Setup

1. Push the workflow to GitHub.
2. Open the repository `Settings` and then `Pages`.
3. Leave the Pages source on `GitHub Actions`.
4. Run or re-run `Deploy To GitHub Pages` from the `Actions` tab if needed.
5. Open the site URL after the workflow succeeds.

## Notes

- Do not switch the repo to Jekyll or static HTML deployment. The repository already owns the workflow.
- If the default branch changes from `master`, update the workflow trigger.
- Large assets are bundled into the static build, so deployment size is driven mostly by textures and the main JavaScript bundle.
- Local generated Milestone 5 ephemeris assets belong under the ignored `public/ephemeris/generated/` folder so Vite can serve and bundle them without versioning them in git.
- The Milestone 11 expanded major-moons preview uses ignored local assets under `public/ephemeris/generated-expanded-major-moons/` and is selected only with `VITE_WEB_EPHEMERIS_PROFILE=expanded-major-moons`; it is not part of the GitHub Pages deployment default.
- The deployment workflow pins `SpiceNet` to tag `v0.0.1` and currently downloads `de440s.bsp` from the JPL SSD catalog URL `https://ssd.jpl.nasa.gov/ftp/eph/planets/bsp/de440s.bsp`, which matches the `de440s.bsp` entry in `SpiceNet/docs/SsdCatalog/ssd_catalog.json`.

## Milestone 5 Data Delivery

- CI now downloads non-versioned ephemeris and supporting kernel files during deployment rather than storing them in git.
- The default `pnpm build` flow remains focused on the web app build; ephemeris generation is still an explicit pre-build step in CI and a separate helper script locally.
- Local ephemeris generation uses `scripts/Ensure-LocalWebEphemerisData.ps1`, which delegates to the external `SpiceNet` workflow and writes generated manifest or chunk assets into the ignored `public/ephemeris/generated/` folder.
- Local expanded major-moons inspection uses `scripts/Stage-ExpandedMajorMoonsPreview.ps1` after the sibling `SpiceNet` profile has generated `artifacts/web-data/expanded-major-moons-reduced/`; the helper rejects Milestone 13 fast-moon ids unless explicitly overridden for future sub-day validation.
