# project-tooling Specification

## Purpose

Defines repository-level Node.js version locking, Oxlint/Oxfmt code quality checks, GitHub Actions CI, and concise project README documentation for Dropp.

## Requirements

### Requirement: Locked Node.js 26 LTS version

The repository SHALL lock the Node.js runtime version to Node.js 26 LTS via `.nvmrc` (`26`) and `package.json` `engines.node` (`>=26 <27`).

#### Scenario: Version files declare Node.js 26 LTS consistently

- **WHEN** `.nvmrc` and `package.json` are inspected
- **THEN** `.nvmrc` specifies `26` and `package.json` `engines.node` targets Node 26 LTS

### Requirement: Oxlint and Oxfmt code quality tooling

`package.json` SHALL configure `oxlint` and `oxfmt` as `devDependencies` (keeping runtime `dependencies` empty) and expose `lint`, `format`, and `format:check` npm scripts.

#### Scenario: Lint and format check scripts succeed cleanly

- **WHEN** `npm run lint` and `npm run format:check` are executed
- **THEN** both commands exit with status `0` and `package.json` still contains zero runtime `dependencies`

### Requirement: Automated GitHub Actions CI verification

A GitHub Actions workflow at `.github/workflows/ci.yml` SHALL run on pushes to `main` and pull requests using the Node.js version from `.nvmrc`, executing `npm ci`, `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`.

#### Scenario: CI workflow enforces lint, format, test, and build

- **WHEN** `.github/workflows/ci.yml` is inspected or triggered on GitHub Actions
- **THEN** it installs dependencies with `npm ci` on Node 26 and runs `lint`, `format:check`, `test`, and `build`

### Requirement: Concise project README with spec links

`README.md` SHALL describe Dropp as a lightweight, functional e-book reader built with vanilla TypeScript and zero frameworks or runtime dependencies (supporting page turning, zoom, spec-driven development, vibe-coded workflow, and minimal CI), state **Chrome 157+** with no experimental flag instructions, omit Hong–Card–Chen citations and project-progress tracking, and document accurate local setup, repository structure, and links to `openspec/specs/` and `openspec/`.

#### Scenario: README documents project overview, setup, structure, and spec links

- **WHEN** `README.md` is read
- **THEN** it presents the vanilla TypeScript overview, Chrome 157+ requirement without flags, accurate repository layout, and links to `openspec/` and `openspec/specs/`, without academic curl citations or progress tracking
