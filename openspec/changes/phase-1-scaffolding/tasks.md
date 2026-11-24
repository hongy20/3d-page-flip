# Tasks: Phase 1, Project Scaffolding

## 1. Open Questions & Project Setup

- [ ] 1.1 Resolve `OQ-11` (single page vs two-page spread) and `OQ-12` (`scroll-snap-align: start` vs `center`) with the user and verify the decisions are recorded in `specs/open-questions.md` and `design.md`
- [ ] 1.2 Scaffold the project with Vite `vanilla-ts` into the repo root (`package.json`, `tsconfig.json` with `strict: true`, `.gitignore` covering `node_modules/` and `dist/`), strip template demo files (counter, logos), and verify `package.json` has scripts `dev`, `build`, `preview` and zero runtime `dependencies` (`SCF-01`, `SCF-02`, `SCF-09`, `ARCH-11`, `ARCH-15`)

## 2. Book Markup, CSS Scroll-Snap, and Zero-JS Entrypoint

- [ ] 2.1 Author `index.html` with one `.book` scroller holding `N >= 4` `.page` elements, each containing renderer-agnostic `.page__content` markup with static HTML/SVG content (including at least one SVG illustration and one `:hover` interactive element), and verify all 4+ pages render with selectable text (`SCF-03`, `VIS-05`, `ARCH-16`)
- [ ] 2.2 Author `src/style.css` implementing reset, `.book` horizontal flex scroller (`display: flex`, `overflow-x: auto`, `overflow-y: hidden`, `scroll-snap-type: x mandatory`, `100dvh`, hidden scrollbar, `overscroll-behavior-x: contain`), `.page` snap rules (`flex: 0 0 100%`, `scroll-snap-align`, `scroll-snap-stop: always`), and `.page__content` fixed-aspect-ratio (3:4) paper styling (`SCF-04`..`SCF-07`, `ARCH-04`)
- [ ] 2.3 Reduce `src/main.ts` to only the stylesheet import (`import './style.css'`) and verify `grep -rE "addEventListener|on(touch|wheel|pointer|mouse)" src/` returns nothing (`SCF-08`, `ARCH-01`..`ARCH-03`)

## 3. Phase 1 Acceptance Verification

- [ ] 3.1 Run `npm install && npm run build` and verify the build succeeds with zero TypeScript errors, then verify in Chrome that trackpad swipe, touch drag (DevTools device mode), `Shift+wheel`, and arrow keys each turn at most one page and settle snapped
