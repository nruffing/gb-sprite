import styles from "./SpriteEditorGridCell.css?inline";

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
      cell.classList.toggle("filled-3");
    });
  }
}
customElements.define("sprite-editor-grid-cell", SpriteEditorGridCell);
