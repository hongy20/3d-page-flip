# project-tooling Specification

## Purpose

Defines repository-level Node.js version locking, Oxlint/Oxfmt code quality checks, GitHub Actions CI, and concise project README documentation for WebBook 3D.

## Requirements

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

`README.md` SHALL provide a concise description of WebBook 3D, what it does, local setup and repository structure, and links to `openspec/specs/` and `openspec/`, without project-progress or status tracking.

#### Scenario: README documents project overview, setup, structure, and spec links

- **WHEN** `README.md` is read
- **THEN** it explains the project, setup, and directory layout with links to `openspec/` and `openspec/specs/`, and omits project progress status text
