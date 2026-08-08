import "../SpriteEditorGridCell/SpriteEditorGridCell.js";
import styles from "./SpriteEditorGrid.css?inline";
import { PIXEL_COUNT } from "../../state/frameStore.js";

class SpriteEditorGrid extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="grid">
        ${Array.from({ length: PIXEL_COUNT })
          .map(
            (_, index) => /* html */ `
          <sprite-editor-grid-cell index="${index}"></sprite-editor-grid-cell>
        `,
          )
          .join("")}
      </div>
    `;
  }
}
customElements.define("sprite-editor-grid", SpriteEditorGrid);
