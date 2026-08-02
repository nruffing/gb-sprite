export const PIXEL_COUNT = 64; // 8x8 sprite tile

class SpriteStore extends EventTarget {
  #pixels = new Array(PIXEL_COUNT).fill(0);

  get pixels() {
    return this.#pixels;
  }

  setPixel(index, colorIndex) {
    this.#pixels[index] = colorIndex;
    this.dispatchEvent(
      new CustomEvent("change", { detail: { pixels: this.#pixels } }),
    );
  }
}

export const spriteStore = new SpriteStore();
