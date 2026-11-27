# Tasks

## 1. Reader Controls Markup

- [x] 1.1 Reorder the `<input type="radio" name="mode">` options inside `.controls__group` in `index.html` to `Slide`, `Stack`, `Curl` (`Curl` last) and move the `checked` attribute from `value="curl"` to `value="slide"`, verifying `index.html` renders `Slide` checked by default.
- [x] 1.2 Remove `<span class="controls__divider" aria-hidden="true"></span>` and the `Debug` `<label class="controls__option controls__option--toggle">` checkbox block from `index.html`, verifying no `debug` input or divider markup remains.

## 2. Debug & Toggle CSS Cleanup

- [x] 2.1 Remove `@property --progress-pct`, `.controls__divider`, `.controls__option--toggle:has(:checked)`, and all `body:has(input[name='debug']:checked)` rules from `src/style.css`, keeping `.controls`, `--progress`, and all `slide`/`stack`/`curl` styles intact, and verify `npm run build` succeeds.

## 3. Default Mode Fallback Alignment

- [x] 3.1 Update `readActiveMode()` in `src/gl/renderer.ts` to check `checked?.value === 'curl' || checked?.value === 'stack'` and fall back to `'slide'` so the JS fallback matches the new default mode, and verify `npm run build` and `npm test` pass.

## 4. Verification

- [x] 4.1 Run `npm run build` and `npm test` and confirm zero TypeScript, build, or unit-test errors.
- [x] 4.2 Static check: confirm zero references to `name="debug"`, `name='debug'`, `--progress-pct`, `controls__divider`, or `controls__option--toggle` remain in `index.html` and `src/`, and no control/navigation JS listeners were added.
- [x] 4.3 Manual check in Chrome 158+: verify `.controls` renders only `Slide`, `Stack`, `Curl` in that order (no `Debug` toggle or divider), `Slide` is selected and renders flat horizontal slide on initial load, and switching to `Stack` and `Curl` updates transitions immediately.

## Workflow follow-up

- Sync delta specs and archive `remove-debug-reorder-curl` via `openspec-archive-change` after implementation and verification are complete.
