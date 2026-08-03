import styles from "./TileGallery.css?inline";

class TileGallery extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div></div>
    `;
  }
}
customElements.define("tile-gallery", TileGallery);
