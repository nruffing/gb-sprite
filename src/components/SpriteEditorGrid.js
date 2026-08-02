class SpriteEditorGrid extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <div>test</div>
    `;
  }
}
customElements.define("sprite-editor-grid", SpriteEditorGrid);
