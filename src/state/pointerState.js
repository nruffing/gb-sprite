export class PointerState extends EventTarget {
  #isDown = false;

  get isDown() {
    return this.#isDown;
  }

  setDown(isDown) {
    this.#isDown = isDown;
  }

  // Wires up pointerdown/pointerup listeners on `target` that keep isDown in
  // sync. Separate from the constructor (and not called at module load)
  // specifically so this module can be imported — and PointerState unit
  // tested — without touching `window`; app startup calls this once (see
  // main.js) instead.
  attach(target = window) {
    target.addEventListener("pointerdown", () => this.setDown(true));
    target.addEventListener("pointerup", () => this.setDown(false));
  }
}

export const pointerState = new PointerState();
