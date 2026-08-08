export const PIXEL_COUNT = 64; // 8x8 sprite tile
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

  get tiles() {
    return this.#tiles;
  }
}

export const tileStore = new TileStore();
