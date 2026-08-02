import styles from "./SpriteEditorGridCell.css?inline";
import { paletteStore } from "../../state/paletteStore.js";

class SpriteEditorGridCell extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div></div>
    `;

    const cell = shadow.querySelector("div");
    cell.addEventListener("click", () => {
      cell.className = `filled-${paletteStore.selectedColorIndex}`;
    });
  }
}
customElements.define("sprite-editor-grid-cell", SpriteEditorGridCell);
