# public-demo-deployment Specification

## Purpose

Defines the subpath-safe Vite build configuration, automated GitHub Pages deployment workflow, and public repository release requirements for WebBook 3D.

## Requirements

### Requirement: Subpath-safe Vite production build for GitHub Pages

`vite.config.ts` SHALL set `base` to `'/3d-page-flip/'` when `GITHUB_PAGES === 'true'` and `'/'` otherwise, and static asset URLs in `index.html` and any runtime loaders SHALL resolve cleanly under `/3d-page-flip/` without breaking local development at `/`.

#### Scenario: GitHub Pages build resolves subpath assets cleanly

- **WHEN** `GITHUB_PAGES=true npm run build` is executed
- **THEN** emitted asset and SVG page references in `dist/` resolve under `/3d-page-flip/` while standard `npm run build` preserves `/`

### Requirement: Automated GitHub Pages deployment workflow

A GitHub Actions workflow at `.github/workflows/deploy.yml` SHALL trigger on pushes to `main` and `workflow_dispatch`, set up Node.js from `.nvmrc`, build `dist/` with `GITHUB_PAGES=true`, and publish `dist/` to GitHub Pages using `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.

#### Scenario: Deploy workflow builds and publishes Pages artifact

- **WHEN** `.github/workflows/deploy.yml` runs on GitHub Actions
- **THEN** it builds the bundle with `GITHUB_PAGES=true` and deploys `dist/` via the official GitHub Pages actions

### Requirement: Public repository release and live demo verification

The `hongy20/3d-page-flip` repository SHALL be switched to public visibility with GitHub Pages configured to use GitHub Actions as its source, and the published GitHub Pages site SHALL serve the reader cleanly.

#### Scenario: Live GitHub Pages demo serves all assets with zero 404s

- **WHEN** the repository is public, GitHub Pages is enabled, and `.github/workflows/deploy.yml` completes on `main`
- **THEN** the live GitHub Pages URL loads the reader, styles, scripts, and all page SVGs with zero 404 errors
