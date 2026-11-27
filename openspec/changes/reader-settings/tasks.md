# Tasks

## 1. Settings Store & Dedicated Settings Page

- [ ] 1.1 Create `src/settingsStore.ts` and `src/settingsStore.test.ts` (defaults `mode: "slide"`, `portraitLayout: "horizontal"`, strict validation, safe `localStorage` read/write fallback) and verify `npm test` passes.
- [ ] 1.2 Create `settings.html`, `src/settings.ts`, and `src/settings.css` with mode (`Slide`, `Stack`, `Curl`) and portrait layout (`Horizontal`, `Vertical`) controls, feature detection disabling unsupported options with accessible `aria-describedby` explanations, and a validated return link; add `settings.html` to `vite.config.ts`.

## 2. Library & Reader Integration

- [ ] 2.1 Replace the mode radio group in `reader.html` `.controls` with a `Settings` link, add a `Settings` link to `index.html`, and update `src/main.ts`, `src/style.css`, and `src/gl/renderer.ts` to apply persisted `data-mode` and `data-layout` attributes.

## 3. Verification

- [ ] 3.1 Verify persistence across reloads, disabled-option explanations (in unsupported feature mocks and landscape viewport), and multi-page `dist/` output; run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` and confirm all exit `0`.

## Workflow follow-up

- Sync delta specs and archive `reader-settings` via `openspec-archive-change` after implementation and verification are complete.
