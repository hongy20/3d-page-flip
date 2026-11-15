# Open Questions & Decisions

Agents MUST NOT resolve `Open` items on their own (see AGENTS.md). When one is decided,
record the answer and its rationale, set `Decided`, and update the affected specs.

| ID | Question | Affects | Options / Notes | Status |
|----|----------|---------|-----------------|--------|
| OQ-01 | **Raw WebGL2 or Three.js?** | ARCH-12, 030 | `texElementImage2D` is a raw-GL method that Three.js doesn't wrap. **Raw WebGL2** means no deps and no glue. **Three.js** brings familiar scene/camera helpers, but needs hacks to upload into its textures and adds ~150 KB. Recommendation: raw WebGL2. | Open |
| OQ-02 | **What does CSS `--progress` drive?** The shader uses `scrollLeft` (ARCH-06), so `--progress` can't reach the GPU without JS reading computed styles. | CSS-06 | (a) Hide/fade the flat DOM page during a turn; (b) DOM-side shadow/vignette effects; (c) debug readout only; (d) JS reads `--progress` via `getComputedStyle` instead of `scrollLeft` (contradicts ARCH-06). | Open |
| OQ-03 | **DOM structure: where does the scroller live relative to `<canvas layoutsubtree>`?** Textured elements must be canvas children; canvas children aren't painted directly. | GL-02, GL-05, SCF-03 | (a) Scroller with pages *inside* the canvas subtree: one DOM, native scroll, canvas paints everything (needs a spike to confirm scrolling works inside `layoutsubtree`); (b) a visible scroller plus a separate canvas holding duplicate page content, with the overlay `pointer-events: none`; (c) a transparent "ghost" scroller for input only, with content only in the canvas. | Open |
| OQ-04 | **Back of a turning page:** show the next page's content, its mirror, or blank paper? | SHD-06 | Real books show the reverse side (the next page in sequence). | Open |
| OQ-05 | **Texture management:** one texture per page, or a pool of 2–3 (current/next/prev)? | GL-08 | A pool scales to large books; per-page is simpler for a 4–8 page PoC. | Open |
| OQ-06 | **Lighting:** include simple diffuse shading from the deformed normal? | SHD-05 | It greatly improves curl readability at low cost. Proposed: yes, minimal Lambert. | Open |
| OQ-07 | **Paper title and citation:** the brief says "Deforming Pages of 3D Electronic Books". The known publication is "Turning Pages of 3D Electronic Books" (Hong, Card, Chen, IEEE 3DUI 2006). | 001 references | Confirm the intended source, and confirm the formulas match it. | Open |
| OQ-08 | **`coneParams(p)` curve:** how do θ and A_y evolve over the turn? | SHD-10 | The paper uses piecewise functions over turn time. Proposed starting point: θ eases from π/2 down to ~0.1–0.3 rad, and A_y moves from slightly below the page to strongly negative. Tune visually. | Open |
| OQ-09 | **Add the binding-axis rotation (third uniform, e.g. `u_rho`)?** The paper composes the cone deformation with a rotation about Y to complete the turn. The brief specifies only `u_theta` and `u_Ay`. | SHD-11 | Without it, the page curls up but never lands on the left. | Open |
| OQ-10 | **Testing:** allow Vitest as a dev dependency for unit tests of the math? | 040 ACs | The alternative is ad-hoc test scripts. | Open |
| OQ-11 | **Single page or two-page spread** for the PoC? | 000 scope | Currently scoped as single page. | Open |
| OQ-12 | **Snap alignment `start` vs `center`.** | SCF-05, CSS-03 | `start` matches 100%-wide pages naturally. | Open |
