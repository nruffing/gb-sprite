import { encodeIndexedPng } from "./encodeIndexedPng.js";

const TILE_SIZE = 8;

// Lays every tile out into a single frame, tiles.length / mapWidth rows of
// mapWidth tiles each — the same arrangement FramePreview renders and
// generateMapCode encodes, matching the GBDK-2020 tooling convention of one
// PNG frame per sprite (see -sw/-sh in png2asset).
export function buildSpritePixelGrid(tiles, mapWidth) {
  const rows = Math.ceil(tiles.length / mapWidth);
  const width = mapWidth * TILE_SIZE;
  const height = rows * TILE_SIZE;
  const pixels = new Uint8Array(width * height);

  tiles.forEach((tile, tileIndex) => {
    const originX = (tileIndex % mapWidth) * TILE_SIZE;
    const originY = Math.floor(tileIndex / mapWidth) * TILE_SIZE;
    for (let y = 0; y < TILE_SIZE; y++) {
      for (let x = 0; x < TILE_SIZE; x++) {
        pixels[(originY + y) * width + originX + x] =
          tile.pixels[y * TILE_SIZE + x];
      }
    }
  });

  return { width, height, pixels };
}

// Lays multiple frames' pixel grids out side by side, left to right — for
// now (one PNG per whole tileset export) frames just go in a single row;
// taller frames pad shorter ones below with transparent-equivalent color 0
// rather than stretching anything.
export function buildFramesPixelGrid(framesTiles, mapWidth) {
  const grids = framesTiles.map((tiles) =>
    buildSpritePixelGrid(tiles, mapWidth),
  );
  const width = grids.reduce((sum, grid) => sum + grid.width, 0);
  const height = Math.max(0, ...grids.map((grid) => grid.height));
  const pixels = new Uint8Array(width * height);

  let originX = 0;
  grids.forEach((grid) => {
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        pixels[y * width + originX + x] = grid.pixels[y * grid.width + x];
      }
    }
    originX += grid.width;
  });

  return { width, height, pixels };
}

export function hexToRgb(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    throw new Error(`[gb-sprite] couldn't parse palette color "${hex}"`);
  }
  const value = match[1];
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

// Reads the live --gbs-palette-N custom properties (defined in
// src/style.css) rather than hardcoding colors here, so the PNG export
// always matches whatever the editor is currently displaying.
function readPaletteColors(paletteSize) {
  const styles = getComputedStyle(document.documentElement);
  return Array.from({ length: paletteSize }, (_, index) =>
    hexToRgb(styles.getPropertyValue(`--gbs-palette-${index}`)),
  );
}

// Encodes every frame as one indexed PNG, laid out side by side horizontally
// (see encodeIndexedPng.js for the format details). `framesTiles` is an
// array of tile arrays — one per frame.
export function generateSpritePng(framesTiles, mapWidth, paletteSize) {
  const { width, height, pixels } = buildFramesPixelGrid(framesTiles, mapWidth);
  const paletteColors = readPaletteColors(paletteSize);
  return encodeIndexedPng({ width, height, pixels, paletteColors });
}
