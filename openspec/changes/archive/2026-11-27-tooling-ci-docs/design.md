# Design

## Context

See [proposal.md](proposal.md) for motivation. Currently the repo has no `.nvmrc`, no `engines` field in `package.json`, no linter or formatter, no GitHub Actions workflows, and a `README.md` focused on stale OpenSpec progress status.

## Goals / Non-Goals

**Goals:**

- Pin Node 24 LTS consistently for local `nvm` users and GitHub Actions runners.
- Add fast zero-bloat linting (`oxlint`) and formatting (`oxfmt`) in `devDependencies`.
- Enforce CI gates (`lint`, `format:check`, `test`, `build`).
- Keep `README.md` evergreen and concise, pointing to `openspec/specs/` for system specifications.

**Non-Goals:**

- Adding runtime dependencies or changing application rendering behavior.
- Formatting or linting generated `dist/` output or static vendor SVGs in `public/pages/`.
- Configuring GitHub Pages subpath builds, deployment workflows, or public repository release (deferred to `publish-public-demo`).

## Decisions

1. **Node 24 LTS locking**: Use `.nvmrc` containing `24` and `"engines": { "node": ">=24 <25" }` in `package.json`. `actions/setup-node@v4` reads `node-version-file: .nvmrc` directly, ensuring local and CI parity.
2. **Oxc toolchain (`oxlint` + `oxfmt`)**: Install `oxlint` and `oxfmt` as `devDependencies`. Configure ignore rules so `dist/` and `public/pages/` are skipped, and run `oxfmt --check` in `format:check` so CI fails on unformatted files without mutating the tree.
3. **CI workflow**: Add `.github/workflows/ci.yml` (runs on `push` to `main` and `pull_request`) executing `npm ci`, `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` on Node 24 from `.nvmrc`.

## Risks / Trade-offs

- **Formatting churn on existing files** → Run `npm run format` once in the implementation PR before enabling `format:check` in CI.
