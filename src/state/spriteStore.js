import { Tile } from "./tileStore";

class SpriteStore extends EventTarget {
  #tile = new Tile();

  get pixels() {
    return this.#tile.pixels;
  }

  setPixel(index, colorIndex) {
    this.#tile.setPixel(index, colorIndex);
    this.dispatchEvent(
      new CustomEvent("change", { detail: { pixels: this.pixels } }),
    );
  }
}

export const spriteStore = new SpriteStore();
