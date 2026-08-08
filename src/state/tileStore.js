export const PIXEL_COUNT = 64; // 8x8 sprite tile
export const MAP_WIDTH = 2; // tiles per row when tiles are laid out as a sprite/map

const INITIAL_TILE_COUNT = 4;

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
