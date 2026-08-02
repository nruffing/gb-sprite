class PointerState extends EventTarget {
  #isDown = false;

  get isDown() {
    return this.#isDown;
  }

  setDown(isDown) {
    this.#isDown = isDown;
  }
}

export const pointerState = new PointerState();

window.addEventListener("pointerdown", () => pointerState.setDown(true));
window.addEventListener("pointerup", () => pointerState.setDown(false));
