# public-demo-deployment Specification

## Purpose

Defines the subpath-safe Vite build configuration, automated GitHub Pages deployment workflow, and public repository release requirements for Dropp.

## Requirements

### Requirement: Subpath-safe Vite production build for GitHub Pages

`vite.config.ts` SHALL resolve `base` from `BASE_PATH` when set (normalized to `'/<path>/'`, or `'/'` when empty), falling back to `'/dropp/'` when `GITHUB_PAGES === 'true'` and `'/'` otherwise, and static asset URLs in `index.html` and any runtime loaders SHALL resolve cleanly under subpaths without breaking local development at `/`.

#### Scenario: GitHub Pages build resolves subpath assets cleanly

- **WHEN** `GITHUB_PAGES=true npm run build` or `BASE_PATH=/<subpath> npm run build` is executed
- **THEN** emitted asset and SVG page references in `dist/` resolve under `/dropp/` (or `/<subpath>/` when `BASE_PATH` is set) while standard `npm run build` preserves `/`

### Requirement: Automated GitHub Pages deployment workflow

A GitHub Actions workflow at `.github/workflows/deploy.yml` SHALL trigger on pushes to `main` and `workflow_dispatch`, set up Node.js from `.nvmrc`, run `actions/configure-pages` (`id: pages`), build `dist/` with `GITHUB_PAGES=true` and `BASE_PATH=${{ steps.pages.outputs.base_path }}`, and publish `dist/` to GitHub Pages using `actions/upload-pages-artifact` and `actions/deploy-pages`.

#### Scenario: Deploy workflow builds and publishes Pages artifact

- **WHEN** `.github/workflows/deploy.yml` runs on GitHub Actions
- **THEN** it builds the bundle with `GITHUB_PAGES=true` and `BASE_PATH` from `configure-pages` and deploys `dist/` via the official GitHub Pages actions

### Requirement: Public repository release and live demo verification

The `hongy20/dropp` repository SHALL be switched to public visibility with GitHub Pages configured to use GitHub Actions as its source, and the published GitHub Pages site SHALL serve the reader cleanly.

#### Scenario: Live GitHub Pages demo serves all assets with zero 404s

- **WHEN** the repository is public, GitHub Pages is enabled, and `.github/workflows/deploy.yml` completes on `main`
- **THEN** the live GitHub Pages URL loads the reader, styles, scripts, and all page SVGs with zero 404 errors
