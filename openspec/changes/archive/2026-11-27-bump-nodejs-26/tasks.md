# Tasks

## 1. Node.js 26 Version & Docs Updates

- [x] 1.1 Update `.nvmrc` to `26` and update `engines.node` to `">=26 <27"` in `package.json` and `package-lock.json` (keeping zero runtime dependencies and no unintended lockfile churn).
- [x] 1.2 Update `README.md` local setup prerequisite from `Node.js 24 LTS` to `Node.js 26 LTS` and verify `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` both continue reading `node-version-file: .nvmrc`.

## 2. Verification

- [x] 2.1 Run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` on Node 26 and confirm all exit `0`.

## Workflow follow-up

- Sync delta specs and archive `bump-nodejs-26` via `openspec-archive-change` after implementation and verification are complete.
