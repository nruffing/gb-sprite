# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`gb-sprite` is a Game Boy sprite editor web app that exports GBDK-2020-compatible C source for the drawn sprite. It's a plain Vite + vanilla JavaScript project (no framework) using native Web Components.

## Commands

See `README.md` for dev setup. In short: `npm run dev` / `npm run build` / `npm run preview` / `npm test`. There is no linter or type checker configured yet. Formatting is handled by Prettier (`.prettierrc`); VS Code is configured to format on save with the Prettier extension. Unit tests use Vitest (`vitest.config.js`), currently running in the default `node` test environment (no `jsdom`/`happy-dom` configured) — see Testing below for what that does and doesn't cover. `.github/workflows/ci.yml` runs `format:check` / `test` / `build` on every push and PR to `main`, then uploads `dist/` as a workflow artifact.

## Testing

Every pure function (no DOM access, no shared/store state, output determined solely by its arguments) gets a co-located `*.test.js` file — write it as part of the same change that adds or modifies the function, without waiting to be asked. This covers plain utility modules (`hexUtils.js`, `generateMapCode.js`, `generateTilesCode.js`, `encodeIndexedPng.js`, `resizeOption.js`, etc.) in full, including their less-obvious edge cases (empty/boundary input, error paths), not just a happy-path smoke test.

A function that needs `document`/`window`/canvas (e.g. `highlightCCode.js`) or reads from a shared store isn't a candidate for this — leave it untested for now rather than reaching for `jsdom`/`happy-dom`, until one of those is actually added to the project. A component file itself (anything that calls `customElements.define(...)` at module load) can't be imported in Vitest's default `node` environment at all — it throws immediately, since there's no DOM. If a component contains pure logic worth testing (parsing, formatting, bitmask math, etc.), extract it into a plain sibling module with no CSS/DOM imports — e.g. `resizeOption.js` next to `DynamicPanel.js`, `hexUtils.js`/`generateTilesCode.js`/`generateMapCode.js` next to `CodePreview.js`, `encodeIndexedPng.js`/`generateSpritePng.js` (its `buildSpritePixelGrid`/`hexToRgb` helpers are exported specifically for this) next to `TilesetIO.js` — and have the component import from there. This is the same reason `src/state/` stores stay untested: they're inherently stateful singletons, not pure functions, so they're out of scope for this rule.

## Architecture

- `index.html` — entry HTML, mounts into `#app` (a CSS grid with `left`/`right`/`bottom` areas) and loads `src/main.js` as an ES module.
- `src/main.js` — application entry point: imports global styles, registers all components, and wires up global keyboard shortcuts (palette hotkeys `0`–`3` and `` ` ``).
- `src/components/` — UI built as native custom elements, one subfolder per component (e.g. `SpriteEditorGrid/`). Each subfolder contains a `ComponentName.js` (`customElements.define(...)`, attaches a shadow root, builds markup via a tagged template literal — the `/* html */` comment tag enables HTML syntax highlighting in editors) and a co-located `ComponentName.css`, imported via Vite's `?inline` and injected into a `<style>` tag inside the shadow root. This keeps styles fully scoped while still giving real CSS intellisense (autocomplete, `var()` hints) in the `.css` file, which an inline template-literal `<style>` block can't get.
- `src/state/` — small shared state singletons (`paletteStore.js`, `tileStore.js`, `pointerState.js`), each a class extending `EventTarget` that dispatches a `"change"` event on updates. Components subscribe to the relevant store and re-render on change, and call the store's setter methods to request changes — this is the project's state management pattern in place of a framework/store library.
- `src/style.css` — global styles and design tokens, all CSS custom properties on `:root` prefixed `--gbs-*`. Numeric scales (`--gbs-color-default-0` through `-1000`, `--gbs-font-size-100` through `-900`, `--gbs-spacer-100` through `-900`) are linear ramps — keep new steps evenly spaced rather than picking arbitrary values. Semantic variables (`--grid-border-color`, `--divider-border`, etc.) alias into these scales rather than hardcoding colors/sizes. Custom properties defined here are visible inside every component's shadow DOM (they pierce shadow boundaries), so components should reference these tokens instead of redefining values locally. Component `.css` files should never hardcode `px`/`em` sizes or color values directly — always reference (or, if missing, add) a `--gbs-*` token in `src/style.css` instead.
- `.vscode/html-custom-data.json` — registers every custom element (and its attributes) with VS Code's built-in HTML language service (via the `html.customData` setting) so tag names get completion/hover docs in `.html` files and in tagged template literals. Add an entry here whenever a new component is created.

When adding new UI pieces, follow the existing pattern: a subfolder per component under `src/components/` with a co-located `.css` file, shared cross-component state lives in `src/state/` as an `EventTarget`-based store, and new design-token values go in `src/style.css` following the existing `--gbs-*` scale conventions.

## Keeping docs in sync

Whenever a component is added, removed, or its attributes change, update `.vscode/html-custom-data.json` to match as part of that same change — don't ask first, just do it. Likewise, when the architecture or conventions described above change, update this file (`CLAUDE.md`) directly rather than letting it drift. The same applies to tooling: whenever a dev-facing tool, script, or hook changes (e.g. new `package.json` scripts, linters, formatters, git hooks), update `README.md`'s dev setup section to match as part of that same change.

## Dependency policy

New `devDependencies` (build tooling, formatters, git hooks, etc.) are fine to add as needed. New runtime `dependencies` — anything shipped to the browser — should be heavily scrutinized: this project is intentionally framework-free vanilla JS/Web Components, so a new runtime dependency is a bigger call than it looks. Prefer no dependency, or a dev-only one, before reaching for a runtime package; if one seems necessary, flag it and explain why before adding it.
