import { PALETTE_SIZE } from "./paletteStore.js";

export const PIXEL_COUNT = 64; // 8x8 sprite tile
export const MAP_WIDTH = 2; // tiles per row when tiles are laid out as a sprite/map

export const INITIAL_TILE_COUNT = 4;
const SCHEMA_VERSION = 1;

export class Tile {
  #pixels = new Array(PIXEL_COUNT).fill(0);

  get pixels() {
    return this.#pixels;
  }

  setPixel(index, colorIndex) {
    this.#pixels[index] = colorIndex;
  }
}

class TileStore extends EventTarget {
  #tiles = Array.from({ length: INITIAL_TILE_COUNT }, () => new Tile());
  #selectedTileIndex = 0;

  get tiles() {
    return this.#tiles;
  }

  get selectedTileIndex() {
    return this.#selectedTileIndex;
  }

  isValidTileIndex(index) {
    return Number.isInteger(index) && index >= 0 && index < this.#tiles.length;
  }

  setSelectedTileIndex(index) {
    if (!this.isValidTileIndex(index)) {
      console.warn(`[gb-sprite] tried to set selected tile to index ${index}`);
      return;
    }

    this.#selectedTileIndex = index;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { tiles: this.tiles, selectedTileIndex: index },
      }),
    );
  }

  // Called by JSON.stringify(tileStore) for save/export.
  toJSON() {
    return {
      version: SCHEMA_VERSION,
      pixelCount: PIXEL_COUNT,
      mapWidth: MAP_WIDTH,
      tiles: this.#tiles.map((tile) => tile.pixels),
    };
  }

  isValidTilesData(data) {
    // Tile count is fixed for now — TileGallery/SpritePreview build their
    // markup once from the initial tile count and don't rebuild it on change.
    const { version, pixelCount, tiles } = data ?? {};
    if (version !== SCHEMA_VERSION) return false;

    return (
      pixelCount === PIXEL_COUNT &&
      Array.isArray(tiles) &&
      tiles.length === this.#tiles.length &&
      tiles.every(
        (pixels) =>
          Array.isArray(pixels) &&
          pixels.length === PIXEL_COUNT &&
          pixels.every(
            (colorIndex) =>
              Number.isInteger(colorIndex) &&
              colorIndex >= 0 &&
              colorIndex < PALETTE_SIZE,
          ),
      )
    );
  }

  // Replaces all tiles from parsed save/import data (the shape toJSON produces).
  // Returns whether the load succeeded.
  loadTiles(data) {
    if (!this.isValidTilesData(data)) {
      console.warn("[gb-sprite] tried to load invalid tileset data", data);
      return false;
    }

    this.#tiles = data.tiles.map((pixels) => {
      const tile = new Tile();
      pixels.forEach((colorIndex, index) => tile.setPixel(index, colorIndex));
      return tile;
    });
    this.#selectedTileIndex = 0;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          tiles: this.tiles,
          selectedTileIndex: this.#selectedTileIndex,
        },
      }),
    );
    return true;
  }

  setPixel(pixelIndex, colorIndex) {
    const tile = this.#tiles[this.#selectedTileIndex];
    if (!tile) {
      console.warn(
        `[gb-sprite] tried to set pixel on tile with index ${this.#selectedTileIndex}`,
      );
      return;
    }
    tile.setPixel(pixelIndex, colorIndex);
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          tiles: this.tiles,
          selectedTileIndex: this.#selectedTileIndex,
        },
      }),
    );
  }
}

export const tileStore = new TileStore();
