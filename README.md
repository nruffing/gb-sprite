# gb-sprite

A Game Boy sprite editor web app, built with Vite and vanilla JavaScript (no framework), using native Web Components.

Inspired-by [Game Boy Tile Tool](https://nathanheffley.itch.io/game-boy-tile-tool).

This is an attempt to provide some improved ergonomics and additional tooling to support a wholistic workflow.

## Dev setup

Requires Node `^20.19.0 || >=22.12.0` (see `.nvmrc` / `engines` in `package.json`). If you use `nvm`:

```sh
nvm use
```

Install dependencies and start the dev server:

```sh
npm install
npm run dev
```

Other commands:

```sh
npm run build    # production build
npm run preview  # preview the production build locally
npm run format   # format all files with Prettier
```

There is no test suite, linter, or type checker configured yet. Formatting is handled by Prettier (2-space indent, no tabs, 150 char print width) — VS Code is configured to format on save with the Prettier extension. Run `npm run format` to format the whole project on demand. A Husky + lint-staged pre-commit hook also runs Prettier automatically on staged files (installed via the `prepare` script when you run `npm install`).
