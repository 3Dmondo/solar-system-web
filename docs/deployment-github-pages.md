# GitHub Pages Deployment

This repository includes a GitHub Actions workflow for deploying the static Vite build to GitHub Pages.

## Expected Site URL

- `https://3Dmondo.github.io/solar-system-web/`

## What Is Already Configured

- Vite uses the GitHub Pages base path during GitHub Actions builds.
- The workflow file is `.github/workflows/deploy-pages.yml`.
- The workflow builds the app with `pnpm` and deploys the `dist/` folder through the official GitHub Pages actions.

## Manual Steps

1. Push the latest commits to GitHub.
2. Open the repository on GitHub.
3. Go to `Settings`.
4. Open `Pages` in the left sidebar.
5. In `Build and deployment`, set `Source` to `GitHub Actions`.
6. Save the setting if GitHub asks for confirmation.
7. Open the `Actions` tab and wait for `Deploy To GitHub Pages` to run.
8. When the workflow succeeds, open `https://3Dmondo.github.io/solar-system-web/`.

## Notes

- The workflow currently deploys on pushes to `master`.
- If the default branch is renamed later, update `.github/workflows/deploy-pages.yml`.
- The first deployment can take a short while before the site becomes available.
- If the site shows an old version, hard refresh the browser after the workflow finishes.
