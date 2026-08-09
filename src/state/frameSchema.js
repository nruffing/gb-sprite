import { PALETTE_SIZE } from "./paletteStore.js";

export const PIXEL_COUNT = 64; // 8x8 sprite tile

// True if `pixels` is a valid PIXEL_COUNT-length array of palette color
// indices.
export function isValidPixels(pixels) {
  return (
    Array.isArray(pixels) &&
    pixels.length === PIXEL_COUNT &&
    pixels.every(
      (colorIndex) =>
        Number.isInteger(colorIndex) &&
        colorIndex >= 0 &&
        colorIndex < PALETTE_SIZE,
    )
  );
}

// True if `tiles` is a valid array of tiles' pixel arrays (a single frame's
// worth), optionally required to be an exact tile count.
export function isValidTilesArray(tiles, expectedTileCount) {
  return (
    Array.isArray(tiles) &&
    (expectedTileCount === undefined || tiles.length === expectedTileCount) &&
    tiles.every(isValidPixels)
  );
}

// Writes pixels data (the shape isValidTilesArray validates) onto an
// existing Frame's Tile instances in place, rather than replacing them.
export function applyTilesToFrame(frame, tiles) {
  tiles.forEach((pixels, tileIndex) => {
    pixels.forEach((colorIndex, pixelIndex) =>
      frame.tiles[tileIndex].setPixel(pixelIndex, colorIndex),
    );
  });
}
