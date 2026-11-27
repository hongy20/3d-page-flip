# Tasks

## 1. Node Version Lock & Oxc Tooling

- [x] 1.1 Create `.nvmrc` containing `24` and add `"engines": { "node": ">=24 <25" }` to `package.json`, verifying both files consistently lock Node 24 LTS.
- [x] 1.2 Install `oxlint` and `oxfmt` as `devDependencies` (keeping runtime `dependencies` empty), add `lint`, `format`, and `format:check` scripts to `package.json` plus ignore/config excluding `dist/` and `public/pages/`, run `npm run format`, and verify `npm run lint && npm run format:check` exit 0.

## 2. CI Workflow

- [x] 2.1 Add `.github/workflows/ci.yml` running on pushes to `main` and pull requests with Node from `.nvmrc`, `npm ci`, `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`, verifying valid workflow YAML.

## 3. README Documentation

- [x] 3.1 Rewrite `README.md` with a short project description, what it does, local setup, repository structure, and links to `openspec/` and `openspec/specs/`, removing project-progress / status tracking and verifying all links resolve.

## 4. Verification

- [x] 4.1 Run `npm run lint && npm run format:check && npm test && npm run build` and confirm all checks pass with zero errors.

## Workflow follow-up

- Sync delta specs and archive `tooling-ci-docs` via `openspec-archive-change` after implementation and verification are complete.
