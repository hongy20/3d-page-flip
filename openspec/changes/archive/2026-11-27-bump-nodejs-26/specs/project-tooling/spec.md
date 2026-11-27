# Spec Delta

## ADDED Requirements

### Requirement: Locked Node.js 26 LTS version

The repository SHALL lock the Node.js runtime version to Node.js 26 LTS via `.nvmrc` (`26`) and `package.json` `engines.node` (`>=26 <27`).

#### Scenario: Version files declare Node.js 26 LTS consistently

- **WHEN** `.nvmrc` and `package.json` are inspected
- **THEN** `.nvmrc` specifies `26` and `package.json` `engines.node` targets Node 26 LTS

## MODIFIED Requirements

### Requirement: Automated GitHub Actions CI verification

A GitHub Actions workflow at `.github/workflows/ci.yml` SHALL run on pushes to `main` and pull requests using the Node.js version from `.nvmrc`, executing `npm ci`, `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`.

#### Scenario: CI workflow enforces lint, format, test, and build

- **WHEN** `.github/workflows/ci.yml` is inspected or triggered on GitHub Actions
- **THEN** it installs dependencies with `npm ci` on Node 26 and runs `lint`, `format:check`, `test`, and `build`

## REMOVED Requirements

### Requirement: Locked Node.js 24 LTS version

**Reason**: Superseded by `Locked Node.js 26 LTS version`.
**Migration**: Update `.nvmrc` to `26`, `package.json` (and `package-lock.json`) `engines.node` to `>=26 <27`, and `README.md` to reference Node.js 26 LTS.
