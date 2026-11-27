# Tasks

## 1. Node Version Lock & Oxc Tooling

- [ ] 1.1 Create `.nvmrc` containing `24` and add `"engines": { "node": ">=24 <25" }` to `package.json`, verifying both files consistently lock Node 24 LTS.
- [ ] 1.2 Install `oxlint` and `oxfmt` as `devDependencies` (keeping runtime `dependencies` empty), add `lint`, `format`, and `format:check` scripts to `package.json` plus ignore/config excluding `dist/` and `public/pages/`, run `npm run format`, and verify `npm run lint && npm run format:check` exit 0.

## 2. GitHub Pages Build & CI Workflows

- [ ] 2.1 Add `vite.config.ts` setting `base: process.env.GITHUB_PAGES === 'true' ? '/3d-page-flip/' : '/'`, ensure asset URLs in `index.html` resolve cleanly under `/3d-page-flip/`, and verify `GITHUB_PAGES=true npm run build` emits `/3d-page-flip/` paths in `dist/`.
- [ ] 2.2 Add `.github/workflows/ci.yml` running on pushes to `main` and pull requests with Node from `.nvmrc`, `npm ci`, `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`, verifying valid workflow YAML.
- [ ] 2.3 Add `.github/workflows/deploy.yml` building with `GITHUB_PAGES=true` and deploying `dist/` to GitHub Pages via official `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.

## 3. README Documentation

- [ ] 3.1 Rewrite `README.md` with a short project description, what it does, local setup, repository structure, and links to `openspec/` and `openspec/specs/`, removing project-progress / phase-status tracking and verifying all links resolve.

## 4. Verification & Public Publish

- [ ] 4.1 Run `npm run lint && npm run format:check && npm test && npm run build` and confirm all checks pass with zero errors.
- [ ] 4.2 Switch `hongy20/3d-page-flip` repository visibility to public, enable GitHub Pages (GitHub Actions source), push to `main`, and verify both CI and the live GitHub Pages URL load cleanly.

## Workflow follow-up

- Sync delta specs and archive `tooling-ci-docs-pages` via `openspec-archive-change` after implementation and verification are complete.
