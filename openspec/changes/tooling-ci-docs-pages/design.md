# Design

## Context

See [proposal.md](proposal.md) for motivation. Currently the repo has no `.nvmrc`, no `engines` field in `package.json`, no linter or formatter, no GitHub Actions workflows, no `vite.config.ts` (so asset URLs assume root `/`), and a `README.md` focused on OpenSpec phase progress.

## Goals / Non-Goals

**Goals:**
- Pin Node 24 LTS consistently for local `nvm` users and GitHub Actions runners.
- Add fast zero-bloat linting (`oxlint`) and formatting (`oxfmt`) in `devDependencies`.
- Enforce CI gates (`lint`, `format:check`, `test`, `build`) and automated GitHub Pages deployment.
- Keep `README.md` evergreen and concise, pointing to `openspec/specs/` for system specifications.

**Non-Goals:**
- Adding runtime dependencies or changing application rendering behavior.
- Formatting or linting generated `dist/` output or static vendor SVGs in `public/pages/`.

## Decisions

1. **Node 24 LTS locking**: Use `.nvmrc` containing `24` and `"engines": { "node": ">=24 <25" }` in `package.json`. `actions/setup-node@v4` reads `node-version-file: .nvmrc` directly, ensuring local and CI parity.
2. **Oxc toolchain (`oxlint` + `oxfmt`)**: Install `oxlint` and `oxfmt` as `devDependencies`. Configure ignore rules so `dist/` and `public/pages/` are skipped, and run `oxfmt --check` in `format:check` so CI fails on unformatted files without mutating the tree.
3. **Subpath-safe Vite build for GitHub Pages**: Add `vite.config.ts` setting `base: process.env.GITHUB_PAGES === 'true' ? '/3d-page-flip/' : '/'`, and ensure static asset paths in `index.html` (`./pages/page_*.svg` or Vite-rewritten paths) resolve properly under `/3d-page-flip/` as well as local `/`.
4. **Separate CI and Pages workflows**: Keep `.github/workflows/ci.yml` (runs on `push` to `main` and `pull_request`) separate from `.github/workflows/deploy.yml` (runs on `push` to `main` and `workflow_dispatch` using `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`).
5. **Public repository & Pages enablement**: Making `hongy20/3d-page-flip` public is a prerequisite for standard GitHub Pages hosting and is tracked explicitly as a deployment verification step.

## Risks / Trade-offs

- **Formatting churn on existing files** → Run `npm run format` once in the implementation PR before enabling `format:check` in CI.
- **Root-relative `/pages/page_*.svg` 404s on GitHub Pages** → Verify in `dist/index.html` (and any JS loader) that `/pages/` references are base-aware (`./pages/...` or `import.meta.env.BASE_URL`).
