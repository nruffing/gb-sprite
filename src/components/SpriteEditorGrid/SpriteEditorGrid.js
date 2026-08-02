import "../SpriteEditorGridCell/SpriteEditorGridCell.js";
import styles from "./SpriteEditorGrid.css?inline";

class SpriteEditorGrid extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const cellCount = 64; // 8x8 sprite tile
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="grid">
        ${Array.from({ length: cellCount })
          .map(
            () => /* html */ `
          <sprite-editor-grid-cell></sprite-editor-grid-cell>
        `,
          )
          .join("")}
      </div>
    `;
  }
}
customElements.define("sprite-editor-grid", SpriteEditorGrid);
