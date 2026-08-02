# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`gb-sprite` is a Game Boy sprite editor web app, in early scaffold stage. It's a plain Vite + vanilla JavaScript project (no framework) using native Web Components.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build locally

There is no test suite, linter, or type checker configured yet. Formatting is handled by Prettier (`.prettierrc`: 2-space indent, no tabs); VS Code is configured to format on save with the Prettier extension.

## Architecture

- `index.html` — entry HTML, mounts into `#app` and loads `src/main.js` as an ES module.
- `src/main.js` — application entry point.
- `src/components/` — UI built as native custom elements (`customElements.define(...)`), each in its own file, using shadow DOM for encapsulation (e.g. `SpriteEditorGrid.js` defines `<sprite-editor-grid>`).
- `src/style.css` — global styles.

When adding new UI pieces, follow the existing pattern: one custom element per file in `src/components/`, attaching a shadow root and building markup via a tagged template literal (the `/* html */` comment tag is used to enable HTML syntax highlighting/formatting in editors — keep it on inline HTML template strings).
