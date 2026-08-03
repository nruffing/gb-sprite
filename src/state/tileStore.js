export const PIXEL_COUNT = 64; // 8x8 sprite tile

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
  #tiles = [new Tile()];

  get tiles() {
    return this.#tiles;
  }
}

export const tileStore = new TileStore();
