# Design

## Context

See [proposal.md](proposal.md) for motivation. Currently the repo has no `vite.config.ts` (so asset URLs assume root `/`), no GitHub Pages deployment workflow, and private repository visibility. This change is deferred until the project is ready for public release.

## Goals / Non-Goals

**Goals:**

- Support subpath-safe production builds under `/3d-page-flip/` for GitHub Pages while keeping `/` for local development.
- Automate `dist/` deployment to GitHub Pages using official GitHub Actions.
- Document and verify making `hongy20/3d-page-flip` public and enabling GitHub Pages.

**Non-Goals:**

- Adding runtime dependencies or changing application rendering behavior.
- Duplicating CI lint/format/test checks (handled by `.github/workflows/ci.yml` in `tooling-ci-docs`).

## Decisions

1. **Subpath-safe Vite build for GitHub Pages**: Add `vite.config.ts` setting `base: process.env.GITHUB_PAGES === 'true' ? '/3d-page-flip/' : '/'`, and ensure static asset paths in `index.html` (`./pages/page_*.svg` or Vite-rewritten paths) resolve properly under `/3d-page-flip/` as well as local `/`.
2. **Separate Pages deployment workflow**: Keep `.github/workflows/deploy.yml` (runs on `push` to `main` and `workflow_dispatch` using `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`) independent from `.github/workflows/ci.yml`, reading Node 24 from `.nvmrc`.
3. **Public repository & Pages enablement**: Making `hongy20/3d-page-flip` public is a prerequisite for standard GitHub Pages hosting and is tracked explicitly as a deployment verification step.

## Risks / Trade-offs

- **Root-relative `/pages/page_*.svg` 404s on GitHub Pages** → Verify in `dist/index.html` (and any JS loader) that `/pages/` references are base-aware (`./pages/...` or `import.meta.env.BASE_URL`).
