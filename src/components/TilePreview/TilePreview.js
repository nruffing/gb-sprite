import styles from "./TilePreview.css?inline";
import { tileStore, PIXEL_COUNT } from "../../state/tileStore.js";

const TILE_SIDE = 8;
const DEFAULT_SCALE = 4;
const EMPTY_PIXELS = new Array(PIXEL_COUNT).fill(0);

// Renders a tile to a <canvas> (rather than a grid of elements) so pixels
// sit adjacent with zero seams at any scale factor, including non-integer ones.
//
// Set the `tile-index` attribute to show that tile from tileStore; renders
// blank if unset.
class TilePreview extends HTMLElement {
  static get observedAttributes() {
    return ["scale", "tile-index", "flip-x", "flip-y"];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <canvas></canvas>
    `;
    this.canvas = shadow.querySelector("canvas");
  }

  connectedCallback() {
    tileStore.addEventListener("change", this.#onTileStoreChange);
    this.render();
  }

  disconnectedCallback() {
    tileStore.removeEventListener("change", this.#onTileStoreChange);
  }

  attributeChangedCallback() {
    this.render();
  }

  #onTileStoreChange = () => {
    this.render();
  };

  #resolvePixels() {
    const tileIndexAttr = this.getAttribute("tile-index");
    if (tileIndexAttr === null) {
      return EMPTY_PIXELS;
    }
    const tile = tileStore.tiles[Number(tileIndexAttr)];
    return tile ? tile.pixels : EMPTY_PIXELS;
  }

  render() {
    const scale = Number(this.getAttribute("scale")) || DEFAULT_SCALE;
    this.canvas.width = TILE_SIDE;
    this.canvas.height = TILE_SIDE;
    this.canvas.style.width = `${TILE_SIDE * scale}px`;
    this.canvas.style.height = `${TILE_SIDE * scale}px`;

    const ctx = this.canvas.getContext("2d");
    const computedStyle = getComputedStyle(this);
    const pixels = this.#resolvePixels();
    const flipX = this.hasAttribute("flip-x");
    const flipY = this.hasAttribute("flip-y");

    pixels.forEach((colorIndex, index) => {
      const x = index % TILE_SIDE;
      const y = Math.floor(index / TILE_SIDE);
      const drawX = flipX ? TILE_SIDE - 1 - x : x;
      const drawY = flipY ? TILE_SIDE - 1 - y : y;
      ctx.fillStyle = computedStyle.getPropertyValue(
        `--gbs-palette-${colorIndex}`,
      );
      ctx.fillRect(drawX, drawY, 1, 1);
    });
  }
}
customElements.define("tile-preview", TilePreview);
