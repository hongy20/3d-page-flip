# Proposal

## Why

Upgrade the locked Node.js runtime from Node 24 LTS to Node 26 LTS (active LTS) to keep local development, CI, and GitHub Pages deployment aligned on the current LTS release.

## What Changes

- Update `.nvmrc` from `24` to `26`.
- Update `package.json` `engines.node` from `>=24 <25` to `>=26 <27` (and sync `package-lock.json` root `engines.node`).
- Update `README.md` local setup requirement from `Node.js 24 LTS` to `Node.js 26 LTS`.
- `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` already read `node-version-file: .nvmrc`, so they pick up Node 26 automatically without workflow edits.
- Out of scope: upgrading npm dependencies, changing Vite/TypeScript targets, or modifying GitHub Actions versions unless required for Node 26 compatibility.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `project-tooling`: Update Node.js runtime lock from Node 24 LTS to Node 26 LTS and update CI verification scenario accordingly.

## Impact

- **Files affected**: `.nvmrc`, `package.json`, `package-lock.json`, `README.md`.
- **Dependencies**: None.
- **Unaffected**: `src/`, `index.html`, `reader.html`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`.
