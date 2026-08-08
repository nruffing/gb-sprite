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
          <div class="tile" data-index="${index}">
            <tile-preview scale="10" tile-index="${index}"></tile-preview>
            <div class="overlay"></div>
          </div>
          `,
          )
          .join("")}
      </div>
    `;
    this.tileElements = shadow.querySelectorAll(".tile");
    this.tileElements.forEach((tile) => {
      tile.addEventListener("click", () => {
        tileStore.setSelectedTileIndex(Number(tile.dataset.index));
      });
    });
  }

  connectedCallback() {
    tileStore.addEventListener("change", this.#updateSelected);
    this.#updateSelected();
  }

  disconnectedCallback() {
    tileStore.removeEventListener("change", this.#updateSelected);
  }

  #updateSelected = () => {
    this.tileElements.forEach((tile) => {
      tile.classList.toggle(
        "selected",
        Number(tile.dataset.index) === tileStore.selectedTileIndex,
      );
    });
  };
}
customElements.define("tile-gallery", TileGallery);
