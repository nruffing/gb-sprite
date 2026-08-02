export const PALETTE_SIZE = 4;

class PaletteStore extends EventTarget {
  #selectedColorIndex;

  constructor(initialIndex) {
    super();
    this.#selectedColorIndex = initialIndex;
  }

  get selectedColorIndex() {
    return this.#selectedColorIndex;
  }

  isValidColorIndex(index) {
    return Number.isInteger(index) && index >= 0 && index < PALETTE_SIZE;
  }

  setSelectedColorIndex(index) {
    if (!this.isValidColorIndex(index)) return;

    this.#selectedColorIndex = index;
    this.dispatchEvent(
      new CustomEvent("change", { detail: { selectedColorIndex: index } }),
    );
  }
}

export const paletteStore = new PaletteStore(3);
