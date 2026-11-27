# Proposal

## Why

Standardize the development environment, enforce automated code quality checks in CI, provide a clear project README linking directly to the specs (without stale progress status), and publish the built demo on GitHub Pages.

## What Changes

- Lock Node.js 24 LTS via `.nvmrc` (`24`) and `package.json` `engines.node`.
- Add `oxlint` and `oxfmt` as `devDependencies` with npm scripts (`lint`, `format`, `format:check`) and minimal ignore/config setup.
- Add a GitHub Actions CI workflow (`.github/workflows/ci.yml`) running Node 24, `npm ci`, `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`.
- Update `README.md` with a concise project description, what it does, local setup and repository structure, and links to `openspec/specs/` and `openspec/`, removing project-progress / phase-status tracking.
- Configure Vite `base` for GitHub Pages (`/3d-page-flip/` in Pages builds), add `.github/workflows/deploy.yml` to build and deploy `dist/` to GitHub Pages, and make the `hongy20/3d-page-flip` repository public with GitHub Pages enabled.

## Capabilities

### New Capabilities
- `project-tooling`: Node.js version locking, Oxlint/Oxfmt linting and formatting, automated GitHub Actions CI checks, concise README documentation with spec links, and GitHub Pages build/deployment.

### Modified Capabilities
<!-- None -->

## Impact

- **Files affected**: `.nvmrc`, `package.json`, `vite.config.ts`, `index.html` (if base-aware asset paths are needed), `README.md`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, optional Oxc config/ignore files.
- **Dependencies**: `oxlint`, `oxfmt` (`devDependencies` only; zero runtime dependencies).
- **External settings**: Making `hongy20/3d-page-flip` public on GitHub and enabling GitHub Pages (Actions source).
