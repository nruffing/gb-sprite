import styles from "./SpriteEditorGridCell.css?inline";

class SpriteEditorGridCell extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div></div>
    `;
  }
}
customElements.define("sprite-editor-grid-cell", SpriteEditorGridCell);
