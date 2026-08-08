import styles from "./TileGallery.css?inline";
import { tileStore } from "../../state/tileStore";
import { encodePixels } from "../TilePreview/pixelsAttribute.js";

class TileGallery extends HTMLElement {
  #tileElements;
  #tilePreviews;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <div class="gallery">
        ${tileStore.tiles
          .map(
            (tile, index) => /* html */ `
          <div class="tile" data-index="${index}">
            <tile-preview scale="10" pixels="${encodePixels(tile.pixels)}"></tile-preview>
            <div class="overlay"></div>
          </div>
          `,
          )
          .join("")}
      </div>
    `;
    this.#tileElements = shadow.querySelectorAll(".tile");
    this.#tilePreviews = shadow.querySelectorAll("tile-preview");
    this.#tileElements.forEach((tile) => {
      tile.addEventListener("click", () => {
        tileStore.setSelectedTileIndex(Number(tile.dataset.index));
      });
    });
  }

  connectedCallback() {
    tileStore.addEventListener("change", this.#onTileStoreChange);
    this.#onTileStoreChange();
  }

  disconnectedCallback() {
    tileStore.removeEventListener("change", this.#onTileStoreChange);
  }

  #onTileStoreChange = () => {
    this.#tilePreviews.forEach((tilePreview, index) => {
      tilePreview.setAttribute(
        "pixels",
        encodePixels(tileStore.tiles[index].pixels),
      );
    });
    this.#tileElements.forEach((tile) => {
      tile.classList.toggle(
        "selected",
        Number(tile.dataset.index) === tileStore.selectedTileIndex,
      );
    });
  };
}
customElements.define("tile-gallery", TileGallery);
