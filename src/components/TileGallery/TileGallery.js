import styles from "./TileGallery.css?inline";
import { frameStore } from "../../state/frameStore.js";
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
        ${frameStore.selectedFrame.tiles
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
        frameStore.setSelectedTileIndex(Number(tile.dataset.index));
      });
    });
  }

  connectedCallback() {
    frameStore.addEventListener("change", this.#onFrameStoreChange);
    this.#onFrameStoreChange();
  }

  disconnectedCallback() {
    frameStore.removeEventListener("change", this.#onFrameStoreChange);
  }

  #onFrameStoreChange = () => {
    this.#tilePreviews.forEach((tilePreview, index) => {
      tilePreview.setAttribute(
        "pixels",
        encodePixels(frameStore.selectedFrame.tiles[index].pixels),
      );
    });
    this.#tileElements.forEach((tile) => {
      tile.classList.toggle(
        "selected",
        Number(tile.dataset.index) === frameStore.selectedTileIndex,
      );
    });
  };
}
customElements.define("tile-gallery", TileGallery);
