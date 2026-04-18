# GitHub Pages Deployment

## Source Of Truth

- Workflow: `.github/workflows/deploy-pages.yml`
- Vite base-path logic: `vite.config.ts`

## Current Deployment Behavior

- GitHub Pages deploys on pushes to `master`.
- Manual runs are also allowed through `workflow_dispatch`.
- The build job installs dependencies with `pnpm install --frozen-lockfile` and runs `pnpm build`.
- `actions/configure-pages@v5` is used with `enablement: true`.
- The deploy job publishes the `dist/` artifact.

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
