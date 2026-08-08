import styles from "./TileGallery.css?inline";
import { tileStore } from "../../state/tileStore";

class TileGallery extends HTMLElement {
  #tiles = tileStore.tiles;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="gallery">
        ${this.#tiles
          .map(
            (_tile, index) => /* html */ `
          <tile-preview scale="10" tile-index="${index}"></tile-preview>
          `,
          )
          .join("")}
      </div>
    `;
  }
}
customElements.define("tile-gallery", TileGallery);
