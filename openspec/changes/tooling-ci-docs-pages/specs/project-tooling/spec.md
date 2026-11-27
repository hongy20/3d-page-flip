# Spec Delta

## Purpose

Defines repository-level Node.js version locking, Oxlint/Oxfmt code quality checks, GitHub Actions CI, concise project README documentation, and GitHub Pages deployment for WebBook 3D.

## ADDED Requirements

### Requirement: Locked Node.js 24 LTS version
The repository SHALL lock the Node.js runtime version to Node.js 24 LTS via `.nvmrc` (`24`) and `package.json` `engines.node` (`>=24 <25`).

#### Scenario: Version files declare Node.js 24 LTS consistently
- **WHEN** `.nvmrc` and `package.json` are inspected
- **THEN** `.nvmrc` specifies `24` and `package.json` `engines.node` targets Node 24 LTS

### Requirement: Oxlint and Oxfmt code quality tooling
`package.json` SHALL configure `oxlint` and `oxfmt` as `devDependencies` (keeping runtime `dependencies` empty) and expose `lint`, `format`, and `format:check` npm scripts.

#### Scenario: Lint and format check scripts succeed cleanly
- **WHEN** `npm run lint` and `npm run format:check` are executed
- **THEN** both commands exit with status `0` and `package.json` still contains zero runtime `dependencies`

### Requirement: Automated GitHub Actions CI verification
A GitHub Actions workflow at `.github/workflows/ci.yml` SHALL run on pushes to `main` and pull requests using the Node.js version from `.nvmrc`, executing `npm ci`, `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`.

#### Scenario: CI workflow enforces lint, format, test, and build
- **WHEN** `.github/workflows/ci.yml` is inspected or triggered on GitHub Actions
- **THEN** it installs dependencies with `npm ci` on Node 24 and runs `lint`, `format:check`, `test`, and `build`

### Requirement: Concise project README with spec links
`README.md` SHALL provide a concise description of WebBook 3D, what it does, local setup and repository structure, and links to `openspec/specs/` and `openspec/`, without project-progress or phase-status tracking.

#### Scenario: README documents project overview, setup, structure, and spec links
- **WHEN** `README.md` is read
- **THEN** it explains the project, setup, and directory layout with links to `openspec/` and `openspec/specs/`, and omits phase progress status text

### Requirement: GitHub Pages production build and deployment
Vite configuration SHALL support `/3d-page-flip/` as the base path for GitHub Pages builds while preserving `/` for local development, `.github/workflows/deploy.yml` SHALL build and publish `dist/` to GitHub Pages, and the `hongy20/3d-page-flip` repository SHALL be public with GitHub Pages enabled.

#### Scenario: GitHub Pages build resolves subpath assets and deploys cleanly
- **WHEN** the production bundle is built for GitHub Pages and deployed via `.github/workflows/deploy.yml`
- **THEN** built assets and SVG page URLs resolve under `/3d-page-flip/` and the public GitHub Pages site serves the reader cleanly
