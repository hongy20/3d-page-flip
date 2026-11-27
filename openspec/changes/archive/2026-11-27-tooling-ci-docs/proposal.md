# Proposal

## Why

Standardize the development environment, enforce automated code quality checks in CI, and provide a clear project README linking directly to the specs (without stale progress status).

## What Changes

- Lock Node.js 24 LTS via `.nvmrc` (`24`) and `package.json` `engines.node`.
- Add `oxlint` and `oxfmt` as `devDependencies` with npm scripts (`lint`, `format`, `format:check`) and minimal ignore/config setup.
- Add a GitHub Actions CI workflow (`.github/workflows/ci.yml`) running Node 24, `npm ci`, `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`.
- Update `README.md` with a concise project description, what it does, local setup and repository structure, and links to `openspec/specs/` and `openspec/`, removing project-progress / status tracking.
- Out of scope: GitHub Pages subpath build (`vite.config.ts`), deployment workflow (`.github/workflows/deploy.yml`), and making the repository public (tracked separately in `publish-public-demo`).

## Capabilities

### New Capabilities

- `project-tooling`: Node.js version locking, Oxlint/Oxfmt linting and formatting, automated GitHub Actions CI checks, and concise README documentation with spec links.

### Modified Capabilities

<!-- None -->

## Impact

- **Files affected**: `.nvmrc`, `package.json`, `README.md`, `.github/workflows/ci.yml`, optional Oxc config/ignore files.
- **Dependencies**: `oxlint`, `oxfmt` (`devDependencies` only; zero runtime dependencies).
