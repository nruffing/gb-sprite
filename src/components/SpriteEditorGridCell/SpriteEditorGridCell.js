import styles from "./SpriteEditorGridCell.css?inline";
import { paletteStore } from "../../state/paletteStore.js";
import { pointerState } from "../../state/pointerState.js";
import { frameStore } from "../../state/frameStore.js";

class SpriteEditorGridCell extends HTMLElement {
  #index;
  #cell;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div></div>
    `;

    this.#cell = shadow.querySelector("div");
    this.#index = Number(this.getAttribute("index"));

    const paint = () => {
      frameStore.setPixel(this.#index, paletteStore.selectedColorIndex);
    };

    this.#cell.addEventListener("pointerdown", paint);
    this.#cell.addEventListener("pointerenter", () => {
      if (pointerState.isDown) paint();
    });
  }

  connectedCallback() {
    frameStore.addEventListener("change", this.#render);
    this.#render();
  }

  disconnectedCallback() {
    frameStore.removeEventListener("change", this.#render);
  }

  #render = () => {
    const tile = frameStore.selectedFrame.tiles[frameStore.selectedTileIndex];
    const colorIndex = tile ? tile.pixels[this.#index] : 0;
    this.#cell.className = `filled-${colorIndex}`;
  };
}
customElements.define("sprite-editor-grid-cell", SpriteEditorGridCell);
