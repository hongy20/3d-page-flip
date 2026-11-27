# Proposal

## Why

Prepare and publish the WebBook 3D demo publicly on GitHub Pages once the repository is ready to be made public.

## What Changes

- Configure Vite subpath base (`/3d-page-flip/` when `GITHUB_PAGES=true`, `/` locally) in `vite.config.ts` and ensure static asset paths (`index.html`, any runtime loaders) resolve cleanly under `/3d-page-flip/`.
- Add `.github/workflows/deploy.yml` building with `GITHUB_PAGES=true` and publishing `dist/` to GitHub Pages via `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages` on `push` to `main` and `workflow_dispatch`.
- Switch `hongy20/3d-page-flip` repository visibility to public and enable GitHub Pages (GitHub Actions source).

## Capabilities

### New Capabilities

- `public-demo-deployment`: Subpath-safe Vite production build, automated GitHub Pages deployment workflow, and public repository release for the live WebBook 3D demo.

### Modified Capabilities

<!-- None -->

## Impact

- **Files affected**: `vite.config.ts`, `index.html` (if base-aware asset paths are needed), `.github/workflows/deploy.yml`.
- **Dependencies**: None (zero new runtime dependencies).
- **External settings**: Switching `hongy20/3d-page-flip` repository visibility to public and enabling GitHub Pages (Actions source). Intentionally deferred until the repository is ready to be made public.
