import styles from "./TilePreview.css?inline";
import { spriteStore } from "../../state/spriteStore.js";

const TILE_SIDE = 8;
const DEFAULT_SCALE = 4;

// Renders a tile to a <canvas> (rather than a grid of elements) so pixels
// abut with zero seams at any scale factor, including non-integer ones.
//
// Defaults to mirroring the sprite currently being edited. Setting `.pixels`
// explicitly (e.g. to preview a gallery tile) detaches it from spriteStore.
class TilePreview extends HTMLElement {
  static get observedAttributes() {
    return ["scale"];
  }

  #pixels = spriteStore.pixels;
  #followingSpriteStore = true;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = /* html */ `
      <style>${styles}</style>
      <canvas></canvas>
    `;
    this.canvas = shadow.querySelector("canvas");
  }

  get pixels() {
    return this.#pixels;
  }

  set pixels(pixels) {
    this.#followingSpriteStore = false;
    this.#pixels = pixels;
    this.render();
  }

  connectedCallback() {
    spriteStore.addEventListener("change", this.#onSpriteChange);
    this.render();
  }

  disconnectedCallback() {
    spriteStore.removeEventListener("change", this.#onSpriteChange);
  }

  attributeChangedCallback() {
    this.render();
  }

  #onSpriteChange = ({ detail }) => {
    if (!this.#followingSpriteStore) return;
    this.#pixels = detail.pixels;
    this.render();
  };

  render() {
    const scale = Number(this.getAttribute("scale")) || DEFAULT_SCALE;
    this.canvas.width = TILE_SIDE;
    this.canvas.height = TILE_SIDE;
    this.canvas.style.width = `${TILE_SIDE * scale}px`;
    this.canvas.style.height = `${TILE_SIDE * scale}px`;

    const ctx = this.canvas.getContext("2d");
    const computedStyle = getComputedStyle(this);

    this.#pixels.forEach((colorIndex, index) => {
      ctx.fillStyle = computedStyle.getPropertyValue(
        `--gbs-palette-${colorIndex}`,
      );
      ctx.fillRect(index % TILE_SIDE, Math.floor(index / TILE_SIDE), 1, 1);
    });
  }
}
customElements.define("tile-preview", TilePreview);
