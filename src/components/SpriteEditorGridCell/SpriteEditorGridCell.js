import styles from "./SpriteEditorGridCell.css?inline";
import { paletteStore } from "../../state/paletteStore.js";
import { pointerState } from "../../state/pointerState.js";

class SpriteEditorGridCell extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div></div>
    `;

    const cell = shadow.querySelector("div");
    const paint = () => {
      cell.className = `filled-${paletteStore.selectedColorIndex}`;
    };

    cell.addEventListener("pointerdown", paint);
    cell.addEventListener("pointerenter", () => {
      if (pointerState.isDown) paint();
    });
  }
}
customElements.define("sprite-editor-grid-cell", SpriteEditorGridCell);
