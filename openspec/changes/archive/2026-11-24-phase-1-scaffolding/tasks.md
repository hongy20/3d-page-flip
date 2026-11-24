# Tasks: Phase 1, Project Scaffolding

## 1. Open Questions & Project Setup

- [x] 1.1 Resolve `OQ-11` (single-page view, mobile portrait primary) and `OQ-12` (`scroll-snap-align: center`) with the user and record the decisions in `design.md` and `proposal.md`
- [x] 1.2 Scaffold the project with Vite `vanilla-ts` into the repo root (`package.json`, `tsconfig.json` with `strict: true`, `.gitignore` covering `node_modules/` and `dist/`), strip template demo files (counter, logos), and verify `package.json` has scripts `dev`, `build`, `preview` and zero runtime `dependencies` (`SCF-01`, `SCF-02`, `SCF-09`, `ARCH-11`, `ARCH-15`)
- [x] 1.3 Download the 18 page SVG files (`https://svg.issuu.com/231226180457-c79fccd91dae7f5484168dde1fa9b05c/page_1.svg` .. `page_18.svg`) into `public/pages/page_1.svg` .. `page_18.svg` (`SCF-03`, `VIS-05`)

## 2. Book Markup, CSS Scroll-Snap, and Zero-JS Entrypoint

- [x] 2.1 Author `index.html` with one `.book` scroller holding 18 `.page` elements, each containing renderer-agnostic `.page__content` markup displaying the corresponding SVG page (`page_1.svg` .. `page_18.svg`) plus interactive `:hover` UI, and verify all 18 pages render cleanly (`SCF-03`, `VIS-05`, `ARCH-16`)
- [x] 2.2 Author `src/style.css` implementing reset, `.book` horizontal flex scroller (`display: flex`, `overflow-x: auto`, `overflow-y: hidden`, `scroll-snap-type: x mandatory`, `100dvh`, hidden scrollbar, `overscroll-behavior-x: contain`), `.page` snap and padding rules (`flex: 0 0 100%`, `scroll-snap-align: center`, `scroll-snap-stop: always`, responsive padding), and `.page__content` aspect-ratio containment so pages always fit within available padded space without scrollbars across mobile portrait and desktop (`SCF-04`..`SCF-07`, `ARCH-04`)
- [x] 2.3 Reduce `src/main.ts` to only the stylesheet import (`import './style.css'`) and verify `grep -rE "addEventListener|on(touch|wheel|pointer|mouse)" src/` returns nothing (`SCF-08`, `ARCH-01`..`ARCH-03`)

## 3. Phase 1 Acceptance Verification

- [x] 3.1 Run `npm install && npm run build` and verify the build succeeds with zero TypeScript errors, then verify in Chrome (including mobile portrait viewport) that trackpad swipe, touch drag, `Shift+wheel`, and arrow keys each turn at most one page, settle center-snapped, and never trigger inner scrollbars
