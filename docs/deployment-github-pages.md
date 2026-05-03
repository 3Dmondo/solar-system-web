# GitHub Pages Deployment

## Source Of Truth

- Workflow: `.github/workflows/deploy-pages.yml`
- Vite base-path logic: `vite.config.ts`

## Current Deployment Behavior

- GitHub Pages deploys on pushes to `master`.
- Manual runs are also allowed through `workflow_dispatch`.
- The build job installs dependencies with `pnpm install --frozen-lockfile`, downloads the pinned one-year Milestone 13 targeted `4` samples/orbit major-moons ephemeris release asset, expands it into `public/ephemeris/generated/`, validates the body set with the explicit fast-moon allow flag, and then runs `pnpm build`.
- `actions/configure-pages@v5` is used with `enablement: true`.
- The deploy job publishes the `dist/` artifact.
- The release-asset ephemeris files are copied into `dist/ephemeris/generated/` through Vite's normal `public/` handling, and the deployed app now consumes the restored expanded major-moons profile through the default real-data runtime path.

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
- Large assets are bundled into the static build, so deployment size is driven by textures, the main JavaScript bundle, and the downloaded ephemeris release asset.
- Local generated Milestone 5 ephemeris assets belong under the ignored `public/ephemeris/generated/` folder so Vite can serve and bundle them without versioning them in git.
- The Milestone 11 expanded major-moons preview uses ignored local assets under `public/ephemeris/generated-expanded-major-moons/` and is selected locally with `VITE_WEB_EPHEMERIS_PROFILE=expanded-major-moons`.
- The deployment workflow currently consumes release tag `ephemeris-expanded-major-moons-targeted-4-samples-v1` and asset `ephemeris-expanded-major-moons-targeted-4-samples-v1.zip`; it no longer downloads multi-gigabyte SPK kernels or runs `SpiceNet` during every Pages build.
- The deployed one-year targeted `4` samples/orbit major-moons profile passed local and GitHub Pages assessment. Chunk-size and file-format optimization remains optional future work only if later measurements justify it.

## Ephemeris Data Delivery

- CI now downloads a versioned GitHub release asset containing generated ephemeris manifest and chunk files during deployment rather than storing generated JSON or upstream kernels in git.
- The default `pnpm build` flow remains focused on the web app build; ephemeris release packaging is a separate helper script locally.
- Local ephemeris generation uses `scripts/Ensure-LocalWebEphemerisData.ps1`, which delegates to the external `SpiceNet` workflow and writes generated manifest or chunk assets into the ignored `public/ephemeris/generated/` folder.
- Local expanded major-moons inspection uses `scripts/Stage-ExpandedMajorMoonsPreview.ps1` after the sibling `SpiceNet` profile has generated preview assets; pass `-AllowMilestone13FastMoons` when staging the restored fast-moon profile.
- Release asset packaging uses `scripts/Package-ReducedMajorMoonsReleaseAsset.ps1`, which validates the body set, zips `manifest.json` plus `chunk-*.json`, and writes a SHA-256 sidecar for upload to GitHub Releases.
