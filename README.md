# gb-sprite

A Game Boy sprite editor web app, built with Vite and vanilla JavaScript (no framework), using native Web Components.

Inspired-by [Game Boy Tile Tool](https://nathanheffley.itch.io/game-boy-tile-tool).

This is an attempt to provide some improved ergonomics and additional tooling to support a wholistic workflow.

<p align="center">
  <img src="screenshots/screenshot-20260808.png" alt="gb-sprite screenshot">
</p>

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
