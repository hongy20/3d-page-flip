# Tasks

## 1. Subpath Build & Pages Workflow

- [x] 1.1 Add `vite.config.ts` setting `base: process.env.GITHUB_PAGES === 'true' ? '/3d-page-flip/' : '/'`, ensure asset URLs in `index.html` resolve cleanly under `/3d-page-flip/`, and verify `GITHUB_PAGES=true npm run build` emits `/3d-page-flip/` paths in `dist/` while standard `npm run build` preserves `/`.
- [x] 1.2 Add `.github/workflows/deploy.yml` using Node from `.nvmrc`, building with `GITHUB_PAGES=true npm run build`, and deploying `dist/` to GitHub Pages via official `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`, verifying valid workflow YAML.

## 2. Public Release & Verification

- [ ] 2.1 Switch `hongy20/3d-page-flip` repository visibility to public, enable GitHub Pages (GitHub Actions source), push to `main`, and verify the live GitHub Pages URL loads all pages and styles with zero 404 errors.

## Workflow follow-up

- Sync delta specs and archive `publish-public-demo` via `openspec-archive-change` after implementation and verification are complete.
