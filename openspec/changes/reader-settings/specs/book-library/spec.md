# Spec Delta

## MODIFIED Requirements

### Requirement: Multi-page Vite production build

`vite.config.ts` SHALL configure Rollup `build.rollupOptions.input` with `index.html`, `reader.html`, and `settings.html` using relative/base-aware asset links so both local dev/preview and subpath deployments (such as GitHub Pages `/dropp/`) resolve all entrypoints and assets with zero 404s. `index.html` SHALL include a native `<a href="./settings.html">` link to settings.

#### Scenario: Production build emits both library and reader entrypoints

- **WHEN** `npm run build` is executed
- **THEN** `dist/` contains `dist/index.html`, `dist/reader.html`, and `dist/settings.html` with valid bundled JS/CSS references
