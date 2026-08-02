# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`gb-sprite` is a Game Boy sprite editor web app that exports GBDK-2020-compatible C source for the drawn sprite. It's a plain Vite + vanilla JavaScript project (no framework) using native Web Components.

## Commands

See `README.md` for dev setup. In short: `npm run dev` / `npm run build` / `npm run preview`. There is no test suite, linter, or type checker configured yet. Formatting is handled by Prettier (`.prettierrc`); VS Code is configured to format on save with the Prettier extension.

## Architecture

- `index.html` — entry HTML, mounts into `#app` (a CSS grid with `left`/`right`/`bottom` areas) and loads `src/main.js` as an ES module.
- `src/main.js` — application entry point: imports global styles, registers all components, and wires up global keyboard shortcuts (palette hotkeys `0`–`3` and `` ` ``).
- `src/components/` — UI built as native custom elements, one subfolder per component (e.g. `SpriteEditorGrid/`). Each subfolder contains a `ComponentName.js` (`customElements.define(...)`, attaches a shadow root, builds markup via a tagged template literal — the `/* html */` comment tag enables HTML syntax highlighting in editors) and a co-located `ComponentName.css`, imported via Vite's `?inline` and injected into a `<style>` tag inside the shadow root. This keeps styles fully scoped while still giving real CSS intellisense (autocomplete, `var()` hints) in the `.css` file, which an inline template-literal `<style>` block can't get.
- `src/state/` — small shared state singletons (`paletteStore.js`, `spriteStore.js`, `pointerState.js`), each a class extending `EventTarget` that dispatches a `"change"` event on updates. Components subscribe to the relevant store and re-render on change, and call the store's setter methods to request changes — this is the project's state management pattern in place of a framework/store library.
- `src/style.css` — global styles and design tokens, all CSS custom properties on `:root` prefixed `--gbs-*`. Numeric scales (`--gbs-color-default-0` through `-1000`, `--gbs-font-size-100` through `-900`, `--gbs-spacer-100` through `-900`) are linear ramps — keep new steps evenly spaced rather than picking arbitrary values. Semantic variables (`--grid-border-color`, `--divider-border`, etc.) alias into these scales rather than hardcoding colors/sizes. Custom properties defined here are visible inside every component's shadow DOM (they pierce shadow boundaries), so components should reference these tokens instead of redefining values locally.
- `.vscode/html-custom-data.json` — registers every custom element (and its attributes) with VS Code's built-in HTML language service (via the `html.customData` setting) so tag names get completion/hover docs in `.html` files and in tagged template literals. Add an entry here whenever a new component is created.

When adding new UI pieces, follow the existing pattern: a subfolder per component under `src/components/` with a co-located `.css` file, shared cross-component state lives in `src/state/` as an `EventTarget`-based store, and new design-token values go in `src/style.css` following the existing `--gbs-*` scale conventions.
