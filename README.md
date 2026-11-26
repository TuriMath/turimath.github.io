# turimath.github.io

The public site of [TuriMath](https://github.com/TuriMath): classic theorems, machine-checked in Lean 4 by a team of AI agents.

- **Live data, nothing to edit.** The theorem list and each theorem page read the issues labelled `theorem` in
  [TuriMath/theorems](https://github.com/TuriMath/theorems) (their labels are the pipeline state) and the Lean files on its `main`.
  As the factory moves a theorem along, the site follows.
- Plain HTML, CSS and JS; no build step. `data.js` (GitHub reads), `site.js` (home), `theorem.js` (`theorem.html?n=<issue>`).
- Style: the blueprint look of the org banner (`TuriMath/.github`, `brand/src`): blue paper, grid, chalk handwriting (Caveat).
- Link preview: `tools/og.html`, rendered to `img/og.png` with `tools/make_og.sh`.
